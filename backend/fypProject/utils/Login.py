import bcrypt
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from pymongo import MongoClient
from rest_framework.response import Response
from bson import ObjectId
# MongoDB Atlas connection
client = MongoClient("mongodb+srv://syeddaniyalhashmi123:test123@cluster0.dutvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["FYP"]

SECRET_KEY = settings.SECRET_KEY if hasattr(settings, 'SECRET_KEY') else "fallback_secret_key"
class Login:

    @staticmethod
    def authenticate_user(email, password):
        try:
            user = db["users"].find_one({"email": email})

            if not user:
                return {"error": "User does not exist!"}, 404
    # Ensure password is stored as bytes in MongoDB
            stored_password = user["password"]
            if isinstance(stored_password, str):
                stored_password = stored_password.encode('utf-8')  # Convert to bytes if stored as string

            # Verify password
            if not bcrypt.checkpw(password.encode('utf-8'), stored_password):
                return {"error": "Invalid password!"}, 400
          # Check if dataset is uploaded
            # Check user status
            status = user.get("status", "incomplete")  # Default to "incomplete" if not found

            # Generate JWT token
            payload = {
                "id": str(user["_id"]),
                "email": user["email"],
                "exp": datetime.utcnow() + timedelta(hours=24)  # Token valid for 24 hours
            }

            # Correct usage of jwt.encode() with PyJWT
            token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
            # Trigger stock level check
            # Trigger stock level check after successful login

            return {
                "message": "Login successful!",
                "token": token,
                "userId": str(user["_id"])  ,
                "status": status  # Send status in response
            # Include userId in the response
            }, 200
        except Exception as e:
            # Handle any unexpected errors
            return {"error": f"An error occurred: {str(e)}"}, 500