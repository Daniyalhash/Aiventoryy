from django.test import TestCase
from pymongo import MongoClient
from bson import ObjectId
from utils.insights2_utils  import InsightsManager  # update the path accordingly


class InsightsManagerTestCase(TestCase):
    
    def setUp(self):
        # Connect to MongoDB
        self.client = MongoClient("mongodb+srv://syeddaniyalhashmi123:test123@cluster0.dutvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        self.db = self.client["FYP"]

        # Create test user
        self.user_id = self.db.users.insert_one({
            "email": "lowstock@test.com",
            "password": "dummy123"
        }).inserted_id

        # Insert products for this user
        self.db.products.insert_one({
            "user_id": ObjectId(self.user_id),
            "products": [
                {
                    "productname": "Coke",
                    "category": "Beverages",
                    "stockquantity": 2,
                    "reorderthreshold": 5,
                    "vendor_id": ObjectId(),
                    "costprice": 20,
                    "sellingprice": 30
                },
                {
                    "productname": "Fanta",
                    "category": "Beverages",
                    "stockquantity": 10,
                    "reorderthreshold": 5,
                    "vendor_id": ObjectId(),
                    "costprice": 18,
                    "sellingprice": 28
                }
            ]
        })

        self.insights_manager = InsightsManager(self.db)

    def tearDown(self):
        # Clean up after each test
        self.db.users.delete_many({})
        self.db.products.delete_many({})

    def test_get_low_stock_products(self):
        response, status_code = self.insights_manager.get_low_stock_products(str(self.user_id))

        self.assertEqual(status_code, 200)
        self.assertIn("low_stock_products", response)
        
        # Only "Coke" should be low in stock
        self.assertEqual(len(response["low_stock_products"]), 1)
        self.assertEqual(response["low_stock_products"][0]["productname"], "Coke")
        self.assertEqual(response["low_stock_products"][0]["stockquantity"], 2)

    def test_get_low_stock_products_invalid_user(self):
        response, status_code = self.insights_manager.get_low_stock_products("invalid_id")

        self.assertEqual(status_code, 500)  # invalid ObjectId should return error
        self.assertIn("error", response)

    def test_get_low_stock_products_no_user_id(self):
        response, status_code = self.insights_manager.get_low_stock_products(None)

        self.assertEqual(status_code, 400)
        self.assertIn("error", response)
