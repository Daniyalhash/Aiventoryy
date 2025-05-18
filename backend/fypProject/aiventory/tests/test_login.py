from django.test import TestCase
from utils.Login import Login
from pymongo import MongoClient
import bcrypt


class LoginTestCase(TestCase):

    def setUp(self):
        # DB Setup
        client = MongoClient("mongodb+srv://syeddaniyalhashmi123:test123@cluster0.dutvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        self.db = client["FYP"]
        self.user_data = {
            "username": "TestUser",
            "email": "testuser@gmail.com",
            "password": bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            "status": "incomplete"
        }
        self.db["users"].insert_one(self.user_data)

    def tearDown(self):
        # Cleanup
        self.db["users"].delete_many({"email": "testuser@gmail.com"})

    def test_login_success(self):
        res, status = Login.authenticate_user("testuser@gmail.com", "password123")
        self.assertEqual(status, 200)
        self.assertIn("Login successful!", res["message"])
        self.assertIn("token", res)

    def test_login_wrong_password(self):
        res, status = Login.authenticate_user("testuser@gmail.com", "wrongpassword")
        self.assertEqual(status, 400)
        self.assertIn("Invalid password!", res["error"])

    def test_login_user_not_exist(self):
        res, status = Login.authenticate_user("notexist@gmail.com", "password123")
        self.assertEqual(status, 404)
        self.assertIn("User does not exist!", res["error"])
