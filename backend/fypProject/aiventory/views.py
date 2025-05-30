from itertools import product
import random
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from pymongo import MongoClient
import bcrypt
from utils.csv_validator import validate_columns
from utils.validate_file_extension import validate_file_extension
import pandas as pd
import jwt
import os
import json
import uuid
import pytz
from io import BytesIO
from pymongo import UpdateOne
from concurrent.futures import ThreadPoolExecutor, as_completed
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from bson import ObjectId
from datetime import datetime, timedelta
import traceback
from pymongo import MongoClient
import json
from django.core.files.storage import FileSystemStorage
from bson import ObjectId  # Import ObjectId from bson to handle MongoDB IDs
import csv
from io import StringIO
from datetime import datetime, timedelta
from io import BytesIO
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.exceptions import ValidationError  # Add this import for ValidationError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from bson import ObjectId
from io import BytesIO
import pandas as pd
from datetime import datetime
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from pymongo.errors import DuplicateKeyError
import pymongo
from twilio.rest import Client

from datetime import datetime
from bson import ObjectId
from bson import ObjectId
from datetime import datetime
from pymongo.errors import PyMongoError
from bson import ObjectId
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from pymongo import MongoClient

from bson import ObjectId
from datetime import datetime
from pymongo import MongoClient
from datetime import datetime, timedelta  # ✅ Correct import
from bson.json_util import dumps  # Import dumps for BSON to JSON conversion

import bson
from utils.demand_predictor import DemandPredictor
from utils.waste_predictor import AIWasteReducer

from django.core.mail import send_mail
from django.conf import settings
# utils 
from utils.Signup import Signup
from utils.Login import Login
from utils.dashboard_utils import DashboardUtils
from utils.inventory_utils import InventoryUtils
from utils.vendor_utils import VendorUtils
from utils.insights_utils import InsightsUtils
from utils.insights2_utils import InsightsManager
from rest_framework import status
import time

import logging
logger = logging.getLogger(__name__)




from django.dispatch import receiver


# MongoDB Atlas connection
client = MongoClient("mongodb+srv://syeddaniyalhashmi123:test123@cluster0.dutvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["FYP"]
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "fallback_secret_key")
invoices_collection = db["invoices"]  # Collection inside the DB
openOrders_collection = db["openOrders"]  # Collection inside the DB
receivedOrder = db["receivedOrder"]
vendorPerformance = db["vendorPerformance"]
# Initialize class with the database
dashboard_utils = DashboardUtils(db)
inventory_utils = InventoryUtils(db)
insights_manager = InsightsManager(db)
# Predefined mappings for keywords
# Predefined mappings for keywords


COLUMN_MAP = {
    'vendor': ['vendor', 'reliability','ReliabilityScore', 'DeliveryTime','DeliveryTime', "new vendors", 'manufacturer', 'supplier'],
    'product': [
        'productname', 'category', 'subcategory', 'stock',
        'reorder', 'cost', 'selling', 'price', 'barcode',
        'expiry', 'past', 'sales', 'timespan', 'quantity'
    ]
    
    ,'unclassified': []  # This will be dynamically filled

}

REQUIRED_COLUMNS = [
    'productname', 'category', 'subcategory', 'vendor',
    'stockquantity', 'reorderthreshold', 'costprice',
    'sellingprice', 'timespan', 'expirydate', 'pastsalesdata',
    'DeliveryTime', 'ReliabilityScore', 'Barcode'
]
# from .ml_utils import train_model_for_user,USER_IDS_TO_TRAIN

# @api_view(['POST'])
# def retrain_model_view(request):
#     user_id = request.data.get("user_id")
#     print("start modeling")
#     print("getting user id",user_id)
#     if not user_id:
#         return Response({"error": "Missing user_id"}, status=400)
#     USER_IDS_TO_TRAIN.add(user_id)

#     result = train_model_for_user(user_id)
#     return Response(result)


@api_view(['POST'])
def upload_dataset(request):
    try:
        # Get User ID
        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"error": "User ID is required."}, status=400)

        # Check if the user already has a dataset uploaded
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        if user and user.get("datasets") and len(user["datasets"]) > 0:
            return Response({"error": "You can only upload one dataset."}, status=400)

        # Check Dataset File
        if 'dataset' not in request.FILES:
            return Response({"error": "Dataset file is required."}, status=400)

        # Get Dataset File
        dataset_file = request.FILES['dataset']

        # Validate file type and size
        validate_file_extension(dataset_file.name)

        # Read the dataset into memory
        file_bytes = dataset_file.read()
        df = pd.read_csv(BytesIO(file_bytes))  # Load into pandas dataframe
        df.columns = df.columns.str.strip()
        df['category'] = df.get('category', 'Unknown')
        # df['vendorPhone'] = df['vendorPhone'].astype(str)
        # df["vendorPhone"] = df["vendorPhone"].apply(lambda x: str(int(float(x))) if str(x).replace('.', '', 1).isdigit() else str(x))

        # Assign IDs to vendors and process vendor data
        vendor_columns = ["vendor_id","vendor", "category", "vendorPhone", "DeliveryTime", "ReliabilityScore"]
        vendor_data = df[vendor_columns].drop_duplicates().reset_index(drop=True)

       
        product_columns = [
             'productname_id','productname', 'category', 'subcategory', 'stockquantity',
            'reorderthreshold', 'costprice', 'sellingprice', 'timespan',
            'expirydate', 'monthly_sales', 'Barcode', 'vendor_id', 'productSize', 'sale_date', 'season'
        ]

        # Process product data (with foreign key)
        product_data = df[product_columns].drop_duplicates().reset_index(drop=True)
        
        

        # Perform column classification
        # For Forecasting Data (New Collection)
        forecasting_columns = ['productname_id', 'category', 'monthly_sales', 'sale_date', 'season',
                               'stockquantity', 'reorderthreshold']

        # Process Forecasting Data
        forecasting_data = df[forecasting_columns].drop_duplicates().reset_index(drop=True)
       
        db["products"].insert_one(product_document)
        utc_time = datetime.utcnow()
        pkt = pytz.timezone("Asia/Karachi")
        pkt_time = utc_time.astimezone(pkt)

        # Format as "09:39 AM 30/05/2025"
        formatted_time = pkt_time.strftime("%I:%M %p %d/%m/%Y")
        # Handle missing vendor IDs in product data
        if product_data['vendor_id'].isnull().any():
            missing_products = product_data[product_data['vendor_id'].isnull()]
            return Response({
                "error": "Some products do not have a corresponding vendor.",
                "missing_products": missing_products.to_dict(orient='records')
            }, status=400)

        dataset_id = ObjectId()

        # Insert Forecasting Data into MongoDB
        forecasting_document = {
            "_id": ObjectId(),  # Generate unique ID for forecasting data
            "user_id": ObjectId(user_id),
            "dataset_id": dataset_id,
            "forecasting": forecasting_data.to_dict(orient="records"),
            "upload_date": formatted_time,
        }
        db["forecasting"].insert_one(forecasting_document)

        # Insert Product Data into MongoDB
        product_document = {
            "_id": ObjectId(),  # Generate unique ID for dataset
            "user_id": ObjectId(user_id),
            "dataset_id": dataset_id,
            "products": product_data.to_dict(orient="records"),
            "upload_date": formatted_time,
        }
        
        # Insert Vendor Data into MongoDB
        vendor_document = {
            "_id": ObjectId(),  # Generate unique ID for dataset
            "user_id": ObjectId(user_id),
            "dataset_id": dataset_id,
            "vendors": vendor_data.to_dict(orient="records"),
            "upload_date": formatted_time,
        }
        db["vendors"].insert_one(vendor_document)

        # Create Dataset Document
        dataset_document = {
            "_id": dataset_id,
            "user_id": ObjectId(user_id),
            "filename": dataset_file.name,
            "vendor_id": vendor_document["_id"],
            "product_id": product_document["_id"],
            "forecasting_id": forecasting_document["_id"],
            "upload_date": datetime.utcnow().isoformat(),
        }
        db["datasets"].insert_one(dataset_document)

        # Update user document to reference this dataset
        dataset_info = {
            "dataset_id": dataset_id,
            "filename": dataset_file.name,
            "upload_date": dataset_document["upload_date"],
            "status": "uploaded"
        }
        db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"datasets": dataset_info}}
        )
        print("Done")
        # Success response
        return Response({
            "message": f"Dataset '{dataset_file.name}' uploaded successfully!",
            "dataset_id": str(dataset_document["_id"]),
            "message": "Dataset successfully processed.",
        })

    except pd.errors.ParserError as e:
        logger.error(f"CSV Parsing Error: {str(e)}")
        return Response({"error": "Invalid CSV file format."}, status=400)
    except FileNotFoundError as e:
        logger.error(f"File Not Found: {str(e)}")
        return Response({"error": "The dataset file could not be found."}, status=400)
    except KeyError as e:
        logger.error(f"Missing column in the dataset: {str(e)}")
        return Response({"error": f"Missing required column: {str(e)}"}, status=400)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return Response({"error": "An unexpected error occurred."}, status=500)
#done-----
#done-------------------------------------------------------------------------------------------------------------------------------------
# signUp page-1

@api_view(['POST'])
def signup(request):
    try:
        data = request.data
        # Use the Signup class to handle user registration
        response_data, status_code = Signup.register_user(
            data["username"],
            data["email"],
            data["password"],
            data["shopname"]
        )
        return Response(response_data, status=status_code)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# Delete User (When user discards changes)
@api_view(['POST'])
def discard_signup(request):
    try:
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=400)
        # Check if user exists with the given email
        user = db["users"].find_one({"email": email})

        if not user:
            return Response({"error": "No user found with this email."}, status=404)

        if user.get("status") != "incomplete":
            return Response({"error": "Account is completed and cannot be deleted."}, status=403)
        
        result = db["users"].delete_one({"email": email, "status": "incomplete"})


        if result.deleted_count == 0:
            return Response({"error": "Unable to delete user."}, status=500)

        return Response({"message": "Signup discarded successfully. User deleted."}, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
# Save & Complete Signup
@api_view(['POST'])
def in_complete_signup(request):
    try:
        email = request.data.get("email")  # Identify user by email
        if not email:
            return Response({"error": "Email is required."}, status=400)
        user = db["users"].find_one({"email": email})
        if not user:
            return Response({"error": "User not found."}, status=404)
        if user.get("status") != "complete":
            db["users"].update_one(
            {"email": email, "status": "incomplete"},
            {"$set": {"status": "incomplete"}}
        )

            return Response({"message": "User marked as incomplete."})
        else:
            return Response({"message": "User already completed signup."})

    except Exception as e:
        return Response({"error": str(e)}, status=500)
#login-2

@api_view(['POST'])
def login(request):
    data = request.data
    email = data.get("email")
    password = data.get("password")
    
    # Use the Login class to handle authentication
    response_data, status_code = Login.authenticate_user(email, password)

    return Response(response_data, status=status_code)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')

import logging

logger = logging.getLogger(__name__)
@api_view(['POST'])  # only allow POST for real use
def complete_signup(request):
    if request.method == 'GET':
        logger.warning("⚠️ Unexpected GET request to complete_signup")
        logger.warning(f"IP Address: {get_client_ip(request)}")
        logger.warning(f"Headers: {dict(request.headers)}")
        return Response({'error': 'GET not allowed'}, status=405)
    try:
        # 1. Validate user_id
        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"error": "User ID is required."}, status=400)
        
        print(f"🚀 Starting signup completion for user {user_id}")
        print('user_id', user_id)
        
        # 2. Initialize predictor and load data
        predictor = DemandPredictor(user_id)
        if not predictor.is_model_already_trained():
            print("Training model for new user...")
            start_time = time.time()  # Start timing the model training
            try:
                training_results = predictor.train_models()  # Train model
            except Exception as e:
                print("Training failed:", str(e))
                return Response({ "error": "Training failed", "details": str(e) }, status=500)
            print(f"Model training completed in {time.time() - start_time} seconds")
            print("Model trained & saved to MongoDB")
        else:
            print("Model already exists in MongoDB")
            training_results = None  # Skip retraining

        print("\n🔍 Pre-validation check:")
        try:
            # Load and validate data
            df = predictor.load_user_data()
            
            if not isinstance(df, pd.DataFrame):
                raise ValueError("Data loading failed - invalid format")
                
            if len(df) < 10:
                raise ValueError(f"Need at least 10 records, found {len(df)}")
            
            # Validate required columns
            required_cols = {'sale_date', 'monthly_sales', 'productname_id', 'season'}
            missing_cols = required_cols - set(df.columns)
            if missing_cols:
                raise ValueError(f"Missing columns: {', '.join(missing_cols)}")
                
            # Validate dates
            try:
                df['sale_date'] = pd.to_datetime(df['sale_date'])
            except Exception as e:
                raise ValueError(f"Invalid date format: {str(e)}")
                
            print(f"✅ Validated {len(df)} records with columns: {list(df.columns)}")

        except Exception as e:
            error_msg = f"Data validation failed: {str(e)}"
            print(f"❌ {error_msg}")
            return Response({
                "error": "Cannot complete signup",
                "details": error_msg,
                "solution": "Ensure you have proper sales data (min 10 records with sale_date, monthly_sales, productname_id, season)"
            }, status=400)
        # 4. Initialize ai waster and load data
         # ⏳ Train the model
         
        try:
            get_expiry_forecast(user_id, force_retrain=True)
        except Exception as e:
            print("expiry training failed:", str(e))
            return Response({ "error": "Training failed", "details": str(e) }, status=500)
            
        print("💾 Model saved successfully")
        
        # 4. Finalize signup
        print("\n🔄 Finalizing signup...")

        # Handle trained models safely
        demand_model_names = list(training_results.keys()) if training_results and isinstance(training_results, dict) else []

        combined_models = demand_model_names 
        utc_time = datetime.utcnow()
        pkt = pytz.timezone("Asia/Karachi")
        pkt_time = utc_time.astimezone(pkt)

        # Format as "09:39 AM 30/05/2025"
        formatted_time = pkt_time.strftime("%I:%M %p %d/%m/%Y")
        result = db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "status": "complete",
                "models_trained": True,
                "last_trained": formatted_time,
                "trained_models": combined_models
            }}
        )

        if not result.modified_count:
            error_msg = "User status update failed"
            print(f"⚠️ {error_msg}")
            return Response({
                "error": "Signup processing incomplete",
                "details": error_msg
            }, status=400)

        print("🎉 Signup completed successfully!")
        return Response({
            "status": "success",
            "trained_models": combined_models,
            "message": "Models trained and user status updated successfully!"
        })

    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(f"🔥 {error_msg}")
        return Response({
            "error": "Signup processing failed",
            "details": error_msg
        }, status=500)
from rest_framework.permissions import AllowAny

@api_view(['OPTIONS', 'POST'])
@permission_classes([AllowAny])
def done(request):    
    try:
        # 1. Validate user_id
        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"error": "User ID is required."}, status=400)
        
        print(f"🚀 Starting signup completion for user {user_id}")
        print('user_id', user_id)
        
        # 2. Initialize predictor and load data
        predictor = DemandPredictor(user_id)
        if not predictor.is_model_already_trained():
            print("Training model for new user...")
            start_time = time.time()  # Start timing the model training
            try:
                training_results = predictor.train_models()  # Train model
            except Exception as e:
                print("Training failed:", str(e))
                return Response({ "error": "Training failed", "details": str(e) }, status=500)
            print(f"Model training completed in {time.time() - start_time} seconds")
            print("Model trained & saved to MongoDB")
        else:
            print("Model already exists in MongoDB")
            training_results = None  # Skip retraining

        print("\n🔍 Pre-validation check:")
        try:
            # Load and validate data
            df = predictor.load_user_data()
            
            if not isinstance(df, pd.DataFrame):
                raise ValueError("Data loading failed - invalid format")
                
            if len(df) < 10:
                raise ValueError(f"Need at least 10 records, found {len(df)}")
            
            # Validate required columns
            required_cols = {'sale_date', 'monthly_sales', 'productname_id', 'season'}
            missing_cols = required_cols - set(df.columns)
            if missing_cols:
                raise ValueError(f"Missing columns: {', '.join(missing_cols)}")
                
            # Validate dates
            try:
                df['sale_date'] = pd.to_datetime(df['sale_date'])
            except Exception as e:
                raise ValueError(f"Invalid date format: {str(e)}")
                
            print(f"✅ Validated {len(df)} records with columns: {list(df.columns)}")

        except Exception as e:
            error_msg = f"Data validation failed: {str(e)}"
            print(f"❌ {error_msg}")
            return Response({
                "error": "Cannot complete signup",
                "details": error_msg,
                "solution": "Ensure you have proper sales data (min 10 records with sale_date, monthly_sales, productname_id, season)"
            }, status=400)
        # 4. Initialize ai waster and load data
         # ⏳ Train the model
         
        try:
            get_expiry_forecast(user_id, force_retrain=True)
        except Exception as e:
            print("expiry training failed:", str(e))
            return Response({ "error": "Training failed", "details": str(e) }, status=500)
            
        print("💾 Model saved successfully")
        
        # 4. Finalize signup
        print("\n🔄 Finalizing signup...")

        # Handle trained models safely
        demand_model_names = list(training_results.keys()) if training_results and isinstance(training_results, dict) else []

        combined_models = demand_model_names 
        utc_time = datetime.utcnow()
        pkt = pytz.timezone("Asia/Karachi")
        pkt_time = utc_time.astimezone(pkt)

        # Format as "09:39 AM 30/05/2025"
        formatted_time = pkt_time.strftime("%I:%M %p %d/%m/%Y")
        result = db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "status": "complete",
                "models_trained": True,
                "last_trained": formatted_time,
                "trained_models": combined_models
            }}
        )

        if not result.modified_count:
            error_msg = "User status update failed"
            print(f"⚠️ {error_msg}")
            return Response({
                "error": "Signup processing incomplete",
                "details": error_msg
            }, status=400)

        print("🎉 Signup completed successfully!")
        return Response({
            "status": "success",
            "trained_models": combined_models,
            "message": "Models trained and user status updated successfully!"
        })

    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(f"🔥 {error_msg}")
        return Response({
            "error": "Signup processing failed",
            "details": error_msg
        }, status=500)
    
    
