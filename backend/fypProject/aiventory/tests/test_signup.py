from django.test import TestCase
from pymongo import MongoClient
from utils.Signup import Signup

client = MongoClient("mongodb+srv://syeddaniyalhashmi123:test123@cluster0.dutvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["FYP"]

class SignupTestCase(TestCase):
    
    def setUp(self):
        # Clean up before test
        db["users"].delete_many({})

    def test_register_user_success(self):
        res, status = Signup.register_user("testuser", "test@email.com", "testpass123")
        self.assertEqual(status, 201)
        self.assertIn("User registered successfully!", res["message"])

    def test_register_user_existing_email(self):
        Signup.register_user("testuser", "test@email.com", "testpass123")
        res, status = Signup.register_user("testuser2", "test@email.com", "anotherpass")
        self.assertEqual(status, 400)
        self.assertEqual(res["error"], "User already exists!")

