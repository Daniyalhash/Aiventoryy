# import pandas as pd
# import numpy as np
# import joblib
# from sklearn.model_selection import train_test_split
# from sklearn.preprocessing import StandardScaler, OneHotEncoder
# from sklearn.compose import ColumnTransformer
# from sklearn.linear_model import LinearRegression, Lasso
# from sklearn.ensemble import RandomForestRegressor
# import xgboost as xgb
# from sklearn.pipeline import Pipeline
# from sklearn.metrics import r2_score
# from pymongo import MongoClient
# from bson import ObjectId
# import os
# from datetime import datetime
# import warnings
# import gridfs
# import joblib
# from bson import Binary
# import joblib
# from bson import Binary
# import tempfile
# warnings.filterwarnings('ignore')

# class DemandPredictor:
#     def __init__(self, user_id):
#         self.user_id = user_id
#         self.client = MongoClient("mongodb+srv://syeddaniyalhashmi123:test123@cluster0.dutvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
#         self.db = self.client["FYP"]
#         self.forecasting_collection = self.db["forecasting"]
#         self.fs = gridfs.GridFS(self.db)  # Use GridFS for storing large files

    
#     def load_user_data(self):
#         """Fetch forecasting data for the given user_id"""
#         print("load data set ",self.user_id)
#         # Debugging: Check if user_id is valid
#         try:
#             user_object_id = ObjectId(self.user_id)
#         except Exception as e:
#             print(f"Invalid ObjectId format: {e}")
#             return pd.DataFrame()  # Return empty DataFrame if invalid ID

#         # Check if user exists
#         user_data = self.db.users.find_one({"_id": user_object_id})
        
#         if not user_data:
#             print("User not found in database!")  # Debugging output
#             return pd.DataFrame()

#         # Fetch all forecasting data for this user_id
#         data = list(self.db.forecasting.find({"user_id": user_object_id}))
#         if not data:
#             print("No forecasting data found for this user_id!")
#             return pd.DataFrame()

#     # Check if data is stored as an array inside a document
#         if len(data) == 1 and "forecasting" in data[0]:
#             data = data[0]["forecasting"]
#             # print(data)
#         print(f"Dataset Length: {len(data)}")
#         return pd.DataFrame(data)

#     def preprocess_data(self, df):
       
            
#         df['sale_date'] = pd.to_datetime(df['sale_date'])
#         df['year'] = df['sale_date'].dt.year
#         df['month'] = df['sale_date'].dt.month.astype(str)
#         df['season'] = df['season'].astype(str)
        
#         # Feature Engineering
#         df['prev_1_month_sales'] = df.groupby('productname_id')['monthly_sales'].shift(1)
#         df['prev_2_month_sales'] = df.groupby('productname_id')['monthly_sales'].shift(2)
#         df['prev_3_month_sales'] = df.groupby('productname_id')['monthly_sales'].shift(3)
#         df['rolling_avg_3m'] = df.groupby('productname_id')['monthly_sales'].rolling(3).mean().reset_index(0, drop=True)
#         df['rolling_avg_6m'] = df.groupby('productname_id')['monthly_sales'].rolling(6).mean().reset_index(0, drop=True)
#         df['sales_diff_1m'] = df['prev_1_month_sales'] - df['prev_2_month_sales']
#         df.fillna(0, inplace=True)
        
#         return df
    
#     def save_models_to_mongo(self, model, model_name):
#         """Save a single model to MongoDB"""
#         # Serialize the model and save to a temporary file
#         with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
#             joblib.dump(model, tmp_file.name)
#             tmp_file.seek(0)
#             model_bytes = tmp_file.read()
    
#         # Save the model binary data into GridFS
#         model_file = self.fs.put(model_bytes, filename=model_name, user_id=self.user_id)
#         # Store model file ID in a separate document
#         self.db.trained_model.insert_one({
#             "user_id": self.user_id,
#             "model_name": model_name,
#             "model_file_id": model_file
#         })
#         print(f"{model_name} saved successfully.")

#     def load_models_from_mongo(self):
#         """Load all models from MongoDB using GridFS"""
#         # Fetch the model data from the database
#         model_data = self.db.trained_model.find_one({"user_id": self.user_id, "model_name": "best_model"})
        
#         if not model_data:
#             print("No model found in database")
#             return None

#         # Retrieve the model file ID from the database
#         model_file_id = model_data["model_file_id"]
        
