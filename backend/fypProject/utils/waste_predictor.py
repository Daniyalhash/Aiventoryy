import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression, Lasso
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_squared_error
from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime
import warnings
import gridfs
import joblib
from bson import Binary
import joblib
from bson import Binary
import tempfile
# warnings.filterwarnings('ignore')

class AIWasteReducer:
    _cache = {}  # Class-level cache for model and preprocessor per user

    def __init__(self, user_id):
        self.model = None
        self.user_id = user_id
        self.preprocessor = None
        self.client = MongoClient("mongodb+srv://syeddaniyalhashmi123:test123@cluster0.dutvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        self.db = self.client["FYP"]
        self.trained_model_waste = self.db["WasteForecasting"]
        self.df = self._get_data_from_db()
        self._ensure_preprocessed()
        self.fs = gridfs.GridFS(self.db)  # Use GridFS for storing large files

    def _get_data_from_db(self):
        print("⚡️ [FAST] Fetching minimal required data...")
        today_str = datetime.utcnow().strftime("%Y-%m-%d")

        pipeline = [
            {"$match": {"user_id": ObjectId(self.user_id)}},
            {"$unwind": "$products"},
            {
            "$match": {
                "products.expirydate": {"$gt": today_str}  # Filter non-expired products
            }
            },
            {"$project": {
                "_id": 0,
                "product_id": "$products.productname_id",
                "productname":"$products.productname",
                "category": "$products.category",
                "stockquantity": "$products.stockquantity",
                "expirydate": "$products.expirydate",
                "monthly_sales": "$products.monthly_sales"
            }}
        ]

        print("🧠 Streaming data from MongoDB...")
        start_time = datetime.now()

        cursor = self.db['products'].aggregate(pipeline, batchSize=5000, allowDiskUse=True)

    # ⚠️ Important fix: Convert cursor to list before DataFrame
        data = list(cursor)
        df = pd.DataFrame(data)
        duration = (datetime.now() - start_time).total_seconds()
        print(f"🧻 Loaded {len(df)} products in {duration:.2f} seconds")
        print("📊 Columns after load:", df.columns.tolist())
        print("🔍 First row:")
        print(df.head(1))
        if df.empty:
            raise ValueError("🚫 No products found for this user.")

        
        required_cols = ['monthly_sales', 'category', 'stockquantity', 'expirydate',"product_id","productname"]
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            raise ValueError(f"❌ Missing columns in data: {missing_cols}")
        df['stockquantity'] = pd.to_numeric(df['stockquantity'], errors='coerce').fillna(0)
        df['monthly_sales'] = pd.to_numeric(df['monthly_sales'], errors='coerce').fillna(0)
        return df
    


    def _ensure_preprocessed(self):
        """Run preprocess once and store result"""
        if not hasattr(self, '_preprocessed_df'):
            self._preprocessed_df = self.preprocess()

        
        
    
    def preprocess(self):
        """Preprocess once and reuse"""
        print("🔄 Preprocessing data...")
        df = self.df.copy()
        print("📊 Columns before preprocessing:", df.columns.tolist())

        # Convert expiry date
        df['expirydate'] = pd.to_datetime(df['expirydate'], errors='coerce')
        now = datetime.now()
        df['days_until_expiry'] = (df['expirydate'] - now).dt.days.clip(lower=1)
        df['timespan_months'] = df['days_until_expiry'] / 30.0

        # Estimate units sold before expiry
        df['units_will_sell_before_expiry'] = df['monthly_sales'] * df['timespan_months']

        # Fill missing values
        df.fillna({
            'days_until_expiry': 1,
            'timespan_months': 0.1,
            'units_will_sell_before_expiry': 0
        }, inplace=True)
        print("preprocessing completed")
        print("📊 Columns after load:", df.columns.tolist())

        print("✅ Preprocessing completed.")
        return df[['product_id','productname' ,'category','expirydate', 'stockquantity', 'monthly_sales', 'timespan_months', 'units_will_sell_before_expiry']]

    def save_model_and_preprocessor_to_mongo(self, model, preprocessor, model_name="aiwaste_model", preprocessor_name="aiwaste_preprocessor"):
        """Save the model and preprocessor to MongoDB using GridFS"""
        def save_object(obj, name):
            with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                joblib.dump(obj, tmp_file.name)
                tmp_file.seek(0)
                obj_bytes = tmp_file.read()
            file_id = self.fs.put(obj_bytes, filename=name, user_id=self.user_id)
            self.db.trained_model.update_one(
                {"user_id": self.user_id, "model_name": name},
                {"$set": {"model_file_id": file_id}},
                upsert=True
            )

        save_object(model, model_name)
        save_object(preprocessor, preprocessor_name)
        print("✅ Model and preprocessor saved to MongoDB successfully.")

    def load_model_and_preprocessor_from_mongo(self):
        """Load AIWasteReducer model and preprocessor pipeline from MongoDB"""

        print("📦 Loading AIWasteReducer model from MongoDB...")

        model_data = self.db.trained_model.find_one({"user_id": self.user_id, "model_name": "aiwaste_model"})
        if not model_data:
            raise ValueError("🚫 No saved model found for this user.")

        model_file_id = model_data["model_file_id"]
        model_bytes = self.fs.get(model_file_id).read()

        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            tmp_file.write(model_bytes)
            tmp_file.seek(0)
            self.model = joblib.load(tmp_file.name)

        print("✅ Model loaded successfully.")
        return self.model  # Return the loaded model
    def is_aiwaste_model_already_trained(self):
        """Check if AIWasteReducer model already exists in MongoDB"""
        return self.db.trained_model.find_one({"user_id": self.user_id, "model_name": "aiwaste_model"}) is not None
    


    def train(self):
        """Train the model with caching"""
        print("🧠 Training model...")

        cache_key = f"model_{self.user_id}"
        if cache_key in AIWasteReducer._cache:
            print("🔁 Reusing cached model...")
            self.model = AIWasteReducer._cache[cache_key]
            return self.model
        df = self._preprocessed_df

        X = df[['monthly_sales', 'category', 'stockquantity', 'timespan_months']]
        print("🔍 Columns in df:", df.columns.tolist())

        y = df['units_will_sell_before_expiry']

        # Define preprocessing pipeline
        preprocessor = ColumnTransformer([
            ('num', StandardScaler(), ['monthly_sales', 'stockquantity', 'timespan_months']),
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['category'])
        ])

        model = Pipeline([
            ('preprocessor', preprocessor),
            ('model', RandomForestRegressor(n_estimators=100, random_state=42))
        ])

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model.fit(X_train, y_train)

        preds = model.predict(X_test)

        # Evaluate model
        mse = mean_squared_error(y_test, preds)
        r2 = r2_score(y_test, preds)

        print(f"Model trained successfully.")
        print(f"MSE: {mse:.2f}")
        print(f"R² Score (Accuracy): {r2:.4f}")
        print(f"✅ Trained | MSE: {mse:.2f} | R²: {r2:.2f}")

        self.model = model
        AIWasteReducer._cache[cache_key] = model
        # Extract the fitted preprocessor
        fitted_preprocessor = model.named_steps['preprocessor']

        # Save both to MongoDB
        self.save_model_and_preprocessor_to_mongo(model, fitted_preprocessor)
        return self.model

    

    def predict_and_flag(self, product):
        df = pd.DataFrame([product])
        print("start predicting")
        start_time = datetime.now()


  
       
        # ✅ Safeguard against missing 'expirydate'
        if 'expirydate' not in df.columns or pd.isnull(df.at[0, 'expirydate']):
            raise ValueError("❌ Missing 'expirydate' in product data. Cannot forecast without it.")
        # Ensure expirydate is parsed properly
        df['expirydate'] = pd.to_datetime(df['expirydate'], errors='coerce')
        df['days_until_expiry'] = (df['expirydate'] - datetime.now()).dt.days.clip(lower=1)
        df['timespan_months'] = df['days_until_expiry'] / 30.0

        X = df[['monthly_sales', 'category', 'stockquantity', 'timespan_months']]
        predicted_units = self.model.predict(X)[0]
        remaining_stock = product['stockquantity'] - predicted_units
        suggest_discount = remaining_stock > 0
        print("just fninsh predicting")

        waste_ratio = remaining_stock / product['stockquantity']
        risk_level = self.classify_risk_level(waste_ratio)

        action_suggestion = self.suggest_action(risk_level, remaining_stock)
        discount_suggestion = self.suggest_discount(risk_level, remaining_stock)
        print("📅 Current time:", datetime.now())
        print("📅 Expiry date:", df['expirydate'].iloc[0])
        print("⏳ Days until expiry:", df['days_until_expiry'].iloc[0])
        print("📆 Time span in months:", df['timespan_months'].iloc[0])

        # Prepare input features
        X = df[['monthly_sales', 'category', 'stockquantity', 'timespan_months']]
        print("📊 Input features for model:")
        print("🔮 Predicted units will sell before expiry:", predicted_units)
        print("📦 Stock quantity:", product['stockquantity'])
        print("📉 Remaining stock after forecast:", remaining_stock)
        print("🏷️ Suggest discount:", "Yes" if suggest_discount else "No")
        print("⚠️ Waste ratio:", round(waste_ratio, 2))
        print("🚩 Risk level:", risk_level)
        
        print("💡 Action suggestion:", action_suggestion)
        print("💸 Discount suggestion:", discount_suggestion["suggestion"])

        print("✅ Prediction complete\n")
        
        
        duration = (datetime.now() - start_time).total_seconds()
        print(f"🧻 Loaded {len(df)} products in {duration:.2f} seconds")
        return {
            "productname": product.get('productname', 'Unknown'),
            "predicted_units_will_sell_before_expiry": round(predicted_units, 2),
            "suggest_discount": suggest_discount,
            "remaining_stock_after_forecast": round(remaining_stock, 2),
            "flagged_for_action": suggest_discount,
            "risk_level": risk_level,
            "action_suggestion": action_suggestion,
            "discount_suggestion": discount_suggestion,
            "waste_ratio": round(waste_ratio, 2)
        }

    def predict_all(self,df=None):
        """
        Run predictions on the entire dataset
        """
        print("📊 Running predict_all() on full dataset...")
        start_time = datetime.now()
        if df is None:
            print("Data frame is empty")
        print("Columns",df.columns.tolist())
        X = df[['monthly_sales', 'category', 'stockquantity', 'timespan_months']]
        df['prediction'] = self.model.predict(X)
        df['remaining_stock'] = df['stockquantity'] - df['prediction']
        df['waste_ratio'] = df['remaining_stock'] / df['stockquantity']
        df['risk_level'] = df['waste_ratio'].apply(self.classify_risk_level)

        df['action_suggestion'] = df.apply(
            lambda row: self.suggest_action(row['risk_level'], row['remaining_stock']), axis=1
        )

        df['discount_suggestion'] = df.apply(
            lambda row: self.suggest_discount(row['risk_level'], row['remaining_stock']), axis=1
        )

        duration = (datetime.now() - start_time).total_seconds()
        print(f"✅ predict_all() completed in {duration:.2f} seconds")

        # 🧾 Select only relevant output columns
        result_df = df[[
            'product_id','productname','category', 'stockquantity', 'expirydate',
            'prediction', 'remaining_stock', 'waste_ratio', 'risk_level',
            'action_suggestion', 'discount_suggestion'
        ]]

        return result_df
    def classify_risk_level(self, waste_ratio):
        if waste_ratio > 0.5:
            return "🔴 High"
        elif waste_ratio > 0.2:
            return "🟠 Medium"
        else:
            return "🟢 Low"

    def suggest_action(self, risk_level, remaining_stock):
        if risk_level == "🔴 High":
            return f"💡 Apply 30% discount on {int(remaining_stock)} units"
        elif risk_level == "🟠 Medium":
            return "💡 Flash sale or bundle offer"
        else:
            return "–"

    def suggest_discount(self, risk_level, remaining_stock):
        """
        Returns structured discount suggestion
        """
        if risk_level == "🔴 High":
            quantity = int(min(remaining_stock, 50))  # Cap at 50 for example
            return {
                "apply_now": True,
                "percent_off": 30,
                "on_quantity": quantity,
                "reason": "High waste risk",
                "suggestion": f"Apply 30% off on {quantity} units now"
            }
        elif risk_level == "🟠 Medium":
            return {
                "apply_now": False,
                "percent_off": 15,
                "on_quantity": int(remaining_stock * 0.5),
                "reason": "Moderate risk – consider soon",
                "suggestion": f"Suggest 15% off on {int(remaining_stock * 0.5)} units"
            }
        else:
            return {
                "apply_now": False,
                "percent_off": 0,
                "on_quantity": 0,
                "reason": "Low risk",
                "suggestion": "No discount needed"
            }

    def predict_by_product_id(self, product_id_column, product_id_value):
        """
        Predict for a specific product using its ID
        Example: predict_by_product_id("productname_id", "P12345")
        """
        product_row = self.df[self.df[product_id_column] == product_id_value].iloc[0]
        product_dict = product_row.to_dict()
        return self.predict_and_flag(product_dict)

    

    def get_clearance_list(self):
        """
        Get only high-risk products
        """
        all_predictions = self.predict_all()
        return all_predictions[all_predictions['risk_level'] == "🔴 High"]