
from bson import ObjectId
from pymongo import MongoClient
import json
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND
from datetime import datetime, timedelta

# Initialize DB Connection
client = MongoClient("mongodb+srv://syeddaniyalhashmi123:test123@cluster0.dutvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["FYP"]

class InsightsUtils:

    @staticmethod
    def convert_objectid(data):
        """ Convert ObjectId to string recursively in a dictionary or list """
        if isinstance(data, dict):
            return {key: InsightsUtils.convert_objectid(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [InsightsUtils.convert_objectid(item) for item in data]
        elif isinstance(data, ObjectId):
            return str(data)
        return data

    @staticmethod
    def fetch_categories(user_id):
        """ Efficiently fetch unique product categories for a user using aggregation """
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {"$unwind": "$products"},
            {"$group": {"_id": "$products.category"}},
            {"$project": {"category": "$_id", "_id": 0}}
        ]

        result = list(db["products"].aggregate(pipeline))
        return [doc["category"] for doc in result if doc.get("category")]

    @staticmethod
    def get_current_season():
        """Return the current season"""
        month = datetime.now().month
        if month in [12, 1, 2]:
            return "winter"
        elif month in [3, 4, 5]:
            return "spring"
        elif month in [6, 7, 8]:
            return "summer"
        elif month in [9, 10, 11]:
            return "autumn"

    @staticmethod
    def calculate_demand_score(products):
        """Calculate demand score for each product"""
        """Calculate demand score for each product"""
        try:
            if not products:
                return []

            max_sales = max((p.get("monthly_sales", 0) or 0) for p in products)
            max_timespan = max((p.get("timespan", 1) or 1) for p in products)
            current_season = InsightsUtils.get_current_season()

            for product in products:
                sales = product.get("monthly_sales", 0) or 0
                timespan = product.get("timespan", 1) or 1
                season = product.get("season", "").lower()

                normalized_sales = sales / max_sales if max_sales else 0
                season_match = 1 if season == current_season else 0
                recency_score = 1 - (timespan / max_timespan) if max_timespan else 0

                demand_score = (normalized_sales * 0.6 + season_match * 0.3 + recency_score * 0.1) * 100
                product["demand_score"] = round(demand_score, 2)
            print('product',products)
            return products
        except Exception as e:
            print(f"[ERROR] Exception in calculate_demand_score: {e}")
            raise
   
    @staticmethod
    def fetch_top_products(user_id, category):
        print(f"[DEBUG] fetch_top_products called with user_id={user_id}, category={category}")
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {"$unwind": "$products"},
            {"$match": {"products.category": category}},
            {
                "$group": {
                    "_id": "$products.Barcode",
                    "product": {"$first": "$products"}
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "productname": "$product.productname",
                    "category": "$product.category",
                    "stockquantity": "$product.stockquantity",
                    "sellingprice": "$product.sellingprice",
                    "Barcode": "$product.Barcode",
                    "expirydate": "$product.expirydate",
                    "reorderthreshold": "$product.reorderthreshold",
                    "costprice": "$product.costprice",
                    "monthly_sales": "$product.monthly_sales",
                    "timespan": "$product.timespan",
                    "sale_date": "$product.sale_date",
                    "productSize": "$product.productSize",
                    "id": {"$toString": "$product._id"},
                    "vendor_id": "$product.vendor_id"
                }
            }
        ]

        result = list(db["products"].aggregate(pipeline))
        print(f"[DEBUG] Aggregation pipeline returned {len(result)} products")

        products = InsightsUtils.convert_objectid(result)
        
        try:
            return InsightsUtils.calculate_demand_score(products)
        except Exception as e:
            print(f"[ERROR] Failed to calculate demand score: {e}")
            return products 
        # return InsightsUtils.convert_objectid(result)

    

    @staticmethod
    def fetch_smart_reorder_products(user_id, category=None, limit=100):
        try:
            pipeline = [
                {"$match": {"user_id": ObjectId(user_id)}},
                {"$unwind": "$products"},
                {"$replaceRoot": {"newRoot": "$products"}},
            ]

            if category:
                pipeline.append({"$match": {"category": category}})

            pipeline.extend([
                {
                    "$addFields": {
                        "needs_reorder": {"$lt": ["$stockquantity", "$monthly_sales"]}
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "productname": 1,
                        "category": 1,
                        "monthly_sales": 1,
                        "stockquantity": 1,
                        "needs_reorder": 1
                    }
                },
                {"$sort": {"monthly_sales": -1}},
                {"$limit": limit}
            ])

            result = list(db["products"].aggregate(pipeline))
            # print(result)
            if not result:
                return {"status": "success", "data": []}, HTTP_200_OK
            # print(result)
            return {"status": "success", "data": result}, HTTP_200_OK

        except Exception as e:
            print(f"Error fetching reorder products: {e}")
            return {"status": "error", "message": str(e)}, HTTP_400_BAD_REQUEST





    @staticmethod
    def calculate_profit_margin(selling_price, cost_price):
        """ Calculate profit margin percentage """
        return ((selling_price - cost_price) / selling_price) * 100 if selling_price else 0

    
    @staticmethod
    def fetch_products_by_name(user_id, category, vendor_id):
        try:
            # Step 1: Aggregate vendor information based on category (find all vendors in the same category)
            pipeline = [
                # Match the user document by user_id
                {"$match": {"user_id": ObjectId(user_id)}},
                # Unwind the vendors array to get individual vendor documents
                {"$unwind": "$vendors"},
                # Match based on category (find all vendors for this category)
                {"$match": {"vendors.category": category}},
                # Project the necessary vendor information
                {
                    "$project": {
                        "vendor": "$vendors.vendor",
                        "category": "$vendors.category",
                        "vendorPhone": "$vendors.vendorPhone",
                        "DeliveryTime": "$vendors.DeliveryTime",
                        "ReliabilityScore": "$vendors.ReliabilityScore",
                        "_id": 0
                    }
                }
            ]

            # Execute the aggregation to find all vendors for the category
            vendors_doc = list(db["vendors"].aggregate(pipeline))

            if not vendors_doc:
                print(f"❌ No vendors found for category {category} under user_id {user_id}")
                return {"error": "No vendors found for the specified category!"}
            fastest_vendor = min(vendors_doc, key=lambda x: x["DeliveryTime"])
            print(f"✅ Found fastest vendor: {fastest_vendor}")

            # Step 2: Aggregate unique products in the category
            pipeline = [
                {"$match": {"user_id": ObjectId(user_id)}},
                {"$unwind": "$products"},
                {"$match": {"products.category": category}},
                {
                    "$group": {
                        "_id": "$products.Barcode",
                        "product": {"$first": "$products"}
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "productname": "$product.productname",
                        "category": "$product.category",
                        "stockquantity": "$product.stockquantity",
                        "sellingprice": "$product.sellingprice",
                        "Barcode": "$product.Barcode",
                        "expirydate": "$product.expirydate",
                        "reorderthreshold": "$product.reorderthreshold",
                        "costprice": "$product.costprice",
                        "monthly_sales": "$product.monthly_sales",
                        "timespan": "$product.timespan",
                        "sale_date": "$product.sale_date",
                        "productSize": "$product.productSize",
                        "id": {"$toString": "$product._id"},
                    }
                }
            ]

            result = list(db["products"].aggregate(pipeline))

            # Step 3: Add vendor info and profit margin
            for product in result:
                product["vendor"] = fastest_vendor.get("vendor", "Unknown Vendor")
                product["DeliveryTime"] = fastest_vendor.get("DeliveryTime", "Unknown")
                product["ReliabilityScore"] = fastest_vendor.get("ReliabilityScore", "Unknown")
                product["profitmargin"] = InsightsUtils.calculate_profit_margin(
                    product.get("sellingprice", 0),
                    product.get("costprice", 0)
            )

            return InsightsUtils.convert_objectid(result)

        except Exception as e:
            import traceback
            print("🔥 Internal Error in fetch_products_by_name:", str(e))
            traceback.print_exc()
            return {"error": f"Internal server error: {str(e)}"}