#         # Fetch the model binary data from GridFS
#         model_bytes = self.fs.get(model_file_id).read()
        
#         # Load the model from the binary data
#         with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
#             tmp_file.write(model_bytes)  # Write the binary data to a temp file
#             tmp_file.seek(0)
#             model = joblib.load(tmp_file.name)  # Load the model from the temp file

#         # Also load the preprocessor if needed (same process as the model)
#         preprocessor_file_id = self.db.trained_model.find_one({"user_id": self.user_id, "model_name": "preprocessor"})["model_file_id"]
#         preprocessor_bytes = self.fs.get(preprocessor_file_id).read()
#         with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
#             tmp_file.write(preprocessor_bytes)
#             tmp_file.seek(0)
#             preprocessor = joblib.load(tmp_file.name)

#         return {"best_model": model, "preprocessor": preprocessor}

#     def is_model_already_trained(self):
#         """Check if model already exists for the user"""
#         return self.db.trained_model.find_one({"user_id": self.user_id, "model_name": "final_model"}) is not None
#     def train_models(self):
#         """Train and save all models"""
        
#         df = self.preprocess_data(self.load_user_data())
        
#         feature_cols = ['month', 'season', 'prev_1_month_sales', 'prev_2_month_sales', 
#                        'prev_3_month_sales', 'rolling_avg_3m', 'rolling_avg_6m', 'sales_diff_1m']
#         X = df[feature_cols]
#         y = df['monthly_sales']
        
#         # Split data
#         X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
#         # Preprocessing
#         num_features = ['prev_1_month_sales', 'prev_2_month_sales', 'prev_3_month_sales', 
#                         'rolling_avg_3m', 'rolling_avg_6m', 'sales_diff_1m']
#         cat_features = ['month', 'season']
        
#         preprocessor = ColumnTransformer(
#             transformers=[
#                 ('num', StandardScaler(), num_features),
#                 ('cat', OneHotEncoder(handle_unknown='ignore'), cat_features)
#             ]
#         )
        
#         # Fit preprocessor and save
#         preprocessor.fit(X_train)
        
#         # Prepare transformed data
#         X_train_transformed = preprocessor.transform(X_train)
#         X_test_transformed = preprocessor.transform(X_test)
        
#         # Initialize models
#         models = {
#             'linear': LinearRegression(),
#             'lasso': Lasso(alpha=0.1),
#             'random_forest': RandomForestRegressor(n_estimators=200, max_depth=15, min_samples_split=2, random_state=42),
#             'xgboost': xgb.XGBRegressor(objective='reg:squarederror', n_estimators=200, 
#                                       learning_rate=0.1, max_depth=5, subsample=0.8, 
#                                       colsample_bytree=0.8, random_state=42)
#         }
        
#         best_model = None
#         best_r2 = -np.inf  # Start with a very low R2 value

#         for name, model in models.items():
#             model.fit(X_train_transformed, y_train)
#             y_pred = model.predict(X_test_transformed)
#             r2 = r2_score(y_test, y_pred)
#             print(f"{name} model trained with R2: {r2}")

#             if r2 > best_r2:
#                 best_r2 = r2
#                 best_model = model

#         # Save the best model
#         if best_model:
#             self.save_models_to_mongo(preprocessor, "preprocessor")

#             self.save_models_to_mongo(best_model, "best_model")
#             print(f"Best model saved with R2: {best_r2}")
        
#         return {"status": "success", "message": "Best model trained and saved to MongoDB"}
#     def predict_sales(self, product_data):
#         """Predict sales using specified model type"""
#         models = self.load_models_from_mongo()
#         if not models:
#             raise ValueError("No models trained yet")
#             # Get the best model
#         best_model = models.get("best_model")  # Load the best model
#         if not best_model:
#             raise ValueError("Best model not found")

#         # Load the preprocessors
#         preprocessor = models.get("preprocessor")
#         if not preprocessor:
#             raise ValueError("Preprocessor not found") # Get the preprocess
#         input_df = pd.DataFrame([{
#             'month': str(datetime.now().month),
#             'season': product_data['season'],
#             'prev_1_month_sales': product_data['prev_month_sales'],
#             'prev_2_month_sales': product_data['prev_2_month_sales'],
#             'prev_3_month_sales': product_data['prev_3_month_sales'],
#             'rolling_avg_3m': product_data['rolling_avg_3m'],
#             'rolling_avg_6m': product_data['rolling_avg_6m'],
#             'sales_diff_1m': product_data['sales_diff_1m']
#         }])
        
