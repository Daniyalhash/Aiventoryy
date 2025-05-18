from django.test import TestCase
from bson import ObjectId
from utils.insights_utils import InsightsUtils
from pymongo import MongoClient

class InsightsUtilsTestCase(TestCase):
    
    def setUp(self):
        # MongoDB Test Setup
        self.client = MongoClient("mongodb+srv://syeddaniyalhashmi123:test123@cluster0.dutvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        self.db = self.client["FYP"]

        # Insert a test user
        self.user_id = self.db.users.insert_one({
            "email": "testuser@example.com",
            "password": "dummy123"
        }).inserted_id

        # Insert dummy products for that user
        self.db.products.insert_one({
            "user_id": ObjectId(self.user_id),
            "products": [
                {
                    "productname": "Pepsi",
                    "category": "Beverages",
                    "stockquantity": 50,
                    "sellingprice": 30,
                    "Barcode": "123456",
                    "expirydate": "2025-12-31"
                },
                {
                    "productname": "Sprite",
                    "category": "Beverages",
                    "stockquantity": 40,
                    "sellingprice": 28,
                    "Barcode": "7891011",
                    "expirydate": "2025-12-31"
                },
                {
                    "productname": "Lays",
                    "category": "Snacks",
                    "stockquantity": 100,
                    "sellingprice": 10,
                    "Barcode": "111213",
                    "expirydate": "2024-11-01"
                }
            ]
        })

    def tearDown(self):
        # Clean Up after each test
        self.db.users.delete_many({})
        self.db.products.delete_many({})

    def test_fetch_categories(self):
        categories = InsightsUtils.fetch_categories(self.user_id)
        self.assertIn("Beverages", categories)
        self.assertIn("Snacks", categories)

    def test_fetch_top_products(self):
        products = InsightsUtils.fetch_top_products(self.user_id, "Beverages")
        self.assertEqual(len(products), 2)
        product_names = [p["productname"] for p in products]
        self.assertIn("Pepsi", product_names)
        self.assertIn("Sprite", product_names)