@api_view(['GET'])
def validate_token(request):
    token = request.headers.get("Authorization", "").split(" ")[1]  # Get token from the header
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = db["users"].find_one({"_id": ObjectId(payload["id"])}, {"_id": 0, "password": 0})
        if not user:
            return Response({"error": "User not found."}, status=404)
        return Response({"user": user})
    except jwt.ExpiredSignatureError:
        return Response({"error": "Token has expired!"}, status=401)
    except jwt.InvalidTokenError:
        return Response({"error": "Invalid token!"}, status=401)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
#dashboard count-3
@api_view(['GET'])
def get_total_products(request):
    user_id = request.query_params.get('user_id')
    result = dashboard_utils.get_total_products(user_id)

    if "error" in result:
        return Response({"error": result["error"]}, status=result["status"])

    return Response(result)
@api_view(['GET'])
def get_inventory_summary(request):
    user_id = request.query_params.get('user_id')
    result = dashboard_utils.get_inventory_summary(user_id)

    if "error" in result:
        return Response({"error": result["error"]}, status=result["status"])

    return Response(result)
@api_view(['GET'])
def get_vendor_summary(request):
    user_id = request.query_params.get('user_id')
    result = dashboard_utils.get_vendor_summary(user_id)

    if "error" in result:
        return Response({"error": result["error"]}, status=result["status"])

    return Response(result)
#dashboard count-3

#dashboard count-4

@api_view(['GET'])
def get_dashboard_visuals(request):
    user_id = request.query_params.get('user_id')
    result = dashboard_utils.get_dashboard_visuals(user_id)

    if "error" in result:
        return Response({"error": result["error"]}, status=result["status"])

    return Response(result)



@api_view(['GET'])
def get_current_dataset(request):
    user_id = request.GET.get("user_id")
    response, status = inventory_utils.get_user_products(user_id)
    return Response(response, status=status)





#inventory count-6

@api_view(['GET'])
def get_inventory_visuals(request):
    user_id = request.query_params.get("user_id")
    response, status = inventory_utils.get_inventory_visuals(user_id)
    return Response(response, status=status)
@api_view(['GET'])
def get_expired_products(request):
    user_id = request.query_params.get("user_id")
    category = request.query_params.get("category")
    response, status = inventory_utils.get_expired_products(user_id, category)   
    return Response(response, status=status)


@api_view(['POST'])
def delete_ExpiredProduct(request):
    data = request.data
    product_id = data.get("productname_id")
    user_id = data.get("user_id")

    if not user_id or not product_id:
        return JsonResponse({"error": "userId and product_id are required"}, status=400)

    try:
        # 🧠 Step 1: Remove product from array
        result = db["products"].update_one(
            {"user_id": ObjectId(user_id), "products.productname_id": product_id},
            {"$pull": {"products": {"productname_id": product_id}}}
        )

        if result.modified_count == 0:
            return Response({"error": "No products found to delete"}, status=404)
        return JsonResponse({
            "message": "Expired Product deleted successfully",
          
            "modifiedCount": result.modified_count
        }, status=200)

    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)
#vendor count-7

@api_view(['GET'])
def get_vendor(request):
    user_id = request.GET.get("user_id", None)

    if not user_id:
        return Response({"error": "Missing user_id"}, status=400)

    try:
        vendors = VendorUtils.get_vendors_by_user(user_id)
        if not vendors:
            return Response({"error": "No vendor found for the user"}, status=404)

        return Response({"vendors": [vendor["vendors"] for vendor in vendors]})
    except ValueError as e:
        return Response({"error": str(e)}, status=400)
    except Exception as e:
        print(f"Error: {e}")
        return Response({"error": "Internal server error"}, status=500)


# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from bson import ObjectId
from datetime import datetime
import math

@api_view(['POST'])
def update_vendor_reliability(request):
    try:
        # 1. Inspect incoming request
        print("Request Content-Type:", request.content_type)
        print("Request Data:", request.data)
        user_id = request.data.get('userId') or request.GET.get('userId')
        vendor_id = request.data.get('vendor_id')
        order_time_str = request.data.get('orderDate')
        invoice_data = request.data.get("invoice_data")
        print("Invoice Data:", invoice_data)
        print("Request Content-Type:", request.content_type)
        print("Request Data:", request.data)
        print("Request GET Params:", request.GET)
        print("vendor", vendor_id)  
        print("user", user_id)         
        print("\n=== EXTRACTED VALUES ===")
        print(f"user_id: {user_id} (type: {type(user_id)})")
        print(f"vendor_id: {vendor_id} (type: {type(vendor_id)})")
       
        print(f"order date: {order_time_str} ")
        

        # Validate required fields
        if not all([user_id, vendor_id]):
            missing = []
            if not user_id: missing.append('user_id')
            if not vendor_id: missing.append('vendor_id')
            if not order_time_str: missing.append('order_time_str')
            
            error_msg = f"Missing required fields: {', '.join(missing)}"
            print(f"Validation error: {error_msg}")
            return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)
           # Validate ObjectId format
        if not ObjectId.is_valid(user_id):
            print(f"Invalid user_id format: {user_id}")
            return Response({"error": "Invalid user_id format"}, status=400)
            
        if not ObjectId.is_valid(vendor_id):
            print(f"Invalid vendor_id format: {vendor_id}")
            return Response({"error": "Invalid vendor_id format"}, status=400)
        
        # 🕒 Parse order time string
        try:
            time_part, date_part = order_time_str.split(" (")
            date_part = date_part.rstrip(")")
            hours, minutes = map(int, time_part.split(":"))
            month, day, year = map(int, date_part.split("/"))
            order_date = datetime(year, month, day, hours, minutes)
        except Exception as e:
            return Response({"error": f"Invalid order time format: {str(e)}"}, status=400)

        # 📅 Delivery is NOW
        delivery_date = datetime.utcnow()
        ms_diff = (delivery_date - order_date).total_seconds() * 1000
        delivery_time_hours = ms_diff / (1000 * 60 * 60)
        delivery_days = math.ceil(delivery_time_hours / 24)

        # 🎯 Calculate current delivery score
        if delivery_time_hours <= 24:
            current_delivery_score = 100
        elif delivery_time_hours <= 48:
            current_delivery_score = 95
        elif delivery_time_hours <= 72:
            current_delivery_score = 90
        elif delivery_time_hours <= 96:
            current_delivery_score = 85
        else:
            days_late = delivery_days - 1
            current_delivery_score = max(0, 100 - (days_late * 5))

        # 📊 Get previous reliability score from DB
        vendor_doc = db.vendors.find_one({
            "user_id": ObjectId(user_id),
            "vendors.vendor_id": vendor_id
        }, {
            "vendors.$": 1
        })

        if not vendor_doc or not vendor_doc['vendors']:
            return Response({"error": "Vendor not found"}, status=404)

        previous_score = vendor_doc['vendors'][0].get('ReliabilityScore', 100)
        weight = 0.75

        new_reliability_score = round(
            previous_score * weight + current_delivery_score * (1 - weight)
        )
        
        
        
        
        print("\n=== VENDOR BY vendor_id (FIRST MATCH ONLY) ===")
      

        result = db.vendors.update_many(
            {
                "user_id": ObjectId(user_id),
                "vendors.vendor_id": vendor_id
            },
            {
                "$set": {
                    "vendors.$[elem].DeliveryTime": delivery_days,
                    "vendors.$[elem].ReliabilityScore": new_reliability_score,
                    "vendors.$[elem].last_updated": datetime.utcnow()
                }
            },
            array_filters=[{"elem.vendor_id": vendor_id}]
        )
        print(f"New rb score is {new_reliability_score}")
        
        print(f"New delivery days  is {delivery_days}")

        print("\n=== UPDATE RESULT ===")
        print(f"Matched: {result.matched_count}")
        print(f"Modified: {result.modified_count}")



        if result.matched_count == 0:
            print("No vendor found with this ID")
            return Response({"error": "Vendor not found"}, status=404)
            
        if result.modified_count == 0:
            print("Vendor found but no changes made (values might be same)")
        # Save invoice data into receivedVendor collection\
            
        utc_time = datetime.utcnow()
        pkt = pytz.timezone("Asia/Karachi")
        pkt_time = utc_time.astimezone(pkt)

        # Format as "09:39 AM 30/05/2025"
        formatted_time = pkt_time.strftime("%I:%M %p %d/%m/%Y")    
        invoice_id = invoice_data.get("_id")
        if not invoice_id:
            return Response({"error": "Invoice ID missing in invoice data"}, status=400)
        print("\n=== VENDOR BY vendorPerformance ===")
        performance_update = {
            "$push": {
                "deliveries": {
                    "invoice_id": invoice_id,
                    "delivery_days": delivery_days,
                    "on_time_delivery": (delivery_days <= 1),
                    "current_delivery_score": current_delivery_score,
                    "score_before": previous_score,
                    "score_after": new_reliability_score,
                    "timestamp": formatted_time
                }
            },
            "$inc": {
                "total_orders": 1
            }
        }

        # Now also compute avg, on-time %
        db.vendorPerformance.update_one(
            {"user_id": ObjectId(user_id), "vendor_id": vendor_id},
            performance_update,
            upsert=True  # Creates new doc if doesn't exist
        )
        perf_doc = db.vendorPerformance.find_one({
            "user_id": ObjectId(user_id),
            "vendor_id": vendor_id
        })

        if perf_doc:
            deliveries = perf_doc.get("deliveries", [])
            total_orders = len(deliveries)

            all_delivery_days = [d['delivery_days'] for d in deliveries]
            avg_delivery_days = round(sum(all_delivery_days) / total_orders, 2) 

            on_time_deliveries = sum(1 for d in deliveries if d["on_time_delivery"])
            on_time_percentage = round((on_time_deliveries / total_orders) * 100, 2) 
            last_delivery_status = "On Time" if delivery_days <= 1 else f"{delivery_days} days late"
            # 📊 Build reliability score history
            score_history = [{"date": d["timestamp"], "score": d["score_after"]} for d in deliveries]

            # 🧮 Get last 5 scores for quick trend analysis
            last_5_scores = [d.get("score_after", 0) for d in deliveries[-5:]]  # Take last 5 deliveries
         # 🧮 Optional: Update latest timestamp
            db.vendorPerformance.update_one(
                {"user_id": ObjectId(user_id), "vendor_id": vendor_id},
                {"$set": {
                    "last_updated": datetime.utcnow(),
                    "avg_delivery_days": avg_delivery_days,
                    "reliability_score_history": score_history,
                    "last_5_scores": last_5_scores,
                    "on_time_percentage": on_time_percentage,
                    "last_delivery_status": last_delivery_status
                }}
            )
            print("done updating vendor perfomance score card")
        else:
            print("⚠️ perf_doc not found after insert")
        # 🔁 Update stockquantity in products collection
        if invoice_data:
            delivered_products = invoice_data.get("products", [])
            for product in delivered_products:
                productname_id = product.get("productname_id")
                delivered_quantity = product.get("quantity", 0)

                if not productname_id:
                    print("⚠️ Skipping product without barcode")
                    continue

                print(f"Updating stock for product with barcode: {productname_id}, adding quantity: {delivered_quantity}")

                update_result = db.products.update_one(
                    {
                        "user_id": ObjectId(user_id),
                        "products.productname_id": productname_id
                    },
                    {
                        "$inc": {
                            "products.$.stockquantity": delivered_quantity
                        }
                    }
                )

                if update_result.matched_count:
                    print(f"✅ Stock updated for product {productname_id}")
                else:
                    print(f"❌ Product with barcode {productname_id} not found for stock update")

        
        # metadata = {
        #     "product_id": product.get("productname_id"),
        #     "vendor":request.data.get('vendor_id'),
        #     "category": product.get("category"),
        #     "timestamp": datetime.utcnow().isoformat()
        # }
        # log_audit_action(
        #             db=db,
        #             user_id=user_id,
        #             action="Update",
        #             entity_type="Product",
        #             entity_id=None,  # Optional: vendor if you have one
        #             metadata=metadata
        #         )
        print("===============")
        if invoice_data:
            invoice_id = invoice_data.get("_id")
            if not invoice_id:
                return Response({"error": "Invalid invoice data: missing _id"}, status=400)

            existing_invoice = db.receivedOrder.find_one({"_id":invoice_id})
            if existing_invoice:
                print("invoice already exists in received order")
                # Just update status, don't re-insert
                db.receivedOrder.update_one(
                    {"_id": invoice_id},
                    {"$set": {"status": "received"}}
                )
                print("invoice status changes")

            else:
                print("Inserting new received invoice...")
                utc_time = datetime.utcnow()
                pkt = pytz.timezone("Asia/Karachi")
                pkt_time = utc_time.astimezone(pkt)

                # Format as "09:39 AM 30/05/2025"
                formatted_time = pkt_time.strftime("%I:%M %p %d/%m/%Y")
                invoice = invoice_data.copy()
                invoice["status"] = "received"
                invoice["user_id"] = ObjectId(user_id)
                invoice["vendor_id"] = vendor_id
                invoice["created_at"] = formatted_time          
                print("----------------------------------------------------------")
        
                insert_result = db.receivedOrder.insert_one(invoice)
                new_invoice_id = insert_result.inserted_id
                print(f"Invoice inserted with ID: {new_invoice_id}")

               
            

           
        return Response({
            "success": True,
            "message": "Vendor reliability updated",
            "delivery_time": delivery_days,
            "reliability_score": new_reliability_score
        })

   
    except Exception as e:
        print(f"\n=== ERROR ===")
        print(f"Type: {type(e)}")
        print(f"Error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        # return Response({"error": "Internal server error"}, status=500)
#vendor count-8







# Helper function to make documents JSON serializable
def serialize_doc(doc):
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, datetime):
            doc[key] = value.isoformat()  # Converts datetime to ISO string
    return doc

