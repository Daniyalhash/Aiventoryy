# wrapper.py

import logging
from pymongo import MongoClient
from config import Config

# Initialize logger
logging.basicConfig(level=Config.LOG_LEVEL)
logger = logging.getLogger(__name__)

# Database Connection Wrapper
def connect_to_database():
    try:
        client = MongoClient(Config.DB_URI, username=Config.DB_USER, password=Config.DB_PASSWORD)
        db = client.get_database()
        logger.info("📦 Connected to the database")
        return db
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise Exception("Database connection failed")

# AI Model Loader (example: load a model using joblib or TensorFlow)
def load_ai_model(model_path=Config.AI_MODEL_PATH):
    try:
        # Example: Loading a model with joblib (if using a trained model)
        import joblib
        model = joblib.load(model_path)
        logger.info("🔮 AI Model loaded successfully")
        return model
    except Exception as e:
        logger.error(f"❌ AI model loading failed: {e}")
        raise Exception("AI model loading failed")

# Fetch Forecasting Data from MongoDB
def fetch_forecasting_data(user_id, product_id):
    try:
        db = connect_to_database()
        collection = db['forecasting']
        
        # Aggregation query to fetch relevant data based on user and product_id
        result = collection.aggregate([
            {"$match": {"user_id": user_id, "forecasting.productname_id": product_id}},
            {"$unwind": "$forecasting"},
            {"$match": {"forecasting.productname_id": product_id}},
            {"$replaceRoot": {"newRoot": "$forecasting"}}
        ])
        
        data = list(result)
        logger.info(f"🔍 Fetched {len(data)} records for product {product_id}")
        return data
    except Exception as e:
        logger.error(f"❌ Error fetching forecasting data: {e}")
        raise Exception("Failed to fetch forecasting data")
