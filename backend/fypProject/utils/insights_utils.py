
from bson import ObjectId
from pymongo import MongoClient
import json
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND
from utils.demand_predictor import DemandPredictor
from datetime import datetime

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
    def fetch_top_products(user_id, category):
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
        return InsightsUtils.convert_objectid(result)

    @staticmethod
    def fetch_smart_reorder_products(user_id, category=None, limit=100):
        try:
            predictor = DemandPredictor(user_id)
            forecast_doc = predictor.forecasting_collection.find_one({'user_id': ObjectId(user_id)})

            if not forecast_doc or 'forecasting' not in forecast_doc:
                forecast_data = []
            else:
                forecast_data = forecast_doc['forecasting']

            # Determine which month to consider
            now = datetime.now()
            if now.day < 28:
                use_month = now.strftime("%B")
            else:
                next_month = now.month % 12 + 1
                next_year = now.year + 1 if next_month == 1 else now.year
                use_month = datetime(next_year, next_month, 1).strftime("%B")

            pipeline = [
                {"$match": {"user_id": ObjectId(user_id)}},
                {"$unwind": "$products"},
                {"$addFields": {"products.user_product_id": "$_id"}},  # preserve original _id if needed
                {"$replaceRoot": {"newRoot": "$products"}},
            ]

            if category:
                pipeline.append({
                    "$match": {
                        "category": {"$regex": f"^{category}$", "$options": "i"}
                    }
                })

            pipeline.extend([
                {
                    "$project": {
                        "_id": 1,
                        "productname": 1,
                        "category": 1,
                        "monthly_sales": 1,
                        "stockquantity": 1
                    }
                },
                {"$sort": {"monthly_sales": -1}},
                {"$limit": limit}
            ])

            products = list(db["products"].aggregate(pipeline))

            # Merge prediction with product data
            final_data = []
            for product in products:
                product_id = str(product.get("_id"))
                if product_id == "None":
                    continue  # skip products without _id

                matching_forecast = next(
                    (f for f in forecast_data 
                    if str(f.get("productname_id")) == product_id and f.get("month") == use_month),
                    None)

                predicted_demand = matching_forecast.get("predicted_units", 0) if matching_forecast else 0

                final_product = {
                    "_id": product_id,
                    "productname": product.get("productname"),
                    "category": product.get("category"),
                    "stockquantity": product.get("stockquantity", 0),
                    "monthly_sales": product.get("monthly_sales", 0),
                    "demand": predicted_demand,
                    "month": use_month,
                    "needs_reorder": product.get("stockquantity", 0) < predicted_demand
                }
                
                final_data.append(final_product)

            return {"status": "success", "data": final_data}, HTTP_200_OK
        except Exception as e:
            print(f"Error fetching reorder products: {e}")
            return {"status": "error", "message": str(e)}, HTTP_400_BAD_REQUEST

    # @staticmethod
    # def fetch_smart_reorder_products(user_id, category=None, limit=100):
    #     try:
    #         pipeline = [
    #             {"$match": {"user_id": ObjectId(user_id)}},
    #             {"$unwind": "$products"},
    #             {"$replaceRoot": {"newRoot": "$products"}},
    #         ]

    #         if category:
    #             pipeline.append({"$match": {"category": category}})

    #         pipeline.extend([
    #             {
    #                 "$addFields": {
    #                     "needs_reorder": {"$lt": ["$stockquantity", "$monthly_sales"]}
    #                 }
    #             },
    #             {
    #                 "$project": {
    #                     "_id": 0,
    #                     "productname": 1,
    #                     "category": 1,
    #                     "monthly_sales": 1,
    #                     "stockquantity": 1,
    #                     "needs_reorder": 1
    #                 }
    #             },
    #             {"$sort": {"monthly_sales": -1}},
    #             {"$limit": limit}
    #         ])

    #         result = list(db["products"].aggregate(pipeline))
    #         print(result)
    #         if not result:
    #             return {"status": "success", "data": []}, HTTP_200_OK

    #         return {"status": "success", "data": result}, HTTP_200_OK

    #     except Exception as e:
    #         print(f"Error fetching reorder products: {e}")
    #         return {"status": "error", "message": str(e)}, HTTP_400_BAD_REQUEST





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