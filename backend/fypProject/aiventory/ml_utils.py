# yourapp/ml_utils.py
import time
import pandas as pd
from utils.demand_predictor import DemandPredictor
# somewhere globally, e.g. a module-level variable in ml_utils.py or in a new file
USER_IDS_TO_TRAIN = set()
def train_model_for_user(user_id, verbose=True):
    predictor = DemandPredictor(user_id)

    if not predictor.is_model_already_trained():
        if verbose:
            print(f"🔧 Training model for user {user_id}...")
        start_time = time.time()
        predictor.train_models()
        if verbose:
            print(f"✅ Model trained in {time.time() - start_time:.2f} seconds")
    else:
        if verbose:
            print(f"📦 Model already exists for user {user_id}")

    # Validation logic
    try:
        df = predictor.load_user_data()
        if not isinstance(df, pd.DataFrame):
            raise ValueError("Data loading failed")

        if len(df) < 10:
            raise ValueError(f"Need at least 10 records, found {len(df)}")

        required_cols = {'sale_date', 'monthly_sales', 'productname_id', 'season'}
        missing = required_cols - set(df.columns)
        if missing:
            raise ValueError(f"Missing columns: {', '.join(missing)}")

        df['sale_date'] = pd.to_datetime(df['sale_date'])

        if verbose:
            print(f"✅ Validated {len(df)} records for user {user_id}")

        return {"status": "success", "message": "Model trained and validated"}

    except Exception as e:
        error_msg = f"❌ Validation failed for user {user_id}: {str(e)}"
        if verbose:
            print(error_msg)
        return {"status": "error", "message": str(e)}
