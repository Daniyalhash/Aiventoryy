from django.test import TestCase
from pymongo import MongoClient
from bson import ObjectId
from utils.demand_predictor  import DemandPredictor  # your class path
import pandas as pd


class DemandPredictorTestCase(TestCase):

    def setUp(self):
        # MongoDB Connection
        self.client = MongoClient("mongodb+srv://syeddaniyalhashmi123:test123@cluster0.dutvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        self.db = self.client["FYP"]

        # Create Dummy User
        self.user_id = str(self.db.users.insert_one({
            "username": "TestUser",
            "email": "predictoruser@gmail.com",
        }).inserted_id)

        # Insert Dummy Forecasting Data
        self.db.forecasting.insert_one({
            "user_id": ObjectId(self.user_id),
            "forecasting": [
                {"sale_date": "2023-01-01", "sales": 50},
                {"sale_date": "2023-01-02", "sales": 70},
            ]
        })

        # Create object of DemandPredictor
        self.predictor = DemandPredictor(self.user_id)

    def tearDown(self):
        # Clean test data
        self.db.users.delete_many({"email": "predictoruser@gmail.com"})
        self.db.forecasting.delete_many({"user_id": ObjectId(self.user_id)})

    def test_load_user_data_success(self):
        df = self.predictor.load_user_data()
        self.assertFalse(df.empty)
        self.assertIn('sale_date', df.columns)
        self.assertIn('sales', df.columns)
        self.assertEqual(len(df), 2)

    def test_load_user_data_invalid_user(self):
        # invalid user_id
        invalid_predictor = DemandPredictor("67ed70cf60b8334aab50b6e2")
        df = invalid_predictor.load_user_data()
        self.assertTrue(df.empty)

    def test_load_user_data_user_without_data(self):
        # new user without forecasting data
        new_user_id = str(self.db.users.insert_one({
            "username": "NoDataUser",
            "email": "nodata@gmail.com",
        }).inserted_id)

        predictor_no_data = DemandPredictor(new_user_id)
        df = predictor_no_data.load_user_data()
        self.assertTrue(df.empty)

        # clean this user
        self.db.users.delete_one({"_id": ObjectId(new_user_id)})