@api_view(['GET'])
def get_user_received_orders(request):
    """
    Print all documents in the receivedOrder collection for debugging.
    """
    try:
        user_id = request.query_params.get('user_id')
        print("user_id", user_id)

        if not user_id:
            return Response(
                {"error": "user_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_id_object = ObjectId(user_id)

        # Fetch orders from MongoDB
        all_orders_cursor = receivedOrder.find({"user_id": user_id_object})
        all_orders = list(all_orders_cursor)

        # Serialize each document
        all_orders = [serialize_doc(order) for order in all_orders]

        # Print pretty JSON
        if all_orders:
            print("All Documents in receivedOrder collection:")
            print(json.dumps(all_orders, indent=2))
        else:
            print(f"No received orders found for user {user_id}.")

        return Response(
            {"orders": all_orders, "message": "Orders fetched successfully."},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return Response(
            {"error": f"Failed to fetch data: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET'])
def get_vendor_visuals(request):
    user_id = request.query_params.get('user_id')

    if not user_id:
        return Response({"error": "User ID is required!"}, status=400)

    try:
        visuals = VendorUtils.get_vendor_visuals(user_id)
        if not visuals:
            return Response({"error": "No vendors found for the user"}, status=404)

        return Response(visuals)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)
    except Exception as e:
        return Response({"error": "Internal server error"}, status=500)

@api_view(['GET'])
def products_by_category(request):
    user_id = request.query_params.get('userId')
    category = request.query_params.get('category')

    print("➡️ user_id:", user_id)
    print("➡️ category:", category)
    
    if not category:
        return Response({"error": "Missing category parameter"}, status=400)

    if not ObjectId.is_valid(user_id):
        print("❌ Invalid user_id format")
        return Response({"error": "Invalid user_id format"}, status=400)

    # Check if collections exist
    if "products" not in db.list_collection_names():
        print("❌ 'products' collection does not exist")
        return Response({"error": "'products' collection does not exist"}, status=500)

    # Handle category variations
    possible_categories = [category]
    if category == "Biscuits/Snacks":
        possible_categories.append("Biscuits")

    pipeline = [
        {"$match": {
            "user_id": ObjectId(user_id),
            "products.category": {"$in": possible_categories}
        }},
        {"$unwind": "$products"},
        {"$match": {"products.category": {"$in": possible_categories}}},
        # Group by barcode to get unique products
        {"$group": {
            "_id": "$products.Barcode",  # Using barcode as unique key
            "product": {"$first": "$products"}  # Take first product per barcode
        }},
        {"$project": {
            "_id": 0,
            "product_id": "$product.productname_id",  # Changed from $products to $product
            "productname": "$product.productname",    # Changed from $products to $product
            "category": "$product.category",         # Changed from $products to $product
            "stockquantity": "$product.stockquantity", # Changed from $products to $product
            "costprice": "$product.costprice",       # Changed from $products to $product
            "sellingprice": "$product.sellingprice", # Changed from $products to $product
            "barcode": "$_id"                       # Include the barcode we grouped by
        }},
        {"$sort": {"productname": 1}}  # Alphabetical sort
    ]

    try:
        products = list(db["products"].aggregate(pipeline))
        total_products = len(products)
        
        # Print first product with all fields for debugging
        # if products:
        #     print("First product sample:", products[0])
        
        print(f"✅ Found {total_products} products for category {category}")
        return Response({
            "total_products": total_products,
            "products": products
        }, status=200)
    except Exception as e:
        print(f"❌ Error fetching products: {str(e)}")
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def vendors_by_category(request):
    user_id = request.query_params.get('userId')
    category = request.query_params.get('category')

    print("➡️ user_id:", user_id)
    print("➡️ category:", category)
    if not category:
            return Response({"error": "Missing category parameter"}, status=400)

    if not ObjectId.is_valid(user_id):
        print("❌ Invalid user_id format")
        return Response({"error": "Invalid user_id format"}, status=400)

    # Check if the DB and collection exist
    if "vendors" not in db.list_collection_names():
        print("❌ 'vendors' collection does not exist")
        return Response({"error": "'vendors' collection does not exist"}, status=500)
    possible_categories = [category]
    if category == "Biscuits/Snacks":
        possible_categories.append("Biscuits")
    pipeline = [
        {"$match": {"user_id": ObjectId(user_id)}},
        {"$unwind": "$vendors"},
        {"$match": {"vendors.category": {"$in": possible_categories}}},
        {"$group": {
            "_id": "$vendors.vendor_id",
            "vendor": {"$first": "$vendors.vendor"},
            "vendorPhone": {"$first": "$vendors.vendorPhone"},
            "categories": {"$addToSet": "$vendors.category"},
            "DeliveryTime": {"$first": "$vendors.DeliveryTime"},
            "ReliabilityScore": {"$first": "$vendors.ReliabilityScore"},
        }},
        {"$project": {
            "vendor_id": "$_id",
            "vendor": 1,
            "vendorPhone": 1,
            "categories": 1,
            "DeliveryTime": 1,
            "ReliabilityScore": 1
        }}
    ]

    try:
        vendors = list(db["vendors"].aggregate(pipeline))
        total_vendors = len(vendors)
        unique_vendor_names = len(set(v['vendor'] for v in vendors if v.get("vendor")))

        sorted_vendors = sorted(vendors, key=lambda x: x.get("ReliabilityScore", 0), reverse=True)
        print("Sorted Vendors:", sorted_vendors)
        return Response({
            "total_matching_vendors": total_vendors,
            "unique_vendor_names": unique_vendor_names,
            "vendors": sorted_vendors
        }, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


#insights count-9


@api_view(['GET'])
def get_categories(request):
    user_id = request.query_params.get('user_id')
    if not user_id:
        return Response({"error": "User ID is required!"}, status=400)

    try:
        categories = InsightsUtils.fetch_categories(user_id)
        if not categories:
            return Response({"error": "No products found for this user!"}, status=404)

        return Response({"categories": categories})
    
    except Exception as e:
        return Response({"error": str(e)}, status=500)
#insights count-10

@api_view(['GET'])
def fetch_smart_reorder_products(request):
    user_id = request.GET.get("user_id")
    category = request.GET.get("category")

    if not user_id:
        return Response({"status": "error", "message": "User ID is required"}, status=400)

    try:
        result, status_code = InsightsUtils.fetch_smart_reorder_products(user_id, category)
        return Response(result, status=status_code)

    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)
@api_view(['GET'])
def get_top_products_by_category(request):
    user_id = request.query_params.get('user_id')
    category = request.query_params.get('category')

    if not user_id or not category:
        return Response({"error": "User ID and category are required!"}, status=400)

    try:
        products = InsightsUtils.fetch_top_products(user_id, category)
        if not products:
            return Response({"error": "No products found for this user in this category!"}, status=404)

        return Response({"products": products})
    
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
    
    
#insights count-11

@api_view(['GET'])
def get_products_by_name(request):
    user_id = request.query_params.get('user_id')
    category = request.query_params.get('category')
    vendor_id = request.query_params.get('vendor_id')

    if not user_id or not category or not vendor_id:
        return Response({"error": "User ID, category, and vendor ID are required!"}, status=400)

    try:
        result = InsightsUtils.fetch_products_by_name(user_id, category, vendor_id)
        if "error" in result:
            return Response(result, status=404)

        return Response({"products": result})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
def get_user_details(request):
    user_id = request.query_params.get('user_id')
    
    if not user_id:
        return Response({"error": "User ID is required!"}, status=400)

    try:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        
        if not user:
            return Response({"error": "User not found!"}, status=404)

        # 📁 Get latest dataset info
        datasets = user.get("datasets", [])
        latest_dataset = datasets[0] if datasets else None

        dataset_info = {}
        if latest_dataset:
            dataset_info = {
                "dataset_name": latest_dataset.get("filename", "Unnamed Dataset"),
                "upload_date": latest_dataset.get("upload_date", ""),
                "upload_date_pretty": datetime.fromisoformat(
                    latest_dataset.get("upload_date", "").replace("Z", "+00:00")
                ).strftime("%B %d, %Y at %I:%M %p") if latest_dataset.get("upload_date") else "N/A",
                "status": latest_dataset.get("status", "unknown")
            }

        # 🧠 Model trained status
        model_trained = user.get("models_trained", False)
        
        # 📤 Final response
        return Response({
            "username": user["username"],
            "email": user["email"],
            "shopname": user["shopname"],
            "status": user["status"],
            "last_trained": user.get("last_trained", None),
            "model_trained": model_trained,
            "dataset": dataset_info
        }, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
def update_user(request):
    # Get user_id from request data
    user_id = request.data.get('user_id')
    
    if not user_id:
        return Response({"error": "User ID is required!"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not user:
            return Response({"error": "User not found!"}, status=status.HTTP_404_NOT_FOUND)
      
  
        # Prepare update data (only include fields that are present in request)
        update_data = {}
        if 'username' in request.data:
            update_data['username'] = request.data['username']
        if 'shopname' in request.data:
            update_data['shopname'] = request.data['shopname']
        if 'email' in request.data:
            update_data['email'] = request.data['email']
        # Only proceed if there are actual changes
        if not update_data:
            return Response({
                "success": True,
                "message": "No changes detected",
                "user": user
            }, status=status.HTTP_200_OK)
        
        result = db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        updated_user = db["users"].find_one({"_id": ObjectId(user_id)})
        return Response({
            "success": True,
            "message": "User updated successfully",
            "user": {
                "username": updated_user["username"],
                "shopname": updated_user["shopname"],
                "email": updated_user["email"]
                
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e),
            "message": "Failed to update user"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#insights count-12

@api_view(['GET'])
def get_categories_p(request):
    """API endpoint to fetch low stock products."""
    user_id = request.query_params.get('user_id')
    result, status = insights_manager.get_low_stock_products(user_id)
    return Response(result, status=status)
#insights count-13

@api_view(['GET'])
def get_vendor_details(request):
    """API endpoint to fetch vendor details for a product."""
    user_id = request.query_params.get('user_id')
    category = request.query_params.get('category')
    vendor_id = request.query_params.get('vendor_id')
    productname = request.query_params.get('productname')

    result, status = insights_manager.get_vendor_details(user_id, category, vendor_id, productname)
    return Response(result, status=status)



# Forgot Password Endpoint
@api_view(['POST'])
def forgot_password(request):
    email = request.data.get("email")
    
    # Check if user exists in the database
    user = db["users"].find_one({"email": email})
    if not user:
        return Response({"error": "Email not found"}, status=404)
    
   # Generate Reset Token (1-hour expiry)
    reset_token = jwt.encode(
        {"userId": str(user["_id"]), "exp": datetime.utcnow() + timedelta(hours=1)},
        SECRET_KEY, algorithm="HS256"
    )

    # Password Reset URL
    reset_url = f"http://localhost:3000/resetpassword?token={reset_token}"
    
 # Send Reset Email
    try:
        send_mail(
            'Password Reset Request',
            f'Hi {user["username"]},\n\nClick the link to reset your password:\n{reset_url}\n\nIf you did not request this, ignore this email.',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return Response({"message": "Password reset link sent to your email"}, status=200)

    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return Response({"error": "Failed to send email. Please try again later."}, status=500)

# Reset Password Endpoint
@api_view(['POST'])
def reset_password(request):
    token = request.data.get("token")
    new_password = request.data.get("newPassword")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload["userId"]
        user = db["users"].find_one({"_id": ObjectId(user_id)})

        if not user:
            return Response({"error": "User not found"}, status=404)

        # Hash the new password
        hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
        db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password": hashed_password}}
        )

        # Send Confirmation Email
        send_mail(
            'Password Reset Successful',
            f'Hi {user["username"]},\n\nYour password has been reset successfully. You can now log in with your new password.\n\nThank you!',
            settings.DEFAULT_FROM_EMAIL,
            [user["email"]],
            fail_silently=False,
        )

        return Response({"message": "Password reset successful"})

    except jwt.ExpiredSignatureError:
        return Response({"error": "Token has expired"}, status=400)
    except jwt.InvalidTokenError:
        return Response({"error": "Invalid token"}, status=400)

# done --------------------------------------------------------------------------------------------------------------------------



# delete a user based on cancel button while registeration
# delete a user based on user_id
# not use yet
@api_view(['POST'])
def delete_user(request):
    try:
        user_id = request.data.get("user_id")
        if not user_id or not ObjectId.is_valid(user_id):
            return Response({"error": "Invalid User ID."}, status=400)

        result = db["users"].delete_one({"_id": ObjectId(user_id), "status": "incomplete"})
        if result.deleted_count == 0:
            return Response({"error": "No such user found or user already completed signup."}, status=404)

        return Response({"message": "User data deleted successfully."})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
def get_stock_levels(request):
    user_id = request.query_params.get('user_id')

    # user_id = request.query_params.get('user_id')

    if not user_id:
        return Response({"error": "User ID is required!"}, status=400)

    try:
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {"$unwind": "$products"},
            {
                "$project": {
                    "stockquantity": "$products.stockquantity",
                    "reorderthreshold": {
                        "$ifNull": ["$products.reorderthreshold", 10]  # Default to 10 if missing
                    }
                }
            },
            {
                "$group": {
                    "_id": None,
                    "out_of_stock": {
                        "$sum": {"$cond": [{"$eq": ["$stockquantity", 0]}, 1, 0]}
                    },
                    "low_stock": {
                        "$sum": {"$cond": [{"$lt": ["$stockquantity", "$reorderthreshold"]}, 1, 0]}
                    },
                    "healthy_stock": {
                        "$sum": {
                            "$cond": [{"$gte": ["$stockquantity", "$reorderthreshold"]}, 1, 0]
                        }
                    },
                }
            }
        ]

        result = list(db["products"].aggregate(pipeline))
        
        if not result:
            return Response({"error": "No products found for this user!"}, status=404)

        stock_levels = result[0] if result else {"out_of_stock": 0, "low_stock": 0, "healthy_stock": 0}
        del stock_levels["_id"]  # Remove unnecessary MongoDB `_id` field

        return Response(stock_levels)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

def parse_date(date_str):
    formats = ["%Y-%m-%d", "%m/%d/%Y", "%d-%m-%Y"]  # Add more formats if needed
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue
    raise ValueError("Invalid date format. Expected YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY")




from django.utils import timezone
from pytz import timezone as pytz_timezone
from datetime import datetime
from bson import ObjectId
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['DELETE'])
def delete_open_order_invoice(request):
    """
    Delete a user-specific invoice from the openOrders collection using invoice_id and user_id.
    """
    try:
        invoice = request.data.get('invoice')  # Receive full invoice

        user_id = request.data.get('user_id')

        if not user_id or not invoice:
            return Response(
                {"error": "Missing user_id or invoice"},
                status=status.HTTP_400_BAD_REQUEST
            )
        invoice_id = invoice.get('_id')
        
        # Try deleting from openOrders collection where both _id and user_id match
        result = openOrders_collection.delete_one({
            "_id": ObjectId(invoice_id),
            "user_id": user_id
        })
        # also cancelling the order in the orders collection
        #  # 🔍 Get user info from users_collection

        # 📦 Prepare invoice content
                
        if result.deleted_count == 0:
            return Response(
                {"error": "Invoice not found for this user in openOrders"},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {"message": "Open order invoice deleted successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": f"Server error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



@api_view(['DELETE'])
def delete_received_order_invoice(request):
    """
    Delete a user-specific invoice from the receivedOrders collection using invoice_id and user_id.
    """
    try:
        invoice_id = request.data.get('invoice_id')
        user_id = request.data.get('user_id')
        print("invoice_id:", invoice_id)
        print("user_id:", user_id)
        
        if not invoice_id or not user_id:
            return Response(
                {"error": "Missing invoice_id or user_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user_id = ObjectId(user_id)  # Only convert user_id to ObjectId
        except Exception as e:
            return Response(
                {"error": f"Invalid user_id format: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Try deleting from receivedOrders collection where both _id and user_id match
        result = receivedOrder.delete_one({
            "_id": invoice_id,  # No conversion to ObjectId for invoice_id
            "user_id": user_id
        })

        if result.deleted_count == 0:
            return Response(
                {"error": "Invoice not found for this user in receivedOrders"},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {"message": "Received order invoice deleted successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": f"Server error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def automate_order(request):
    """
    Save a new invoice to the database with Karachi/Pakistan timezone handling.
    """
    try:
        data = request.data
        user_id = request.data.get('user_id')
        vendor_id = request.data.get('vendor_id')
        # Set Karachi timezone
        karachi_tz = pytz_timezone('Asia/Karachi')
        
        # Validate required fields
        required_fields = ["products", "vendor_id","vendor", "vendorPhone", "date", "user_id"]
        if not all(field in data for field in required_fields):
            return Response(
                {"error": f"Missing required fields. Required: {', '.join(required_fields)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate products array
        if not isinstance(data["products"], list) or len(data["products"]) == 0:
            return Response(
                {"error": "Products must be a non-empty array"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate total amount
        try:
            total_amount = sum(
                float(p.get("price", 0)) * int(p.get("quantity", 0))
                for p in data["products"]
            )
        except (ValueError, TypeError) as e:
            return Response(
                {"error": f"Invalid product data: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Parse and validate date (assuming input is in Karachi time)
        try:
            # If date comes as string (e.g., "2023-12-31")
            invoice_date_naive = datetime.strptime(data["date"], "%Y-%m-%d")
            invoice_date = karachi_tz.localize(invoice_date_naive)
        except ValueError as e:
            return Response(
                {"error": f"Invalid date format. Use YYYY-MM-DD: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create new invoice document with Karachi time
        invoice = {
            "user_id": user_id,
            "vendor_id":data["vendor_id"],  # Convert vendor_id to ObjectId

            "products": [{
                "name": p["name"].strip(),
                "category": p.get("category", "").strip(),
                "quantity": int(p["quantity"]),
                "price": float(p["price"]),
            } for p in data["products"]],
            "vendor": data["vendor"].strip(),
            "vendorPhone": data["vendorPhone"],
            "date": invoice_date,
            "total_amount": round(total_amount, 2),
            "created_at": datetime.now(karachi_tz),  # Current Karachi time
            "status": "confirmed",
            "timezone": "Asia/Karachi"  # Store the timezone for reference
        }
        # Check for duplicate invoice
        existing_invoice = invoices_collection.find_one({
            "user_id": user_id,
            "vendor": data["vendor"].strip(),
            "products.name": data["products"][0]["name"].strip(),
            "date": invoice_date
        })

        if existing_invoice:
            return Response(
                {"message": "Invoice already exists", "invoice_id": str(existing_invoice["_id"])},
                status=status.HTTP_200_OK
            )
        # Insert into invoice database
        result = invoices_collection.insert_one(invoice)
        invoice["_id"] = result.inserted_id  # Add the _id to reuse it in openOrders
        
        #insert into open order
        openOrders_collection.insert_one(invoice)
        user_info = db['users'].find_one({"_id": ObjectId(user_id)})
        shop_name = user_info.get('shopname', 'Shahjeee') if user_info else 'Shahjeee'
        # 📦 Prepare invoice content
        vendor = invoice.get('vendor', 'Unknown Vendor')
        total_amount = invoice.get('total_amount', 0)
        formatted_date = invoice.get('formatted_date', str(datetime.utcnow()))
        product_lines = ""

        for product in invoice.get('products', []):
            name = product.get('name', 'Unnamed')
            price = product.get('price', 0)
            quantity = product.get('quantity', 0)
            line_total = round(price * quantity, 2)
            product_lines += f"\n🟢 {name}\n   Qty: {quantity} × Rs.{price:.2f} = Rs.{line_total:.2f}"

        # 📄 Final message body
        message_body = (
            f"📦 *Business Inventory Confirmation*\n"
            f"🛍️ Shop: {shop_name}\n"
            f"🏷️ Vendor: {vendor}\n"
            f"📅 Date: {formatted_date}\n"
            f"📌 Status: Confirmed\n\n"
            f"📋 Products:{product_lines}\n\n"
            f"💰 Total Amount: Rs.{total_amount:.2f}\n"
            f"✅ Thank you for using Business Inventory!"
        )
        vendor_phone = invoice.get('vendorPhone', None)
        if vendor_phone:
            phone_number = f"+{vendor_phone}" if not str(vendor_phone).startswith("+") else str(vendor_phone)
            message = client.messages.create(
                body=message_body,
                from_=TWILIO_NUMBER,
                to=phone_number
            )
        print(f"📤 Twilio message sent! SID: {message.sid}")
        
        return Response({
            "message": "Invoice and order created successfully",
            "invoice_id": str(result.inserted_id),
            "total_amount": invoice["total_amount"],
            "date": invoice_date.strftime("%Y-%m-%d %H:%M:%S %Z%z"),
            "created_at": invoice["created_at"].strftime("%Y-%m-%d %H:%M:%S %Z%z")
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {"error": f"Server error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )   


@api_view(['POST'])
def save_invoice(request):
    """
    Save a new invoice to the database with Karachi/Pakistan timezone handling.
    """
    try:
        data = request.data
        user_id = request.data.get('user_id')

        # Set Karachi timezone
        karachi_tz = pytz_timezone('Asia/Karachi')
        
        # Validate required fields
        required_fields = ["products", "vendor_id","vendor", "vendorPhone", "date", "user_id"]
        if not all(field in data for field in required_fields):
            return Response(
                {"error": f"Missing required fields. Required: {', '.join(required_fields)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate products array
        if not isinstance(data["products"], list) or len(data["products"]) == 0:
            return Response(
                {"error": "Products must be a non-empty array"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate total amount
        try:
            total_amount = sum(
                float(p.get("price", 0)) * int(p.get("quantity", 0))
                for p in data["products"]
            )
        except (ValueError, TypeError) as e:
            return Response(
                {"error": f"Invalid product data: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Parse and validate date (assuming input is in Karachi time)
        try:
            # If date comes as string (e.g., "2023-12-31")
            invoice_date_naive = datetime.strptime(data["date"], "%Y-%m-%d")
            invoice_date = karachi_tz.localize(invoice_date_naive)
        except ValueError as e:
            return Response(
                {"error": f"Invalid date format. Use YYYY-MM-DD: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for duplicate invoice
        existing_invoice = invoices_collection.find_one({
            "user_id": user_id,
            "vendor": data["vendor"].strip(),
            "products.name": data["products"][0]["name"].strip(),
            "date": invoice_date
        })

        if existing_invoice:
            return Response(
                {"message": "Invoice already exists", "invoice_id": str(existing_invoice["_id"])},
                status=status.HTTP_200_OK
            )

        # Create new invoice document with Karachi time
        invoice = {
            "user_id": user_id,
            "vendor_id":data["vendor_id"],  # Convert vendor_id to ObjectId

            "products": [{
                "productname_id": p.get("product_id", ""),
                "name": p["name"].strip(),
                "category": p.get("category", "").strip(),
                "quantity": int(p["quantity"]),
                "price": float(p["price"]),
            } for p in data["products"]],
            "vendor": data["vendor"].strip(),
            "vendorPhone": data["vendorPhone"],
            "date": invoice_date,
            "total_amount": round(total_amount, 2),
            "created_at": datetime.now(karachi_tz),  # Current Karachi time
            "status": "pending",
            "timezone": "Asia/Karachi"  # Store the timezone for reference
        }

        # Insert into database
        result = invoices_collection.insert_one(invoice)
        invoice["_id"] = result.inserted_id  # Add the _id to reuse it in openOrders
        print("Invoice saved:", invoice)
         # Save the same invoice in openOrders collection
        # openOrders_collection.insert_one(invoice)
        return Response({
            "message": "Invoice created successfully",
            "invoice_id": str(result.inserted_id),
            "total_amount": invoice["total_amount"],
            "date": invoice_date.strftime("%Y-%m-%d %H:%M:%S %Z%z"),
            "created_at": invoice["created_at"].strftime("%Y-%m-%d %H:%M:%S %Z%z")
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {"error": f"Server error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )   

@api_view(['GET'])
def get_invoices(request):
    """
    Retrieve all invoices for a specific user with pagination support.
    """
    try:
        user_id = request.query_params.get('user_id')
        
        if not user_id:
            return Response(
                {"error": "user_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Pagination parameters for invoices
        invoice_page = int(request.query_params.get('invoice_page', 1))
        invoice_per_page = int(request.query_params.get('invoice_per_page', 10))
        invoice_skip = (invoice_page - 1) * invoice_per_page

    
          # Pagination parameters for openOrders
        order_page = int(request.query_params.get('order_page', 1))
        order_per_page = int(request.query_params.get('order_per_page', 10))
        order_skip = (order_page - 1) * order_per_page
        # Get total count for pagination metadata
        total_invoices = invoices_collection.count_documents({"user_id": user_id})

        # === INVOICES ===
        total_invoices = invoices_collection.count_documents({"user_id": user_id})
        invoice_cursor = invoices_collection.find({"user_id": user_id}) \
            .sort("created_at", -1) \
            .skip(invoice_skip) \
            .limit(invoice_per_page)

        invoices = []
        for invoice in invoice_cursor:
            invoice["_id"] = str(invoice["_id"])
            if isinstance(invoice["created_at"], datetime):
                invoice["formatted_date"] = invoice["created_at"].strftime("%I:%M (%m/%d/%Y)")
                invoice["created_at"] = invoice["created_at"].isoformat()
            invoices.append(invoice)

        # === OPEN ORDERS ===
        total_orders = openOrders_collection.count_documents({"user_id": user_id})
        order_cursor = openOrders_collection.find({"user_id": user_id}) \
            .sort("created_at", -1) \
            .skip(order_skip) \
            .limit(order_per_page)
        open_orders = []
        for order in order_cursor:
            order["_id"] = str(order["_id"])
            if isinstance(order["created_at"], datetime):
                order["formatted_date"] = order["created_at"].strftime("%I:%M (%m/%d/%Y)")
                order["created_at"] = order["created_at"].isoformat()
            open_orders.append(order)
        # Response
        # print("Invoices:", invoices)
        # print("Open Orders:", open_orders)
        openOrderLen = len(open_orders)
        return Response({
            "invoices": {
                "data": invoices,
                "pagination": {
                    "total": total_invoices,
                    "page": invoice_page,
                    "per_page": invoice_per_page,
                    "total_pages": (total_invoices + invoice_per_page - 1) // invoice_per_page
                }
            },
            "open_orders": {
                "data": open_orders,
                "pagination": {
                    "total": total_orders,
                    "page": order_page,
                    "per_page": order_per_page,
                    "total_pages": (total_orders + order_per_page - 1) // order_per_page
                }
            },"openOrderLen": openOrderLen
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": f"Failed to fetch invoices: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
def update_invoice(request, invoice_id):
    """
    Update an existing invoice with new data.
    """
    try:
        data = request.data
        user_id = data.get('user_id')

        if not user_id:
            return Response(
                {"error": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate invoice_id
        if not isinstance(invoice_id, str) or not invoice_id.strip():
            return Response(
                {"error": "Invalid invoice ID format"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find the existing invoice
        existing_invoice = invoices_collection.find_one({
            "_id": ObjectId(invoice_id),
            "user_id": user_id
        })

        if not existing_invoice:
            return Response(
                {"error": "Invoice not found or not owned by user"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prepare update data
        update_data = {}
        if "products" in data and isinstance(data["products"], list) and len(data["products"]) > 0:
            update_data["products"] = [{
                "name": str(p.get("name", "")).strip(),
                "category": str(p.get("category", "")).strip(),
                "quantity": int(p.get("quantity", 0)),
                "price": float(p.get("price", 0))
            } for p in data["products"]]

            # Recalculate total amount
            update_data["total_amount"] = round(sum(
                p["price"] * p["quantity"] for p in update_data["products"]
            ), 2)

        # Update the invoice
        result = invoices_collection.update_one(
            {"_id": ObjectId(invoice_id)},
            {"$set": update_data}
        )

        if result.modified_count == 1:
            return Response(
                {"message": "Invoice updated successfully"},
                status=status.HTTP_200_OK
            )
        return Response(
            {"message": "No changes detected"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": f"Failed to update invoice: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(["DELETE"])
def delete_invoice(request, invoice_id):
    try:
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {"error": "user_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"Delete request for invoice {invoice_id} from user {user_id}")
        
        # Validate invoice_id
        try:
            invoice_obj_id = ObjectId(invoice_id)
        except:
            return Response(
                {"error": "Invalid invoice ID format"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete only if invoice belongs to user
        result = invoices_collection.delete_one({
            "_id": invoice_obj_id,
            "user_id": user_id
        })
        
        if result.deleted_count == 1:
            logger.info(f"Successfully deleted invoice {invoice_id}")
            return Response(
                {"message": "Invoice deleted successfully"},
                status=status.HTTP_200_OK
            )
        else:
            # Check if invoice exists but doesn't belong to user
            exists = invoices_collection.find_one({"_id": invoice_obj_id})
            if exists:
                logger.warning(f"User {user_id} attempted to delete non-owned invoice {invoice_id}")
                return Response(
                    {"error": "Invoice not owned by user"},
                    status=status.HTTP_403_FORBIDDEN
                )
            else:
                logger.warning(f"Attempted to delete non-existent invoice {invoice_id}")
                return Response(
                    {"error": "Invoice not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

    except Exception as e:
        logger.error(f"Error deleting invoice {invoice_id}: {str(e)}", exc_info=True)
        return Response(
            {"error": f"Failed to delete invoice: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
ACCOUNT_SID = 'AC315cc5ec7c39aaef3cc30151cb726d11'
AUTH_TOKEN = '5d063214b996ccdc77668d17fbf001a4'  # replace with your real token
TWILIO_NUMBER = '+12704564698'
client = Client(ACCOUNT_SID, AUTH_TOKEN)
@api_view(['POST'])
def confirm_invoice(request, invoice_id):
    """Confirm an invoice (change status to confirmed)."""
    try:
        user_id = request.query_params.get('user_id')  # Changed from request.data to query_params
        invoice_data = request.data  # Access the sent invoice JSON
        print("invoice_data", invoice_data)
        if not user_id:
            return Response(
                {"error": "user_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate invoice_id
        if not ObjectId.is_valid(invoice_id):
            return Response(
                {"error": "Invalid invoice ID format"},
                status=status.HTTP_400_BAD_REQUEST
            )
        # First check if invoice already exists in openOrders
        # existing_order = openOrders_collection.find_one({"_id": ObjectId(invoice_id)})
        # if existing_order:
        #     return Response(
        #         {"error": "Order already placed"},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )
        # Update status only if invoice belongs to user
        result = invoices_collection.update_one(
            {
                "_id": ObjectId(invoice_id),
                "user_id": user_id
            },
            {
                "$set": {
                    "status": "confirmed",
                    "confirmed_at": datetime.utcnow()  # Add confirmation timestamp
                }
            }
        )

        if result.modified_count == 1:
              # Fetch confirmed invoice to insert into openOrders
            confirmed_invoice = invoices_collection.find_one({"_id": ObjectId(invoice_id)})

            if confirmed_invoice:
                # Assuming the date comes in the invoice data
                # Generate new ObjectId for openOrders
                # Create a copy of the invoice for openOrders
                open_order = confirmed_invoice.copy()
                
                date_str = open_order.get('date')
                if isinstance(date_str, str):
                    # Parse string date to datetime
                    invoice_date = datetime.strptime(date_str, "%Y-%m-%d")
                elif isinstance(date_str, datetime):
                    invoice_date = date_str
                else:
                    # Default to current date if no valid date found
                    invoice_date = datetime.utcnow()
                open_order['date'] = invoice_date
                open_order.pop('_id',None)

                openOrders_collection.insert_one(open_order)
                #  # 🔍 Get user info from users_collection
                user_info = db['users'].find_one({"_id": ObjectId(user_id)})
                shop_name = user_info.get('shopname', 'Shahjeee') if user_info else 'Shahjeee'
                # 📦 Prepare invoice content
                vendor = confirmed_invoice.get('vendor', 'Unknown Vendor')
                total_amount = confirmed_invoice.get('total_amount', 0)
                formatted_date = confirmed_invoice.get('formatted_date', str(datetime.utcnow()))
                product_lines = ""

                for product in confirmed_invoice.get('products', []):
                    name = product.get('name', 'Unnamed')
                    price = product.get('price', 0)
                    quantity = product.get('quantity', 0)
                    line_total = round(price * quantity, 2)
                    product_lines += f"\n🟢 {name}\n   Qty: {quantity} × Rs.{price:.2f} = Rs.{line_total:.2f}"

                # 📄 Final message body
                message_body = (
                    f"📦 *Business Inventory Confirmation*\n"
                    f"🛍️ Shop: {shop_name}\n"
                    f"🏷️ Vendor: {vendor}\n"
                    f"📅 Date: {formatted_date}\n"
                    f"📌 Status: Confirmed\n\n"
                    f"📋 Products:{product_lines}\n\n"
                    f"💰 Total Amount: Rs.{total_amount:.2f}\n"
                    f"✅ Thank you for using Business Inventory!"
                )
                vendor_phone = confirmed_invoice.get('vendorPhone', None)
                if vendor_phone:
                    phone_number = f"+{vendor_phone}" if not str(vendor_phone).startswith("+") else str(vendor_phone)
                    message = client.messages.create(
                        body=message_body,
                        from_=TWILIO_NUMBER,
                        to=phone_number
                    )
                print(f"📤 Twilio message sent! SID: {message.sid}")
                # message = client.messages.create(
                #     body='This is a test message',
                #     from_=TWILIO_NUMBER,
                #     to='+923340274581'
                # )

                # print(f"Sent! SID: {message.sid}")
            return Response(
                {
                    "message": "Invoice confirmed successfully",
                    "invoice_id": str(invoice_id)
                },
                status=status.HTTP_200_OK
            )
        else:
            # Check if invoice exists but doesn't belong to user
            exists = invoices_collection.find_one({"_id": ObjectId(invoice_id)})
            if exists:
                return Response(
                    {"error": "Invoice not owned by user"},
                    status=status.HTTP_403_FORBIDDEN
                )
            return Response(
                {"error": "Invoice not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    except Exception as e:
        return Response(
            {"error": f"Failed to confirm invoice: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# views.py

# views.py


def log_audit_action(db, user_id, action, entity_type, entity_id=None, metadata=None):
    log = {
        "user_id": ObjectId(user_id),
        "action": action,  # e.g., 'create', 'update', 'delete', 'search'
        "entity_type": entity_type,  # e.g., 'product'
        "entity_id": ObjectId(entity_id) if entity_id else None,
        "timestamp": datetime.utcnow(),
        "metadata": metadata or {}
    }
    
    try:
        db["auditLogs"].insert_one(log)
        return True
    except Exception as e:
        print(f"Failed to log audit action: {str(e)}")
        return False
    
    
    
@api_view(['GET'])
def get_logs(request):
    user_id = request.GET.get('user_id')
    entity_type = request.GET.get('entity_type')  # e.g., 'vendor' or 'product'

    print(f"📥 Fetching logs for user_id: {user_id}, entity_type: {entity_type}")

    if not user_id or not ObjectId.is_valid(user_id):
        return JsonResponse({"error": "Invalid or missing user_id"}, status=400)

    try:
        query = {"user_id": ObjectId(user_id)}
        if entity_type:
            query["entity_type"] = entity_type  # filter by entity_type if given

        logs_cursor = db["auditLogs"].find(query).sort("timestamp", -1)
        logs = list(logs_cursor)

        if not logs:
            return JsonResponse({"message": "No logs found for this user and entity type"}, status=404)

        for log in logs:
            if '_id' in log:
                log['_id'] = str(log['_id'])
            if 'user_id' in log:
                log['user_id'] = str(log['user_id'])
            if 'entity_id' in log and log['entity_id'] is not None:
                log['entity_id'] = str(log['entity_id'])
            if 'timestamp' in log and log['timestamp'] is not None:
                try:
                    log['timestamp'] = log['timestamp'].strftime("%Y-%m-%d %H:%M:%S")
                except Exception:
                    log['timestamp'] = str(log['timestamp'])

        return JsonResponse({"logs": logs}, safe=False, status=200)

    except Exception as e:
        print("❌ Failed to fetch logs:", str(e))
        return JsonResponse({"error": "Internal server error"}, status=500)

# product CRUD operations
from django.http import StreamingHttpResponse
from rest_framework.decorators import api_view
import csv
import json
from bson import ObjectId

class Echo:
    """An object that implements just the write method of the file-like interface."""
    def write(self, value):
        return value

@api_view(['GET'])
def export_products(request):
    user_id = request.GET.get('user_id')
    print("User ID:", user_id)

    if not user_id or not ObjectId.is_valid(user_id):
        return HttpResponse(
            json.dumps({"error": "Invalid or missing user_id"}),
            status=400,
            content_type='application/json'
        )

    doc = db["products"].find_one({"user_id": ObjectId(user_id)}, {"products": 1})

    if not doc or "products" not in doc or not doc["products"]:
        return HttpResponse(
            json.dumps({"error": "No products found for this user"}),
            status=404,
            content_type='application/json'
        )

    products = doc["products"]

    # Generator that yields CSV lines
    def row_generator():
        pseudo_buffer = Echo()
        writer = csv.DictWriter(pseudo_buffer, fieldnames=[
            "productname_id", "productname", "category", "subcategory",
            "stockquantity", "reorderthreshold", "costprice", "sellingprice",
            "timespan", "expirydate", "monthly_sales", "Barcode",
            "vendor_id", "productSize", "sale_date", "season"
        ])
        yield writer.writerow(dict(zip(writer.fieldnames, writer.fieldnames)))  # write headers

        for product in products:
            yield writer.writerow({
                "productname_id": product.get("productname_id"),
                "productname": product.get("productname"),
                "category": product.get("category"),
                "subcategory": product.get("subcategory"),
                "stockquantity": product.get("stockquantity"),
                "reorderthreshold": product.get("reorderthreshold"),
                "costprice": product.get("costprice"),
                "sellingprice": product.get("sellingprice"),
                "timespan": product.get("timespan"),
                "expirydate": product.get("expirydate"),
                "monthly_sales": product.get("monthly_sales"),
                "Barcode": product.get("Barcode"),
                "vendor_id": product.get("vendor_id"),
                "productSize": product.get("productSize"),
                "sale_date": product.get("sale_date"),
                "season": product.get("season"),
            })

    response = StreamingHttpResponse(
        row_generator(),
        content_type='text/csv'
    )
    print("donw=============")
    response['Content-Disposition'] = 'attachment; filename="products.csv"'
    response['Access-Control-Allow-Origin'] = '*'

    print("🚀 Streaming CSV export started")
    return response


@api_view(['POST'])
def add_product(request):
    try:
        data = json.loads(request.body)
        print("Received Data:", data)
        user_id = data.get("userId")
        if not user_id:
            return JsonResponse({"error": "userId is required"}, status=400)

        product_data = {
            "productname_id": data.get("productname_id"),
            "productname": data.get("productName"),
            "category": data.get("category"),
            "subcategory": data.get("subcategory"),
            "stockquantity": int(data.get("stockquantity", 0)),
            "reorderthreshold": int(data.get("reorderthreshold", 0)),
            "costprice": float(data.get("costprice", 0)),
            "sellingprice": float(data.get("sellingprice", 0)),
            "timespan": data.get("timespan"),
            "expirydate": data.get("expirydate"),
            "monthly_sales": int(data.get("monthly_sales", 0)),
            "Barcode": data.get("Barcode"),
            "vendor_id": data.get("vendor_id"),
            "productSize": data.get("productSize"),
            "sale_date": data.get("sale_date"),
            "season": data.get("season")
        }
  
        result = db["products"].update_one(
            {"user_id": ObjectId(user_id)},
            {
                "$push": {"products": product_data},
                "$setOnInsert": {
                    "dataset_id": ObjectId(),
                    "upload_date": datetime.utcnow()
                }
            },
            upsert=True
        )
        # Convert UTC to Pakistan time
        utc_time = datetime.utcnow()
        pkt = pytz.timezone("Asia/Karachi")
        pkt_time = utc_time.astimezone(pkt)

        # Format as "09:39 AM 30/05/2025"
        formatted_time = pkt_time.strftime("%I:%M %p %d/%m/%Y")
        
        last_added_product = product_data
        # 📝 Metadata for audit log
        metadata = {
            "productname": product_data.get("productname"),
            "productname_id": product_data.get("productname_id"),
            "category": product_data.get("category"),
            "timestamp": formatted_time,
        }

        log_audit_action(
            db=db,
            user_id=user_id,
            action="create",
            entity_type="product",
            entity_id=None,  # Optional: product_id if you have one
            metadata=metadata
        )
        print("product added successfully")
        print("meta data",product_data)
        # print("🆔 Unique productname_ids list:", unique_product_ids)
        return JsonResponse({
            "message": "Product added successfully",
            "productAdded": product_data,
            "lastAddedProduct": last_added_product,
          
            "matchedCount": result.matched_count,
            "modifiedCount": result.modified_count,
            "upsertedId": str(result.upserted_id) if result.upserted_id else None,
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
def delete_product(request):
    try:
        data = json.loads(request.body)
        print("Received Data for Delete:", data)

        user_id = data.get("userId")
        product_id = data.get("productname_id")

        if not user_id or not product_id:
            return JsonResponse({"error": "userId and product_id are required"}, status=400)

        
# 🧠 Step 1: Remove product from array
        result = db["products"].update_one(
            {"user_id": ObjectId(user_id), "products.productname_id": product_id},
            {"$pull": {"products": {"productname_id": product_id}}}
        )


        if result.modified_count == 0:
            return JsonResponse({"error": "No products found to delete"}, status=404)
 # 📋 Step 2: Log the deletion
        # Convert UTC to Pakistan time
        utc_time = datetime.utcnow()
        pkt = pytz.timezone("Asia/Karachi")
        pkt_time = utc_time.astimezone(pkt)

        # Format as "09:39 AM 30/05/2025"
        formatted_time = pkt_time.strftime("%I:%M %p %d/%m/%Y")
        log_audit_action(
            db=db,
            user_id=user_id,
            action="delete",
            entity_type="product",
            entity_id=product_id,
            metadata={
                "timestamp": formatted_time,
            }
        )

        

        return JsonResponse({
            "message": "Product deleted successfully",
          
            "modifiedCount": result.modified_count
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        print("Error deleting :", str(e))
        return JsonResponse({"error": "Failed to delete "}, status=500)

@api_view(['POST'])
def update_product(request):
     # Start timer for performance monitoring
    start_time = time.time()
    try:
# 1. Efficient Data Parsing
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON payload"}, status=400)
        print("Received Data for Update:", data)

        
        # 2. Essential Field Validation
        required_fields = ['userId', 'productname_id']
        if not all(field in data for field in required_fields):
            return JsonResponse(
                {"error": f"Required fields missing: {', '.join(required_fields)}"},
                status=400
            )
        user_id = data.get("userId")
        product_id = data.get("productname_id")

        # 3. Validate ObjectId format early
        if not ObjectId.is_valid(user_id):
            return JsonResponse({"error": "Invalid user ID format"}, status=400)
         # 4. Prepare update data efficiently
        update_fields = {
            'productname': str,
            'category': str,
            'subcategory': str,
            'stockquantity': int,
            'reorderthreshold': int,
            'costprice': float,
            'sellingprice': float,
            'timespan': str,
            'expirydate': str,
            'monthly_sales': int,
            'Barcode': str,
            'vendor_id': str,
            'productSize': str,
            'sale_date': str,
            'season': str
        }

        # Remove keys with None values to avoid overwriting existing data with null
        update_data = {}
        for field, field_type in update_fields.items():
            if field in data and data[field] is not None:
                try:
                    update_data[f"products.$.{field}"] = field_type(data[field])
                except (ValueError, TypeError):
                    continue  # Skip invalid conversions
        if not update_data:
            return JsonResponse({"error": "No valid fields to update"}, status=400)
        # Add timestamp separately
        update_data["products.$.last_updated"] = datetime.utcnow()
        # Build the update query
        if not update_data:
            return JsonResponse({"error": "No valid fields to update"}, status=400)
        # 5. Optimized Database Operation
        try:
            result = db["products"].update_one(
                {
                    "user_id": ObjectId(user_id),
                    "products.productname_id": product_id
                },
                {"$set": update_data}
            )
        except pymongo.errors.PyMongoError as e:
            print(f"MongoDB error: {str(e)}")
            return JsonResponse({"error": "Database operation failed"}, status=500)
        
        # 6. Handle results
        if result.matched_count == 0:
            return JsonResponse({"error": "Product not found"}, status=404)
        # Convert UTC to Pakistan time
        utc_time = datetime.utcnow()
        pkt = pytz.timezone("Asia/Karachi")
        pkt_time = utc_time.astimezone(pkt)

        # Format as "09:39 AM 30/05/2025"
        formatted_time = pkt_time.strftime("%I:%M %p %d/%m/%Y")
        # 📋 Log audit action
        log_audit_action(
            db=db,
            user_id=user_id,
            action="update",
            entity_type="product",
            entity_id=product_id,
            metadata={
                "updatedFields": list(update_data.keys()),
                "timestamp": formatted_time,
            }
        )
# 8. Performance metrics
        duration = time.time() - start_time
        print(f"Update completed in {duration:.3f} seconds")
        print("✅ Product updated successfully")
        return JsonResponse({
            "success": True,
            "productId": product_id,
            "updatedFields": list(update_data.keys()),
            "processingTime": f"{duration:.3f} seconds"
        }, status=200)

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return JsonResponse(
            {"error": "Internal server error"},
            status=500
        )


@api_view(['POST'])
def search_product(request):
    try:
        data = json.loads(request.body)
        print("Received Data for Search:", data)

        user_id = data.get("userId")
        if not user_id:
            return JsonResponse({"error": "userId is required"}, status=400)

         # Filters based on product fields
        product_name = data.get("productName")
        product_id = data.get("productId")
        category = data.get("category")

        # Match conditions for product-level fields
        match_conditions = {}

        if product_name:
            match_conditions["products.productname"] = {"$regex": product_name, "$options": "i"}  # <-- FIXED

        if product_id:
            match_conditions["products.productname_id"] = product_id  # <-- FIXED

        if category:
            match_conditions["products.category"] = {"$regex": category, "$options": "i"}

        # Aggregation pipeline for searching products
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {"$unwind": "$products"},
            {"$match": match_conditions},
            {
                "$project": {
                    "_id": 0,
                    "product": "$products"
                }
            }
        ]

        result = list(db["products"].aggregate(pipeline))

        matched_products = [item["product"] for item in result]
        print("Matched Products:", matched_products)
        return JsonResponse({
            "message": f"Found {len(matched_products)} matching products",
            "matchedProducts": matched_products,
            "totalMatches": len(matched_products)
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        print("Error searching products:", str(e))
        return JsonResponse({"error": "Failed to search products"}, status=500)


# vendor CRUD operations
from django.http import HttpResponse
import csv
from rest_framework.decorators import api_view
from pymongo import MongoClient
from bson import ObjectId
import json



@api_view(['GET'])
def export_vendors(request):
    user_id = request.GET.get('user_id')
    
    if not user_id or not ObjectId.is_valid(user_id):
        return HttpResponse(
            json.dumps({"error": "Invalid or missing user_id"}),
            status=400,
            content_type='application/json'
        )

    doc = db["vendors"].find_one({"user_id": ObjectId(user_id)}, {"vendors": 1})

    if not doc or "vendors" not in doc or not doc["vendors"]:
        return HttpResponse(
            json.dumps({"error": "No vendors found for this user"}),
            status=404,
            content_type='application/json'
        )

    vendors = doc["vendors"]

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="vendors.csv"'
    response['Access-Control-Allow-Origin'] = '*'

    writer = csv.DictWriter(response, fieldnames=[
        "vendor_id", "vendor", "category", "vendorPhone",
        "DeliveryTime", "ReliabilityScore", "last_updated"
    ])
  
    writer.writeheader()
    for v in vendors:
        writer.writerow({
            "vendor_id": v.get("vendor_id"),
            "vendor": v.get("vendor"),
            "category": v.get("category"),
            "vendorPhone": v.get("vendorPhone"),
            "DeliveryTime": v.get("DeliveryTime"),
            "ReliabilityScore": v.get("ReliabilityScore"),
            "last_updated": v.get("last_updated")
        })

    print("✅ Vendor CSV download started")
    return response


@api_view(['POST'])
def add_vendor(request):
    try:
        data = json.loads(request.body)
        print("Received Data:", data)

        user_id = data.get("userId")
        if not user_id:
            return JsonResponse({"error": "userId is required"}, status=400)

        vendor_data = {
            "vendor_id": data.get("vendor_id"),
            "vendor": data.get("vendor"),
            "category": data.get("category"),
            "vendorPhone": data.get("vendorPhone"),
            "DeliveryTime": float(data.get("DeliveryTime", 0)),
            "ReliabilityScore": float(data.get("ReliabilityScore", 0)),
            "last_updated": data.get("last_updated"),
        }

        # Step 1: Insert or push vendor into user document
        result = db["vendors"].update_one(
            {"user_id": ObjectId(user_id)},
            {
                "$push": {"vendors": vendor_data},
                "$setOnInsert": {
                    "dataset_id": ObjectId(),
                    "created_at": datetime.utcnow()
                }
            },
            upsert=True
        )

        # Step 2: Get updated document to count and find vendors
        updated_doc = db["vendors"].find_one({"user_id": ObjectId(user_id)})

        if not updated_doc:
            return JsonResponse({"error": "Document not found after insert"}, status=500)

        # Count unique vendors by `vendor_id`
        unique_vendors = {}
        for v in updated_doc.get("vendors", []):
            vid = v.get("vendor_id")
            if vid:
                unique_vendors[vid] = v

        total_unique_vendors = len(unique_vendors)
        print("Total Unique Vendors:", total_unique_vendors)
        # Newly added vendor (last one pushed)
        last_added_vendor = updated_doc.get("vendors", [])[-1] if updated_doc.get("vendors") else None
        # Convert UTC to Pakistan time
        utc_time = datetime.utcnow()
        pkt = pytz.timezone("Asia/Karachi")
        pkt_time = utc_time.astimezone(pkt)

        # Format as "09:39 AM 30/05/2025"
        formatted_time = pkt_time.strftime("%I:%M %p %d/%m/%Y")
        metadata = {
            "vendor_id": vendor_data.get("vendor_id"),
            "vendor": vendor_data.get("vendor"),
            "category": vendor_data.get("category"),
            "timestamp": formatted_time,
        }
        log_audit_action(
                    db=db,
                    user_id=user_id,
                    action="create",
                    entity_type="vendor",
                    entity_id=None,  # Optional: vendor if you have one
                    metadata=metadata
                )
        return JsonResponse({
            "message": "Vendor added successfully",
            "vendorAdded": vendor_data,
            "lastAddedVendor": last_added_vendor,
            "totalUniqueVendors": total_unique_vendors,
            "allVendorsCount": len(updated_doc.get("vendors", [])),
            "matchedCount": result.matched_count,
            "modifiedCount": result.modified_count,
            "upsertedId": str(result.upserted_id) if result.upserted_id else None,
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
def delete_vendor(request):
    try:
        data = json.loads(request.body)
        print("Received Data for Delete:", data)

        user_id = data.get("userId")
        vendor_id = data.get("vendor_id")

        if not user_id or not vendor_id:
            return JsonResponse({"error": "userId and vendor_id are required"}, status=400)

        # Remove vendor from vendors array where vendor_id matches
        result = db["vendors"].update_one(
            {"user_id": ObjectId(user_id)},
            {"$pull": {"vendors": {"vendor_id": vendor_id}}}
        )

        if result.modified_count == 0:
            return JsonResponse({"error": "No vendor found to delete"}, status=404)

        # Fetch updated document to confirm deletion
        updated_doc = db["vendors"].find_one({"user_id": ObjectId(user_id)})

        unique_vendors = {}
        for v in updated_doc.get("vendors", []):
            vid = v.get("vendor_id")
            if vid:
                unique_vendors[vid] = v

        total_unique_vendors = len(unique_vendors)
        # Convert UTC to Pakistan time
        utc_time = datetime.utcnow()
        pkt = pytz.timezone("Asia/Karachi")
        pkt_time = utc_time.astimezone(pkt)

        # Format as "09:39 AM 30/05/2025"
        formatted_time = pkt_time.strftime("%I:%M %p %d/%m/%Y")
 # 📋 Step 2: Log the deletion
        log_audit_action(
            db=db,
            user_id=user_id,
            action="delete",
            entity_type="vendor",
            entity_id=vendor_id,
            metadata={
                "timestamp": formatted_time,
            }
        )

        return JsonResponse({
            "message": "Vendor deleted successfully",
            "vendorId": vendor_id,
            "totalUniqueVendors": total_unique_vendors,
            "modifiedCount": result.modified_count
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        print("Error deleting vendor:", str(e))
        return JsonResponse({"error": "Failed to delete vendor"}, status=500)

@api_view(['POST'])
def update_vendor(request):
    try:
        data = json.loads(request.body)
        print("Received Data for Update:", data)

        user_id = data.get("userId")
        vendor_id = data.get("vendor_id")

        if not user_id or not vendor_id:
            return JsonResponse({"error": "userId and vendor_id are required"}, status=400)

        # Fields that can be updated
        update_data = {
            "vendor": data.get("vendor"),
            "category": data.get("category"),
            "vendorPhone": data.get("vendorPhone"),
            "DeliveryTime": float(data.get("DeliveryTime", 0)),
            "ReliabilityScore": float(data.get("ReliabilityScore", 0)),
            "last_updated": datetime.utcnow().isoformat()  # Auto update timestamp
        }

        # Filter out None values to only update provided fields
        update_data = {k: v for k, v in update_data.items() if v is not None}

        if not update_data:
            return JsonResponse({"error": "No valid fields to update"}, status=400)

        # Build update operator dynamically
        update_operator = {}
        for key, value in update_data.items():
            update_operator[f"vendors.$.{key}"] = value

        # Update the matched vendor in the array
        result = db["vendors"].update_one(
            {"user_id": ObjectId(user_id), "vendors.vendor_id": vendor_id},
            {"$set": update_operator}
        )

        if result.matched_count == 0:
            return JsonResponse({"error": "Vendor not found"}, status=404)
# 📋 Log audit action
        utc_time = datetime.utcnow()
        pkt = pytz.timezone("Asia/Karachi")
        pkt_time = utc_time.astimezone(pkt)

        # Format as "09:39 AM 30/05/2025"
        formatted_time = pkt_time.strftime("%I:%M %p %d/%m/%Y")
        log_audit_action(
            db=db,
            user_id=user_id,
            action="update",
            entity_type="vendor",
            entity_id=vendor_id,
            metadata={
                "updatedFields": list(update_data.keys()),
                "timestamp": formatted_time,
            }
        )
        return JsonResponse({
            "message": "Vendor updated successfully",
            "vendorId": vendor_id,
            "updatedFields": update_data,
            "matchedCount": result.matched_count,
            "modifiedCount": result.modified_count
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        print("Error updating vendor:", str(e))
        return JsonResponse({"error": "Failed to update vendor"}, status=500)


@api_view(['POST'])
def search_vendor(request):
    try:
        data = json.loads(request.body)
        print("Received Data for Search:", data)

        user_id = data.get("userId")
        if not user_id:
            return JsonResponse({"error": "userId is required"}, status=400)

        # Build query filters
        vendor_name = data.get("vendorName")
        vendor_id = data.get("vendorId")
        category = data.get("category")

        # Start building match conditions
        match_conditions = {}

        if vendor_name:
            match_conditions["vendors.vendor"] = {"$regex": vendor_name, "$options": "i"}  # Case-insensitive

        if vendor_id:
            match_conditions["vendors.vendor_id"] = vendor_id

        if category:
            match_conditions["vendors.category"] = {"$regex": category, "$options": "i"}

        # Aggregation pipeline
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {"$unwind": "$vendors"},
            {"$match": match_conditions},
            {
                "$project": {
                    "_id": 0,
                    "vendor": "$vendors"
                }
            }
        ]

        result = list(db["vendors"].aggregate(pipeline))

        matched_vendors = [item["vendor"] for item in result]

        return JsonResponse({
            "message": f"Found {len(matched_vendors)} matching vendors",
            "matchedVendors": matched_vendors,
            "totalMatches": len(matched_vendors)
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        print("Error searching vendors:", str(e))
        return JsonResponse({"error": "Failed to search vendors"}, status=500)

# Notifications  operations
notifications_collection = db["notifications"]
products_collection = db["products"]

@api_view(['GET'])
def get_notifications(request):
    user_id = request.query_params.get('user_id')
    if not user_id:
        return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        notifications = list(notifications_collection.find({"user_id": ObjectId(user_id)}).sort([("read", 1), ("created_at", -1)]))

        for notification in notifications:
            notification['_id'] = str(notification['_id'])
            notification['user_id'] = str(notification['user_id'])
            if 'product_ids' in notification:
                notification['product_ids'] = [str(pid) for pid in notification['product_ids']]
        # print("Notifications fetched:", notifications)

        return Response(notifications)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_notifications(request):
    user_id = request.data.get('user_id')
    notification_ids = request.data.get('notification_ids', [])

    if not user_id or not notification_ids:
        return Response({"error": "User ID and notification IDs are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        notification_object_ids = [ObjectId(id) for id in notification_ids]
        result = notifications_collection.delete_many({"_id": {"$in": notification_object_ids}, "user_id": ObjectId(user_id)})

        return Response({"deleted_count": result.deleted_count})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
def mark_notification_as_read(request):
    user_id = request.data.get('user_id')
    notification_id = request.data.get('notification_id')

    if not user_id or not notification_id:
        return Response({"error": "User ID and notification ID are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        result = notifications_collection.update_one(
            {"_id": ObjectId(notification_id), "user_id": ObjectId(user_id)},
            {"$set": {"read": True, "updated_at": datetime.utcnow()}}
        )

        if result.modified_count == 0:
            return Response({"error": "Notification not found or already read"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"success": True})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def check_stock_levels(request):
    user_id = request.query_params.get('user_id')
    if not user_id:
        # print("Error: User ID is required")
        return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # print(f"Fetching product data for user_id: {user_id}")
        # Fetch all product documents for the user
        product_documents = products_collection.find({"user_id": ObjectId(user_id)})
        # print(f"Fetched {product_documents.count_documents()} product documents")

        stock_levels = {
            "out_of_stock": 0,
            "low_stock": 0,
            "expiring_soon": 0,
            "expired": 0
        }

        now = datetime.utcnow()
        seven_days_from_now = now + timedelta(days=7)

        for product_doc in product_documents:
            # print(f"Processing product document: {product_doc['_id']}")
            products = product_doc.get("products", [])
            if not isinstance(products, list):
                continue  # Skip invalid data

            for product in products:
                stockquantity = product.get("stockquantity", 0)
                reorderthreshold = product.get("reorderthreshold", 10)  # Default to 10 if missing
                expiry_date = product.get("expirydate")

                if stockquantity == 0:
                    stock_levels["out_of_stock"] += 1
                elif stockquantity < reorderthreshold:
                    stock_levels["low_stock"] += 1
                if expiry_date:
                    try:
                        # Attempt to parse the expiry date in both formats
                        expiry_date = datetime.strptime(expiry_date, "%m/%d/%Y")  # Format like '2/27/2025'
                    except ValueError:
                        try:
                            expiry_date = datetime.strptime(expiry_date, "%Y-%m-%d")  # Format like '2025-02-27'
                        except ValueError:
                            # print(f"Skipping product {product.get('productname')} due to invalid expiry date format")
                            continue

                    if now < expiry_date <= seven_days_from_now:
                        stock_levels["expiring_soon"] += 1
                        # print(f"Product {product.get('productname')} is expiring soon")
                    elif expiry_date < now:
                        stock_levels["expired"] += 1
                        # print(f"Product {product.get('productname')} has expired")
        # print("Final stock levels:", stock_levels)
        create_notifications_for_stock_levels(user_id, stock_levels, products_collection, notifications_collection)

        return Response(stock_levels)

    except Exception as e:
        print(f"Error checking stock levels: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def get_vendor_by_id(request):
    user_id = request.data.get("userId")
    vendor_id = request.data.get("vendor_id")

    vendor_doc = db["vendors"].find_one({"user_id": ObjectId(user_id)})
    if not vendor_doc:
        return Response({"error": "User not found"}, status=404)

    vendor = next((v for v in vendor_doc.get("vendors", []) if v["vendor_id"] == vendor_id), None)
    if not vendor:
        return Response({"error": "Vendor not found"}, status=404)

    return Response({"vendor": vendor}, status=200)

@api_view(['POST'])
def get_product_by_id(request):
    user_id = request.data.get("userId")
    product_id = request.data.get("productId")

    if not user_id or not product_id:
        return Response({"error": "userId and productId are required"}, status=400)

    # Step 1: Find the document by user ID
    product_doc = db["products"].find_one({"user_id": ObjectId(user_id)})
    if not product_doc:
        return Response({"error": "User not found"}, status=404)

    # Step 2: Find the specific product by productId
    product = next((p for p in product_doc.get("products", []) if p.get("productname_id") == product_id), None)
    if not product:
        return Response({"error": "Product not found"}, status=404)
    print("Product found:", product)
    # Step 3: Return the matched product
    return Response({"product": product}, status=200)








def create_notifications_for_stock_levels(user_id, stock_levels, products_collection, notifications_collection):
    try:
        user_id_obj = ObjectId(user_id)
        utc_time = datetime.utcnow()
        pkt = pytz.timezone("Asia/Karachi")
        pkt_time = utc_time.astimezone(pkt)

        # Format as "09:39 AM 30/05/2025"
        formatted_time = pkt_time.strftime("%I:%M %p %d/%m/%Y")
        now = formatted_time
        # print(f"Creating notifications for user {user_id} with stock levels {stock_levels}")

        notification_types = {
            "out_of_stock": {"message": "{} products are out of stock"},
            "low_stock": {"message": "{} products are low in stock"},
            "expiring_soon": {"message": "{} products are expiring soon"},
            "expired": {"message": "{} products have expired"}
        }

        for n_type, data in notification_types.items():
            count = stock_levels.get(n_type, 0)
            if count > 0:
                message = data["message"].format(count)
                # print(f"Creating notification for type: {n_type} with message: {message}")
                notifications_collection.insert_one({
                    "user_id": user_id_obj,
                    "type": n_type,
                    "message": message,
                    "count": count,
                    "read": False,
                    "created_at": now,
                    "updated_at": now
                })
                # print(f"Notification created for {n_type} with count: {count}")

    except Exception as e:
        print(f"Error creating notifications: {str(e)}")



# demand  forecasting
@api_view(['POST'])
def train_models(request):
    """Endpoint to train all prediction models"""
    try:
        user_id = str(request.user.id)
        predictor = DemandPredictor(user_id)
        results = predictor.train_models()
        
        return Response({
            'status': 'success',
            'message': 'All models trained successfully',
            'results': results
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


import re  # Add this with your other imports
# ======================
# Utility to Fetch Categories
# Utility to Fetch Categories
import numpy as np
def fetch_categories_from_products(user_id):
    """Utility to fetch unique categories for a user"""
    product_documents = db["products"].find({"user_id": ObjectId(user_id)})
    return list({product.get("category") 
               for doc in product_documents 
               for product in doc.get("products", []) 
               if product.get("category")})

def fetch_products_by_category(user_id, category):
    """Utility to fetch products by category"""
    product_documents = db.products.find({"user_id": ObjectId(user_id)})
    return [
        {
            **product,
            "id": str(product.get("_id", ""))
        }
        for doc in product_documents
        for product in doc.get("products", [])
        if product.get("category") == category
    ]



@api_view(['POST'])
def predict_demand(request):
    """Debugging version with step-by-step logging"""
    try:
        print("\n=== Starting inovice prediction Request ===")
        
        # 1. Validate input
        user_id = request.data.get('user_id')
        product_name = request.data.get('productname')
        selling_price = request.data.get('sellingprice')
        category = request.data.get('category')  # Default to 'Unknown'
        selected_month = request.data.get('selectedMonth')
        product_id = request.data.get("productname_id")
        print("userid",user_id)
        
        print(f"Received - product_id: {product_id}, Product: {product_name}, Category: {category}, Month: {selected_month}")


        print(f"Product ID: {product_id}, Selling Price: {selling_price}")

        # 6. Fetch historical data for the product
        predictor = DemandPredictor(user_id)
        print("✅ Predictor initialized")

        pipeline = [
        {'$match': {'user_id': ObjectId(user_id)}},
        {'$unwind': '$forecasting'},
        {'$match': {'forecasting.productname_id': product_id}},
        {'$replaceRoot': {'newRoot': '$forecasting'}}
        ]
        product_history = list(predictor.forecasting_collection.aggregate(pipeline))

        print(f"✅ Aggregation fetched {len(product_history)} entries for product: {product_id}")
        for i, rec in enumerate(product_history[-3:]):
            print(f"[{i+1}] Date: {rec['sale_date']} | Sales: {rec['monthly_sales']}")

        # # If product_id returned nothing, try using category as fallback
        # if len(product_history) == 0:
        #     print(f"⚠️ No records found for product_id {product_id}, attempting category fallback for: {category}")

        #     fallback_pipeline = [
        #         {'$match': {'user_id': ObjectId(user_id)}},
        #         {'$unwind': '$forecasting'},
        #         {'$match': {'forecasting.category': category}},
        #         {'$replaceRoot': {'newRoot': '$forecasting'}}
        #     ]
        #     product_history = list(predictor.forecasting_collection.aggregate(fallback_pipeline))

        #     print(f"📦 Fallback Aggregation by category '{category}' fetched {len(product_history)} entries")
        #     for i, rec in enumerate(product_history[-3:]):
        #         print(f"[{i+1}] Date: {rec.get('sale_date')} | Sales: {rec.get('monthly_sales')}")
      
        # # Extra check: List all available product IDs under the user
        # product_ids_cursor = predictor.forecasting_collection.aggregate([
        #     {'$match': {'user_id': ObjectId(user_id)}},
        #     {'$unwind': '$forecasting'},
        #     {'$group': {'_id': '$forecasting.productname_id'}}
        # ])
        # for pid_doc in product_ids_cursor:
        #     print(f" - {pid_doc['_id']}")
        
        
        
        
        
        
        
        
        # Validate selected month format
        valid_months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]
        if selected_month not in valid_months:
            return Response({'status': 'error', 'message': f'Invalid month: {selected_month}'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        if len(product_history) < 3:
            return Response({'status': 'error', 'message': f'Need at least 3 months data (found {len(product_history)})'}, status=400)
        # Prepare historical data (skip 0s for rolling)
        historical_data = []
        month_sales = {}
        for rec in product_history:
            try:
                date = datetime.strptime(rec['sale_date'], '%Y-%m-%d')
                sales = rec.get('monthly_sales', 0)
                if sales is not None:
                    month_str = date.strftime('%B')  # Get month name
                    historical_data.append({'date': date.strftime('%Y-%m-%d'), 'sales': sales})
                    if month_str not in month_sales:
                        month_sales[month_str] = []
                    month_sales[month_str].append(sales)
            except ValueError as e:
                print(f"Invalid date in record: {rec} - {e}")

        print(f"📊 Month-wise sales breakdown: {month_sales}")
        print("\n🧮 Preparing prediction input...")
        
        
        
        last_month_sales = product_history[0]['monthly_sales']
        
        
        print("histroical data")
        for record in historical_data:
            print(f"Date: {record['date']} | Sales: {record['sales']}")
       
       
       
        

        # Map months to indices
        month_indices = {
            "January": 0, "February": 1, "March": 2, "April": 3,
            "May": 4, "June": 5, "July": 6, "August": 7,
            "September": 8, "October": 9, "November": 10, "December": 11
        }
        index_to_month = {v: k for k, v in month_indices.items()}
        selected_index = month_indices[selected_month]

        # Create an array of monthly sales
        monthly_sales_array = [0] * 12
        for month, values in month_sales.items():
            if month in month_indices and values:
                monthly_sales_array[month_indices[month]] = sum(values)

                # Function to safely retrieve sales data
        def get_sales(index_offset, monthly_sales_array, selected_index):
            idx = selected_index - index_offset
            return monthly_sales_array[idx] if 0 <= idx < 12 else 0
        # Calculate rolling averages and sales difference
        # Get rolling average for last N months
        def get_rolling_avg(n):
            values = []
            for i in range(1, n + 1):
                idx = selected_index - i
                if idx >= 0:
                    values.append(monthly_sales_array[idx])
            nonzero = [v for v in values if v > 0]
            return round(sum(nonzero) / len(nonzero), 2) if nonzero else 1  # Default fallback value if no non-zero sales are found



          # Get previous month sales
        prev_month_sales = get_sales(1, monthly_sales_array, selected_index)
        prev_2_month_sales = get_sales(2, monthly_sales_array, selected_index)
        prev_3_month_sales = get_sales(3, monthly_sales_array, selected_index)
        
        rolling_avg_3m = round((prev_month_sales + prev_2_month_sales + prev_3_month_sales) / 3, 2)
        rolling_avg_6m = get_rolling_avg(6)
        sales_diff_1m = round(prev_month_sales - prev_2_month_sales, 2)

        # Construct prediction input
        prediction_input = {
            'season': category,
            'prev_month_sales': prev_month_sales,
            'prev_2_month_sales': prev_2_month_sales,
            'prev_3_month_sales': prev_3_month_sales,
            'rolling_avg_3m': rolling_avg_3m,
            'rolling_avg_6m': rolling_avg_6m,
            'sales_diff_1m': sales_diff_1m
        }
        print("Prediction Input:", prediction_input)
        print("\n🔮 Making prediction...")
        result = predictor.predict_sales(prediction_input, selected_month)
        print("Prediction Result:", result)
        print('his',historical_data)
        return Response({
            'status': 'success',
            'prediction': result['prediction'],
            'model_used': result['model_used'],
            'last_month_sales': last_month_sales,
            'selling_price': selling_price,
            'product': product_name,
            'product_id': product_id,
            'season': category,
            'historical_data':historical_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("\n🔥 Critical Error:", str(e))
        return Response({
            'status': 'error',
            'message': str(e),
            'stack_trace': traceback.format_exc()
        }, status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET'])
def bestSales(request):
    """Debugging version with step-by-step logging"""
    try:
        print("\n=== Starting Prediction Request ===")
        
        # 1. Validate input
        user_id = request.GET.get('user_id')
        if not user_id:
            print("user id not found")
        utc_time = datetime.utcnow()
        pkt = pytz.timezone("Asia/Karachi")
        pkt_time = utc_time.astimezone(pkt)

        # Format as "09:39 AM 30/05/2025"
        formatted_time = pkt_time.strftime("%I:%M %p %d/%m/%Y")
        today_date = formatted_time# Get current UTC date
        print("user",user_id)

        pipeline = [
                {"$match": {"user_id": ObjectId(user_id)}},
                {"$unwind": "$products"},
                {
                    "$group": {
                        "_id": None,
                        "total_unique_products": {"$addToSet": "$products.productname"},
                        "expired_products_list": {
                            "$sum": {
                                "$cond": [
                                {"$lt": ["$products.expirydate", today_date]},
                                    1,
                                    0
                                ]
                            }
                        },
                        "total_vendors": {"$addToSet": "$products.vendor_id"},
                        "all_products": {"$push": "$products"}  # Keep all products for next stage

                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "total_unique_products": {"$size": "$total_unique_products"},
                        "expired_products_list": 1,
                        "total_vendors": {"$size": "$total_vendors"},

                         "best_product": {
                            "$reduce": {
                                "input": "$all_products",
                                "initialValue": {
                                    "monthly_sales": -1,
                                    "product": None
                                },
                                "in": {
                                    "$cond": [
                                        {"$gt": ["$$this.monthly_sales", "$$value.monthly_sales"]},
                                        {
                                            "monthly_sales": "$$this.monthly_sales",
                                            "product": "$$this"
                                        },
                                        "$$value"
                                    ]
                                }
                            }
                        }
                    }
                },
                
                # Final projection to clean up output
                {
                    "$project": {
                        "total_unique_products": 1,
                        "expired_products_list": 1,
                        "total_vendors": 1,
                        "best_product": "$best_product.product"
                    }
                }
            ]

# Get the best product from the aggregation pipeline
        result = list(db["products"].aggregate(pipeline))
        print("Aggregation Result:", result)
        if not result:
            return Response({"error": "No products found for this user!"}, status=404)
        if result:
            best_product = result[0]["best_product"]
            product_id = best_product["productname_id"]
            product_name = best_product["productname"]
            selling_price = best_product["sellingprice"]
            category = best_product["category"]
        current_month = datetime.now().strftime('%B')
        selected_month = current_month
        print(f"Product ID: {product_id}, Selling Price: {selling_price}")
    
        product_id = best_product['productname_id']
        selling_price = best_product["sellingprice"]
        category = best_product["category"]
        predictor = DemandPredictor(user_id)
        print("✅ Predictor initialized")

        pipeline = [
        {'$match': {'user_id': ObjectId(user_id)}},
        {'$unwind': '$forecasting'},
        {'$match': {'forecasting.productname_id': product_id}},
        {'$replaceRoot': {'newRoot': '$forecasting'}}
        ]
        product_history = list(predictor.forecasting_collection.aggregate(pipeline))

        print(f"✅ Aggregation fetched {len(product_history)} entries for product: {product_id}")
        for i, rec in enumerate(product_history[-3:]):
            print(f"[{i+1}] Date: {rec['sale_date']} | Sales: {rec['monthly_sales']}")

        # Validate selected month format
        valid_months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]
        if selected_month not in valid_months:
            return Response({'status': 'error', 'message': f'Invalid month: {selected_month}'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        if len(product_history) < 3:
            return Response({'status': 'error', 'message': f'Need at least 3 months data (found {len(product_history)})'}, status=400)
        # Prepare historical data (skip 0s for rolling)
        historical_data = []
        month_sales = {}
        for rec in product_history:
            try:
                date = datetime.strptime(rec['sale_date'], '%Y-%m-%d')
                sales = rec.get('monthly_sales', 0)
                if sales is not None:
                    month_str = date.strftime('%B')  # Get month name
                    historical_data.append({'date': date.strftime('%Y-%m-%d'), 'sales': sales})
                    if month_str not in month_sales:
                        month_sales[month_str] = []
                    month_sales[month_str].append(sales)
            except ValueError as e:
                print(f"Invalid date in record: {rec} - {e}")

        print(f"📊 Month-wise sales breakdown: {month_sales}")
        print("\n🧮 Preparing prediction input...")
        
        
        
        last_month_sales = product_history[0]['monthly_sales']
        
        
        print("histroical data")
        for record in historical_data:
            print(f"Date: {record['date']} | Sales: {record['sales']}")
       
       
       
        

        # Map months to indices
        month_indices = {
            "January": 0, "February": 1, "March": 2, "April": 3,
            "May": 4, "June": 5, "July": 6, "August": 7,
            "September": 8, "October": 9, "November": 10, "December": 11
        }
        index_to_month = {v: k for k, v in month_indices.items()}
        selected_index = month_indices[selected_month]

        # Create an array of monthly sales
        monthly_sales_array = [0] * 12
        for month, values in month_sales.items():
            if month in month_indices and values:
                monthly_sales_array[month_indices[month]] = sum(values)

                # Function to safely retrieve sales data
        def get_sales(index_offset, monthly_sales_array, selected_index):
            idx = selected_index - index_offset
            return monthly_sales_array[idx] if 0 <= idx < 12 else 0
        # Calculate rolling averages and sales difference
        # Get rolling average for last N months
        def get_rolling_avg(n):
            values = []
            for i in range(1, n + 1):
                idx = selected_index - i
                if idx >= 0:
                    values.append(monthly_sales_array[idx])
            nonzero = [v for v in values if v > 0]
            return round(sum(nonzero) / len(nonzero), 2) if nonzero else 1  # Default fallback value if no non-zero sales are found



          # Get previous month sales
        prev_month_sales = get_sales(1, monthly_sales_array, selected_index)
        prev_2_month_sales = get_sales(2, monthly_sales_array, selected_index)
        prev_3_month_sales = get_sales(3, monthly_sales_array, selected_index)
        
        rolling_avg_3m = round((prev_month_sales + prev_2_month_sales + prev_3_month_sales) / 3, 2)
        rolling_avg_6m = get_rolling_avg(6)
        sales_diff_1m = round(prev_month_sales - prev_2_month_sales, 2)

        # Construct prediction input
        prediction_input = {
            'season': category,
            'prev_month_sales': prev_month_sales,
            'prev_2_month_sales': prev_2_month_sales,
            'prev_3_month_sales': prev_3_month_sales,
            'rolling_avg_3m': rolling_avg_3m,
            'rolling_avg_6m': rolling_avg_6m,
            'sales_diff_1m': sales_diff_1m
        }
        print("Prediction Input:", prediction_input)
        print("\n🔮 Making prediction...")
        result = predictor.predict_sales(prediction_input, selected_month)
        print("Prediction Result:", result)
        # print('his',historical_data)
        print(best_product)
        return Response({
            'status': 'success',
            'prediction': result['prediction'],
            'best_product': best_product, # or however you get it

        }, status=status.HTTP_200_OK)

    except Exception as e:
        print("\n🔥 Critical Error:", str(e))
        return Response({
            'status': 'error',
            'message': str(e),
            'stack_trace': traceback.format_exc()
        }, status=status.HTTP_400_BAD_REQUEST)






# prediction start her
@api_view(['POST'])
def predict_sales(request):
    """Debugging version with step-by-step logging"""
    try:
        print("\n=== Starting Prediction Request ===")
        
        # 1. Validate input
        user_id = request.data.get('user_id')
        product_name = request.data.get('productname')
        category = request.data.get('category')  # Default to 'Unknown'
        selected_month = request.data.get('selectedMonth')
        
        print(f"Received - User: {user_id}, Product: {product_name}, Category: {category}, Month: {selected_month}")

        # Validate required fields
        if not user_id:
            print("❌ Missing user_id")
            return Response({'status': 'error', 'message': 'user_id is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
            
        if not product_name:
            print("❌ Missing product name")
            return Response({'status': 'error', 'message': 'Product name is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if not selected_month:
            print("❌ Missing selected month")
            return Response({'status': 'error', 'message': 'Month is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        if not category or category == 'Unknown':
            print("❌ Missing or invalid category")
            return Response({'status': 'error', 'message': 'Category is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {"$unwind": "$products"},
                {
                    "$project": {
                        "category": "$products.category",
                        "productname": "$products.productname",
                        "selling_price": "$products.sellingprice",
                        "barcode": "$products.Barcode",
                        "product_id": "$products._id",
                        "productname_id": "$products.productname_id"  # Added productname_id here

                    }
                },
            {
                "$group": {
                    "_id": "$category",
                    "products": {
                        "$addToSet": {
                            "product_id": {"$toString": "$productname_id"},
                            "product_name": "$productname",
                            "selling_price": {"$ifNull": ["$selling_price", 0]},
                            "barcode": "$barcode",
                            "productname_id": "$productname_id"  # Ensure productname_id is included

                        }
                    }
                }
            }
        ]

        agg_result = list(db["products"].aggregate(pipeline))

        # Extract categories
        unique_categories = {doc['_id'] for doc in agg_result if doc['_id']}
        print(f"Fetched categories: {list(unique_categories)}")

        # Validate category
        if category not in unique_categories:
            return Response({
                'status': 'error',
                'message': f"Category '{category}' not found",
                'available_categories': list(unique_categories)
            }, status=status.HTTP_404_NOT_FOUND)

        # Extract products for the given category
        products_in_category = []
        seen_barcodes = set()

        for doc in agg_result:
            if doc['_id'] == category:
                for product in doc['products']:
                    if product['barcode'] and product['barcode'] not in seen_barcodes:
                        seen_barcodes.add(product['barcode'])
                        products_in_category.append(product)

        print(f"Products in category '{category}': {products_in_category}")

        # 5. Validate that the product_name exists in the fetched products
        matching_product = None
        for product in products_in_category:
            if product["product_name"] == product_name:
                matching_product = product
                break

        if not matching_product:
            print(f"❌ Product '{product_name}' not found in category '{category}'")
            return Response({
                'status': 'error',
                'message': f"Product '{product_name}' not found in category '{category}'",
                'available_products': [p["product_name"] for p in products_in_category]
            }, status=status.HTTP_404_NOT_FOUND)

        # print(f"✅ Product '{product_name}' found in category '{category}'")

        # Extract product details
        product_id = matching_product["product_id"]
        selling_price = matching_product["selling_price"]
        print("selected month",selected_month)
        print(f"Product ID: {product_id}, Selling Price: {selling_price}")

        # 6. Fetch historical data for the product
        predictor = DemandPredictor(user_id)
        print("✅ Predictor initialized")

        pipeline = [
        {'$match': {'user_id': ObjectId(user_id)}},
        {'$unwind': '$forecasting'},
        {'$match': {'forecasting.productname_id': product_id}},
        {'$replaceRoot': {'newRoot': '$forecasting'}}
        ]
        product_history = list(predictor.forecasting_collection.aggregate(pipeline))

        print(f"✅ Aggregation fetched {len(product_history)} entries for product: {product_id}")
        for i, rec in enumerate(product_history[-3:]):
            print(f"[{i+1}] Date: {rec['sale_date']} | Sales: {rec['monthly_sales']}")

        # Validate selected month format
        valid_months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]
        if selected_month not in valid_months:
            return Response({'status': 'error', 'message': f'Invalid month: {selected_month}'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        if len(product_history) < 3:
            return Response({'status': 'error', 'message': f'Need at least 3 months data (found {len(product_history)})'}, status=400)
        # Prepare historical data (skip 0s for rolling)
        historical_data = []
        month_sales = {}
        for rec in product_history:
            try:
                date = datetime.strptime(rec['sale_date'], '%Y-%m-%d')
                sales = rec.get('monthly_sales', 0)
                if sales is not None:
                    month_str = date.strftime('%B')  # Get month name
                    historical_data.append({'date': date.strftime('%Y-%m-%d'), 'sales': sales})
                    if month_str not in month_sales:
                        month_sales[month_str] = []
                    month_sales[month_str].append(sales)
            except ValueError as e:
                print(f"Invalid date in record: {rec} - {e}")

        print(f"📊 Month-wise sales breakdown: {month_sales}")
        print("\n🧮 Preparing prediction input...")
        
        
        
        last_month_sales = product_history[0]['monthly_sales']
        
        
        print("histroical data")
        for record in historical_data:
            print(f"Date: {record['date']} | Sales: {record['sales']}")
       
       
       
        

        # Map months to indices
        month_indices = {
            "January": 0, "February": 1, "March": 2, "April": 3,
            "May": 4, "June": 5, "July": 6, "August": 7,
            "September": 8, "October": 9, "November": 10, "December": 11
        }
        index_to_month = {v: k for k, v in month_indices.items()}
        selected_index = month_indices[selected_month]

        # Create an array of monthly sales
        monthly_sales_array = [0] * 12
        for month, values in month_sales.items():
            if month in month_indices and values:
                monthly_sales_array[month_indices[month]] = sum(values)

                # Function to safely retrieve sales data
        def get_sales(index_offset, monthly_sales_array, selected_index):
            idx = selected_index - index_offset
            return monthly_sales_array[idx] if 0 <= idx < 12 else 0
        # Calculate rolling averages and sales difference
        # Get rolling average for last N months
        def get_rolling_avg(n):
            values = []
            for i in range(1, n + 1):
                idx = selected_index - i
                if idx >= 0:
                    values.append(monthly_sales_array[idx])
            nonzero = [v for v in values if v > 0]
            return round(sum(nonzero) / len(nonzero), 2) if nonzero else 1  # Default fallback value if no non-zero sales are found



          # Get previous month sales
        prev_month_sales = get_sales(1, monthly_sales_array, selected_index)
        prev_2_month_sales = get_sales(2, monthly_sales_array, selected_index)
        prev_3_month_sales = get_sales(3, monthly_sales_array, selected_index)
        
        rolling_avg_3m = round((prev_month_sales + prev_2_month_sales + prev_3_month_sales) / 3, 2)
        rolling_avg_6m = get_rolling_avg(6)
        sales_diff_1m = round(prev_month_sales - prev_2_month_sales, 2)

        # Construct prediction input
        prediction_input = {
            'season': category,
            'prev_month_sales': prev_month_sales,
            'prev_2_month_sales': prev_2_month_sales,
            'prev_3_month_sales': prev_3_month_sales,
            'rolling_avg_3m': rolling_avg_3m,
            'rolling_avg_6m': rolling_avg_6m,
            'sales_diff_1m': sales_diff_1m
        }
        print("Prediction Input:", prediction_input)
        print("\n🔮 Making prediction...")
        result = predictor.predict_sales(prediction_input, selected_month)
        print("Prediction Result:", result)
        print('his',historical_data)
        return Response({
            'status': 'success',
            'prediction': result['prediction'],
            'model_used': result['model_used'],
            'last_month_sales': last_month_sales,
            'selling_price': selling_price,
            'product': product_name,
            'product_id': product_id,
            'season': category,
            'historical_data':historical_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("\n🔥 Critical Error:", str(e))
        return Response({
            'status': 'error',
            'message': str(e),
            'stack_trace': traceback.format_exc()
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def last_sales_month(request):
    try:
        # 1. Extract user_id from query parameters
        user_id = request.query_params.get('user_id')

        if not user_id:
            return Response(
                {"status": "error", "message": "User ID is required"},
                status=400
            )

        # 2. Validate user_id format
        try:
            user_object_id = ObjectId(user_id)
        except Exception as e:
            return Response(
                {"status": "error", "message": f"Invalid user ID format: {e}"},
                status=400
            )

        # 3. Connect to MongoDB (ensure the connection is properly handled)
        try:
            db = MongoClient(
                "mongodb+srv://syeddaniyalhashmi123:test123@cluster0.dutvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
            ).FYP
        except PyMongoError as e:
            return Response(
                {"status": "error", "message": f"Database connection error: {e}"},
                status=500
            )

        # 4. Aggregation pipeline to get the last recorded sales month
        pipeline = [
            {"$match": {"user_id": user_object_id}},  # Match documents for the given user
            {"$unwind": "$forecasting"},  # Unwind the forecasting array
            {
                "$addFields": {
                    "parsed_date": {
                        "$dateFromString": {
                            "dateString": "$forecasting.sale_date",
                            "format": "%Y-%m-%d",  # Adjust the format based on your date string
                            "onError": None  # Handle invalid dates gracefully
                        }
                    }
                }
            },
            {
                "$match": {"parsed_date": {"$ne": None}}  # Filter out invalid dates
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$parsed_date"},
                        "month": {"$month": "$parsed_date"}
                    }
                }
            },
            {"$sort": {"_id.year": -1, "_id.month": -1}},  # Sort descending to get the latest month
            {"$limit": 1}  # Limit to one result
        ]

        # Execute the aggregation pipeline
        result = list(db.forecasting.aggregate(pipeline))

        if not result:
            return Response(
                {"status": "error", "message": "No sales data found for the user"},
                status=404
            )

        # 5. Format the last recorded month as "Month Year"
        last_month = result[0]
        year = last_month["_id"]["year"]
        month = last_month["_id"]["month"]

        # Ensure valid month and year values
        if not (1 <= month <= 12) or year < 1900:
            return Response(
                {"status": "error", "message": "Invalid year or month in sales data"},
                status=500
            )

        # Generate the formatted month string
        date = datetime(year, month, 1)
        formatted_month = date.strftime("%B %Y")

        # 6. Generate the next 12 months starting from the month after the last sales month
        def generate_next_12_months():
            months_list = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ]
            today = datetime.today()

            # Decide if current month is still forecastable (e.g., if today is before the 25th)
            start_month = today.month if today.day < 25 else (today.month % 12 + 1)
            start_year = today.year if today.day < 25 else (today.year if today.month < 12 else today.year + 1)

            months = []
            for i in range(12):
                next_month_index = (start_month - 1 + i) % 12
                year_offset = (start_month - 1 + i) // 12
                month_name = months_list[next_month_index]
                year = start_year + year_offset
                months.append(f"{month_name} {year}")
            return months

        available_months = generate_next_12_months()
        if not available_months:
            return Response(
                {"status": "error", "message": "Failed to generate available months"},
                status=500
            )

        print(f"Available months for prediction: {available_months}")  # Debugging: Print available months

        # 7. Return the response
        return Response({
            "status": "success",
            "last_month": formatted_month,
            "available_months": available_months
        })

    except Exception as e:
        print(f"Critical Error occurred: {str(e)}")  # Debugging: Print the error message
        return Response(
            {"status": "error", "message": str(e)},
            status=500
        )
    


@api_view(['GET'])
def get_monthly_sales(request):
    """Aggregates monthly sales for all products and returns the data."""
    try:
        print("\n=== Starting Monthly Sales Request ===")

        # 1. Validate input
        user_id = request.GET.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Aggregation pipeline to fetch and aggregate monthly sales
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {"$unwind": "$forecasting"},
            {
                "$addFields": {
                    "parsed_date": {
                        "$dateFromString": {
                            "dateString": "$forecasting.sale_date",
                            "format": "%Y-%m-%d",
                            "onError": None
                        }
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$parsed_date"},
                        "month": {"$month": "$parsed_date"}
                    },
                    "total_sales": {"$sum": "$forecasting.monthly_sales"}
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1}}
        ]

        # Months array for mapping numeric month to name
        months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ]

        # Execute the aggregation pipeline
        result = list(db["forecasting"].aggregate(pipeline))
        print("Aggregation Result:", result)

        # Transform the result into the desired format
        monthly_sales = []
        for record in result:
            if "_id" not in record or "year" not in record["_id"] or "month" not in record["_id"]:
                print("❌ Invalid record format:", record)
                continue

            year = record["_id"]["year"]
            month_num = record["_id"]["month"]

            # Ensure month_num is within valid range (1–12)
            if month_num < 1 or month_num > 12:
                print(f"❌ Invalid month number: {month_num}")
                continue

            month_name = months[month_num - 1]  # Convert numeric month to name
            month_key = f"{month_name} {year}"  # Format as "Jan 2024"
            total_sales = round(record["total_sales"], 2)  # Round to 2 decimal places

            monthly_sales.append({
                "month": month_key,
                "total_sales": total_sales
            })

        print("Monthly Sales Result:", monthly_sales)

        # Return the response
        return Response({
            "monthly_sales": monthly_sales
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print("\n🔥 Critical Error:", str(e))
        return Response({
            "status": "error",
            "message": str(e),
            "stack_trace": traceback.format_exc()
        }, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
def get_top_predicted_products(request):
    try:
        # Input validation
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({'status': 'error', 'message': 'user_id is required'}, status=400)

        print(f"\n=== Starting top products prediction for user {user_id} ===")

        # Initialize predictor
        try:
            predictor = DemandPredictor(user_id)
            print("✅ Predictor initialized")
        except Exception as e:
            print(f"❌ Predictor initialization failed: {str(e)}")
            return Response({'status': 'error', 'message': 'Predictor initialization failed'}, status=500)

        # Fetch all products for user
        try:
            product_docs = list(predictor.db.products.find({"user_id": ObjectId(user_id)}))
            print(f"Found {len(product_docs)} product documents for user")
        except Exception as e:
            print(f"❌ Product query failed: {str(e)}")
            return Response({'status': 'error', 'message': 'Failed to fetch products'}, status=500)

        if not product_docs:
            return Response({
                'status': 'success',
                'message': 'No products found for user',
                'top_predictions': []
            })

        top_predictions = []

        for doc in product_docs:
            for product in doc.get("products", []):
                try:
                    product_name = product.get("productname")
                    product_id = str(product.get("_id"))
                    selling_price = product.get("sellingprice", 0)

                    print(f"🔍 Processing: {product_name} (ID: {product_id})")

                    forecast_doc = predictor.forecasting_collection.find_one({'user_id': ObjectId(user_id)})
                    if not forecast_doc or 'forecasting' not in forecast_doc:
                        print(f"⚠️ No forecasting data found")
                        continue

                    product_history = [
                        item for item in forecast_doc['forecasting']
                        if str(item.get('productname_id')) == product_id
                    ]
                    print(f"📊 History found: {len(product_history)} records")

                    if len(product_history) < 3:
                        print(f"⚠️ Insufficient data for prediction (need 3+)")
                        continue

                    # Prediction input
                    prediction_input = {
                        'season': "April",  # Or use dynamic month if needed
                        'prev_month_sales': product_history[0]['monthly_sales'],
                        'prev_2_month_sales': product_history[1]['monthly_sales'],
                        'prev_3_month_sales': product_history[2]['monthly_sales'],
                        'rolling_avg_3m': sum([x['monthly_sales'] for x in product_history[:3]]) / 3,
                        'rolling_avg_6m': sum([x['monthly_sales'] for x in product_history[:6]]) / min(6, len(product_history)),
                        'sales_diff_1m': product_history[0]['monthly_sales'] - product_history[1]['monthly_sales']
                    }

                    result = predictor.predict_sales(prediction_input, model_type='random_forest')
                    predicted_units = result['prediction']

                    top_predictions.append({
                        'productname': product_name,
                        'product_id': product_id,
                        'predicted_units': predicted_units,
                        'selling_price': selling_price
                    })

                except Exception as e:
                    print(f"❌ Error processing product {product.get('productname')}: {str(e)}")
                    continue

        if not top_predictions:
            return Response({
                'status': 'success',
                'message': 'No valid predictions could be generated',
                'top_predictions': []
            })

        # Sort and get top 3
        top_predictions.sort(key=lambda x: x['predicted_units'], reverse=True)
        final_predictions = top_predictions[:3]

        print("\n=== Top 3 Predicted Products ===")
        for i, pred in enumerate(final_predictions, 1):
            print(f"{i}. {pred['productname']} ➜ {pred['predicted_units']} units")

        return Response({
            'status': 'success',
            'top_predictions': final_predictions
        })

    except Exception as e:
        print(f"\n🔥 Critical Error: {str(e)}")
        print(traceback.format_exc())
        return Response({
            'status': 'error',
            'message': 'Internal server error',
            'debug': str(e)
        }, status=500)

@api_view(['GET'])
def get_model_performance(request):
    """Endpoint to get performance metrics for all models"""
    try:
        user_id = str(request.user.id)
        predictor = DemandPredictor(user_id)
        
        # Check if models exist
        performance = {}
        for model_type in ['linear', 'lasso', 'random_forest', 'xgboost']:
            if os.path.exists(predictor.model_paths[model_type]):
                model = joblib.load(predictor.model_paths[model_type])
                performance[model_type] = {
                    'status': 'trained',
                    'last_trained': datetime.fromtimestamp(os.path.getmtime(predictor.model_paths[model_type])).isoformat()
                }
            else:
                performance[model_type] = {
                    'status': 'not_trained'
                }
        
        return Response({
            'status': 'success',
            'models': performance
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
        
        
        
        
        
        
        



# @api_view(['GET'])
# def get_expiry_forecast(request):
#     """
#     API endpoint to get full inventory forecast for a user
#     Expected POST payload:
#         {
#             "user_id": "67fd424c92f8f2978dde75e1"
#         }
#     """
#     user_id = request.GET.get('user_id')
#     print("Received user_id:", user_id)
#     if not user_id:
#         return Response({"error": "user_id is required!"}, status=400)

#     try:
#         # Initialize the waste reducer with user ID
#         waste_predictor = AIWasteReducer(user_id)

#         # Run prediction on all products
#         all_predictions = waste_predictor.predict_all()

#         # Convert DataFrame to list of dictionaries for JSON response
#         result = all_predictions.to_dict(orient='records')
#         print("Received user_id:", user_id)
#         # print("First product sample:", result[0])
#         return Response({
#             "status": "success",
#             "data": result
#         })

#     except Exception as e:
#         return Response({
#             "status": "error",
#             "message": str(e)
#         }, status=500)


def get_expiry_forecast(user_id, force_retrain=False):
   

    print("Received user_id:", user_id)

    if not user_id:
        return Response({"error": "Missing required parameter: user_id"}, status=400)

    try:
        # Step 1: Check if predictions are cached
        cached = db['expiry_predictions'].find_one({'user_id': ObjectId(user_id)})
        max_age_minutes = 60

        if cached:
            age = datetime.utcnow() - cached['generated_at']
            if age.total_seconds() < max_age_minutes * 60:
                print("♻️ Using cached predictions.")
                return Response({
                    "status": "success",
                    "predictions": cached['predictions'],
                    "cached_at": cached['generated_at']
                })
        # Step 2: Generate predictions since cache is missing or expired
        print("🚀 Initializing AIWasteReducer...")
        waste_reducer = AIWasteReducer(user_id)
        print("✅ Waste predictor initialized")

        if force_retrain or not waste_reducer.is_aiwaste_model_already_trained():
            print("⚙️ Training new model...")
            waste_reducer.train()
        else:
            print("♻️ Loading existing model...")
            waste_reducer.load_model_and_preprocessor_from_mongo() 
        print("✅ Model trained (or reused from memory)")

        
        df = waste_reducer._preprocessed_df
        if df.empty:
            return Response({"error": "No products found for this user."}, status=404)
        print("fetch:",df)
       
        
        
        
        prediction2 = waste_reducer.predict_all(df)
        prediction2.replace([np.inf, -np.inf, np.nan], 0, inplace=True)
        prediction2_row = prediction2.to_dict(orient='records')

        # ✅ Optionally log first 3 rows
        print("📊 Sample predictions (first 3 products):")
        print(prediction2.head(3).to_string())
         # Step 3: Store predictions in MongoDB
        db['expiry_predictions'].update_one(
            {'user_id': ObjectId(user_id)},
            {
                '$set': {
                    'predictions': prediction2_row,
                    'generated_at': datetime.utcnow()
                }
            },
            upsert=True
        )
        print("🧠 Prediction caching complete.")
        return Response({
            "status": "success",
            "predictions": prediction2_row
        }, status=200)
        
    except ValueError as ve:
        error_msg = str(ve)
        print(f"⚠️ Value Error: {error_msg}")
        return Response({"status": "error", "message": error_msg, "type": "ValueError"}, status=500)

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"🔥 Unexpected error: {str(e)}")
        return Response({
            "status": "error",
            "message": f"Unexpected error: {str(e)}",
            "type": type(e).__name__,
            "traceback": traceback.format_exc()
        }, status=500)


from datetime import datetime, timedelta
from bson import ObjectId
from rest_framework.response import Response
from rest_framework.decorators import api_view
from pymongo import ASCENDING


@api_view(['GET'])
def fetch_cached_predictions(request):
    user_id = request.GET.get('user_id')
    category = request.GET.get('category', None)
    limit = int(request.GET.get('limit', 100))  # Default to 100

    if not user_id:
        return Response({"error": "Missing required parameter: user_id"}, status=400)

    try:
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {"$unwind": "$predictions"},
            {"$replaceRoot": {"newRoot": "$predictions"}},
        ]

        # Optional: filter by category
        if category and category != "all":
            pipeline.append({"$match": {"category": category}})


        


        pipeline.extend([
        {
            "$addFields": {
                "days_left": {
                    "$ceil": {
                        "$divide": [
                            {"$subtract": ["$expirydate", "$$NOW"]},
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            }
        },
        {
            "$addFields": {
                "risk_level": {
                    "$switch": {
                        "branches": [
                            {"case": {"$lte": ["$days_left", 7]}, "then": "🔴 High"},
                            {"case": {"$lte": ["$days_left", 30]}, "then": "🟡 Medium"}
                        ],
                        "default": "🟢 Low"
                    }
                },
                "discount_suggestion": "$discount_suggestion"  # Preserve existing suggestions
            }
        },
        {"$match": {"risk_level": {"$in": ["🔴 High", "🟡 Medium"]}}},
        {
            "$project": {
                "_id": 0,
                "productname": 1,
                "category": 1,
                "stockquantity": 1,
                "expirydate": 1,
                "risk_level": 1,
                "discount_suggestion": 1,
                "days_left": 1,
                "waste_ratio": 1,
                "prediction": 1
            }
        },
        {"$sort": {"days_left": 1}},
        {"$limit": limit}
        ])

        result = list(db["expiry_predictions"].aggregate(pipeline))

        generated_at = datetime.utcnow().isoformat()  # or get from main doc

        return Response({
            "status": "success",
            "user_id": user_id,
            "generated_at": generated_at,
            "total_predictions": len(result),
            "predictions": result
        }, status=200)

    except Exception as e:
        print("Unexpected error:", str(e))
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)

# @api_view(['GET'])
# def fetch_cached_predictions(request):
#     user_id = request.GET.get('user_id')

#     if not user_id:
#         return Response({"error": "Missing required parameter: user_id"}, status=400)

#     try:
#         pipeline = [
#             {"$match": {"user_id": ObjectId(user_id)}},
#             {"$project": {
#                 "generated_at": 1,
#                 "predictions": 1
#             }}
#         ]

#         result = list(db['expiry_predictions'].aggregate(pipeline))

#         if not result:
#             return Response({"status": "error", "message": "No cached predictions found for this user."}, status=404)

#         cached = result[0]
#         predictions = cached.get("predictions", [])
#         generated_at = cached.get("generated_at")

#         if isinstance(generated_at, datetime):
#             generated_at = generated_at.isoformat()
#         print(len(predictions))
#         # print("sendinf",predictions)
#         return Response({
#             "status": "success",
#             "user_id": user_id,
#             "generated_at": generated_at,
#             "total_predictions": len(predictions),
#             "predictions": predictions
#         }, status=200)

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return Response({
#             "status": "error",
#             "message": f"Unexpected error: {str(e)}",
#             "type": type(e).__name__,
#             "traceback": traceback.format_exc()
#         }, status=500)
        
@api_view(['GET'])
def get_vendor_performance(request):
    user_id = request.GET.get('user_id')
    vendor_id = request.GET.get('vendor_id')
    print("coming ",user_id)
    print("coming ",vendor_id)

    if not user_id or not vendor_id:
        return Response({"error": "Missing required parameters: user_id and vendor_id"}, status=400)

    # Validate ObjectId format
    if not ObjectId.is_valid(user_id):
        return Response({"error": "Invalid user_id format"}, status=400)
    
    if not ObjectId.is_valid(vendor_id):
        return Response({"error": "Invalid vendor_id format"}, status=400)

    try:
        
        perf_doc = db.vendorPerformance.find_one({
            "user_id": ObjectId(user_id),
            "vendor_id": vendor_id
        })

        if not perf_doc or "deliveries" not in perf_doc or not perf_doc["deliveries"]:
            return Response({
                "success": False,
                "error": "No performance data found for this vendor. This vendor has not made any deliveries yet."
            }, status=404)
        deliveries = perf_doc.get("deliveries", [])
        total_orders = len(deliveries)

        all_delivery_days = [d['delivery_days'] for d in deliveries]
        avg_delivery_days = round(sum(all_delivery_days) / total_orders, 2) if total_orders else 0

        on_time_deliveries = sum(1 for d in deliveries if d["on_time_delivery"])
        on_time_percentage = round((on_time_deliveries / total_orders) * 100, 2) if total_orders > 0 else 100

        last_delivery_status = "On Time" if deliveries[-1]["delivery_days"] <= 1 else f"{deliveries[-1]['delivery_days']} days late"

        reliability_score_history = [{"date": d["timestamp"], "score": d["score_after"]} for d in deliveries]
        last_5_scores = [d.get("score_after", 0) for d in deliveries[-5:]]

        return Response({
            "success": True,
            "data": {
                "vendor_id": vendor_id,
                "total_orders": total_orders,
                "avg_delivery_days": avg_delivery_days,
                "on_time_percentage": on_time_percentage,
                "last_delivery_status": last_delivery_status,
                "reliability_score_history": reliability_score_history,
                "last_5_scores": last_5_scores,
                "last_updated": perf_doc.get("last_updated"),
                "first_delivery": deliveries[0]["timestamp"] if deliveries else None
            }
        }, status=200)

    except Exception as e:
        print(f"\n=== ERROR ===")
        print(f"Type: {type(e)}")
        print(f"Error: {str(e)}")
        return Response({"error": str(e)}, status=500)
    
    
    
    # sms_sender.py
from twilio.rest import Client
# from sms_sender import send_invoice_sms

# Twilio credentials
  # your Twilio number

# def send_sms(to_number, message):
#     client = Client(ACCOUNT_SID, AUTH_TOKEN)

#     try:
#         message = client.messages.create(
#             body=message,
#             from_=TWILIO_NUMBER,
#             to=to_number
#         )
#         return f"Message sent! SID: {message.sid}"
#     except Exception as e:
#         return f"Error: {e}"


# def send_invoice_sms(to_number, invoice_text):
#     result = send_sms(to_number, invoice_text)
#     return result