#         # Transform and predict
#         input_transformed = preprocessor.transform(input_df)
#         prediction = best_model.predict(input_transformed)
        
#         return {
#             'prediction': float(prediction[0]),
#             'model_used': 'best_model'}


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
from sklearn.metrics import r2_score
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
warnings.filterwarnings('ignore')

class DemandPredictor:
    def __init__(self, user_id):
        self.user_id = user_id
        self.client = MongoClient("mongodb+srv://syeddaniyalhashmi123:test123@cluster0.dutvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        self.db = self.client["FYP"]
        self.forecasting_collection = self.db["forecasting"]
        self.fs = gridfs.GridFS(self.db)  # Use GridFS for storing large files

    
    def load_user_data(self):
        """Fetch forecasting data for the given user_id"""
        print("load data set ",self.user_id)
        # Debugging: Check if user_id is valid
        try:
            user_object_id = ObjectId(self.user_id)
        except Exception as e:
            print(f"Invalid ObjectId format: {e}")
            return pd.DataFrame()  # Return empty DataFrame if invalid ID

        # Check if user exists
        user_data = self.db.users.find_one({"_id": user_object_id})
        
        if not user_data:
            print("User not found in database!")  # Debugging output
            return pd.DataFrame()

        # Fetch all forecasting data for this user_id
        data = list(self.db.forecasting.find({"user_id": user_object_id}))
        if not data:
            print("No forecasting data found for this user_id!")
            return pd.DataFrame()

    # Check if data is stored as an array inside a document
        if len(data) == 1 and "forecasting" in data[0]:
            data = data[0]["forecasting"]
            # print(data)
        print(f"Dataset Length: {len(data)}")
        return pd.DataFrame(data)

    def preprocess_data(self, df):
       
            
        df['sale_date'] = pd.to_datetime(df['sale_date'])
        df['year'] = df['sale_date'].dt.year
        df['month'] = df['sale_date'].dt.month.astype(str)
        df['season'] = df['season'].astype(str)
        
        # Feature Engineering
        df['prev_1_month_sales'] = df.groupby('productname_id')['monthly_sales'].shift(1)
        df['prev_2_month_sales'] = df.groupby('productname_id')['monthly_sales'].shift(2)
        df['prev_3_month_sales'] = df.groupby('productname_id')['monthly_sales'].shift(3)
        df['rolling_avg_3m'] = df.groupby('productname_id')['monthly_sales'].rolling(3).mean().reset_index(0, drop=True)
        df['rolling_avg_6m'] = df.groupby('productname_id')['monthly_sales'].rolling(6).mean().reset_index(0, drop=True)
        df['sales_diff_1m'] = df['prev_1_month_sales'] - df['prev_2_month_sales']
        df.fillna(0, inplace=True)
        
        return df
    
    def save_models_to_mongo(self, model, model_name):
        """Save a single model to MongoDB"""
        # Serialize the model and save to a temporary file
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            joblib.dump(model, tmp_file.name)
            tmp_file.seek(0)
            model_bytes = tmp_file.read()
    
        # Save the model binary data into GridFS
        model_file = self.fs.put(model_bytes, filename=model_name, user_id=self.user_id)
        # Store model file ID in a separate document
        self.db.trained_model.insert_one({
            "user_id": self.user_id,
            "model_name": model_name,
            "model_file_id": model_file
        })
        print(f"{model_name} saved successfully.")

    def load_models_from_mongo(self):
        """Load all models from MongoDB using GridFS"""
        # Fetch the model data from the database
        model_data = self.db.trained_model.find_one({"user_id": self.user_id, "model_name": "best_model"})
        
        if not model_data:
            print("No model found in database")
            return None

        # Retrieve the model file ID from the database
        model_file_id = model_data["model_file_id"]
        
        # Fetch the model binary data from GridFS
        model_bytes = self.fs.get(model_file_id).read()
        
        # Load the model from the binary data
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            tmp_file.write(model_bytes)  # Write the binary data to a temp file
            tmp_file.seek(0)
            model = joblib.load(tmp_file.name)  # Load the model from the temp file

        # Also load the preprocessor if needed (same process as the model)
        preprocessor_file_id = self.db.trained_model.find_one({"user_id": self.user_id, "model_name": "preprocessor"})["model_file_id"]
        preprocessor_bytes = self.fs.get(preprocessor_file_id).read()
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            tmp_file.write(preprocessor_bytes)
            tmp_file.seek(0)
            preprocessor = joblib.load(tmp_file.name)

        return {"best_model": model, "preprocessor": preprocessor}

    def is_model_already_trained(self):
        """Check if model already exists for the user"""
        return self.db.trained_model.find_one({"user_id": self.user_id, "model_name": "final_model"}) is not None
    def train_models(self):
        """Train and save all models"""
        
        df = self.preprocess_data(self.load_user_data())
        
        feature_cols = ['month', 'season', 'prev_1_month_sales', 'prev_2_month_sales', 
                       'prev_3_month_sales', 'rolling_avg_3m', 'rolling_avg_6m', 'sales_diff_1m']
        X = df[feature_cols]
        y = df['monthly_sales']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Preprocessing
        num_features = ['prev_1_month_sales', 'prev_2_month_sales', 'prev_3_month_sales', 
                        'rolling_avg_3m', 'rolling_avg_6m', 'sales_diff_1m']
        cat_features = ['month', 'season']
        
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), num_features),
                ('cat', OneHotEncoder(handle_unknown='ignore'), cat_features)
            ]
        )
        
        # Fit preprocessor and save
        preprocessor.fit(X_train)
        
        # Prepare transformed data
        X_train_transformed = preprocessor.transform(X_train)
        X_test_transformed = preprocessor.transform(X_test)
        
        # Initialize models
        models = {
            'linear': LinearRegression(),
            'lasso': Lasso(alpha=0.1),
            'random_forest': RandomForestRegressor(n_estimators=200, max_depth=15, min_samples_split=2, random_state=42),
            'xgboost': xgb.XGBRegressor(objective='reg:squarederror', n_estimators=200, 
                                      learning_rate=0.1, max_depth=5, subsample=0.8, 
                                      colsample_bytree=0.8, random_state=42)
        }
        
        best_model = None
        best_r2 = -np.inf  # Start with a very low R2 value

        for name, model in models.items():
            model.fit(X_train_transformed, y_train)
            y_pred = model.predict(X_test_transformed)
            r2 = r2_score(y_test, y_pred)
            print(f"{name} model trained with R2: {r2}")

            if r2 > best_r2:
                best_r2 = r2
                best_model = model

        # Save the best model
        if best_model:
            self.save_models_to_mongo(preprocessor, "preprocessor")

            self.save_models_to_mongo(best_model, "best_model")
            print(f"Best model saved with R2: {best_r2}")
        
        return {"status": "success", "message": "Best model trained and saved to MongoDB"}
    def predict_sales(self, product_data, selected_month):
            """
            Predict sales using specified model type for a desired month.
            
            Args:
                product_data (dict): Input data containing features like season, previous sales, etc.
                selected_month (str): Desired month for prediction (e.g., "April").
            
            Returns:
                dict: Prediction result including the predicted value and model used.
            """
            # Load models from MongoDB
            models = self.load_models_from_mongo()
            if not models:
                raise ValueError("No models trained yet")

            # Get the best model and preprocessor
            best_model = models.get("best_model")
            preprocessor = models.get("preprocessor")

            if not best_model or not preprocessor:
                raise ValueError("Model or preprocessor not found")

            # Map the selected month to its numeric representation
            month_map = {
                "January": 1, "February": 2, "March": 3, "April": 4,
                "May": 5, "June": 6, "July": 7, "August": 8,
                "September": 9, "October": 10, "November": 11, "December": 12
            }
            selected_month_num = month_map.get(selected_month)
            if not selected_month_num:
                raise ValueError(f"Invalid month: {selected_month}")

            # Create input DataFrame with the selected month
            input_df = pd.DataFrame([{
                'season': product_data['season'],
                'month': str(selected_month_num),  # Use numeric month
                'prev_1_month_sales': product_data['prev_month_sales'],
                'prev_2_month_sales': product_data['prev_2_month_sales'],
                'prev_3_month_sales': product_data['prev_3_month_sales'],
                'rolling_avg_3m': product_data['rolling_avg_3m'],
                'rolling_avg_6m': product_data['rolling_avg_6m'],
                'sales_diff_1m': product_data['sales_diff_1m']
            }])

            # Transform and predict
            input_transformed = preprocessor.transform(input_df)
            prediction = best_model.predict(input_transformed)

            return {
                'prediction': float(prediction[0]),
                'model_used': 'best_model'
            }