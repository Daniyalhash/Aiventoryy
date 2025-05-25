

from bson import ObjectId
from pymongo import MongoClient
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime, timedelta
from bson import ObjectId
class InventoryUtils:
    def __init__(self, db):
        self.db = db

    def get_user_products(self, user_id):
        """Fetch product data efficiently using aggregation pipeline and limit to 100 rows."""
        if not user_id or not ObjectId.is_valid(user_id):
            return {"error": "Invalid or missing user_id"}, 400

        # Define the aggregation pipeline
        pipeline = [
            # Step 1: Match the user_id
            {
                "$match": {"user_id": ObjectId(user_id)}
            },
            # Step 2: Project only the required fields from the 'products' array
            {
                "$project": {
                    "_id": 1,
                    "dataset_id": 1,
                    "products": {
                        "$slice": [
                            "$products", 100  # Limit the products to 100 rows per dataset
                        ]
                    },
                    "upload_date": 1
                }
            },
            # Step 3: Limit the result (optional if you want to control number of documents, e.g., datasets)
            {
                "$limit": 1  # Limit to one dataset document if necessary (optional, based on use case)
            }
        ]

        # Run the aggregation pipeline
        products_cursor = self.db["products"].aggregate(pipeline)

        # Format the response as required
        formatted_products = []
        for product in products_cursor:
            formatted_products.append({
                "_id": str(product.get("_id")),
                "dataset_id": str(product.get("dataset_id")) if product.get("dataset_id") else None,
                "products": [
                    {
                        "product_id": item.get("productname_id"),
                        "productname": item.get("productname"),
                        "category": item.get("category"),
                        "subcategory": item.get("subcategory"),
                        "stockquantity": item.get("stockquantity"),
                        "reorderthreshold": item.get("reorderthreshold"),
                        "costprice": item.get("costprice"),
                        "sellingprice": item.get("sellingprice"),
                        "timespan": item.get("timespan"),
                        "expirydate": item.get("expirydate"),
                        "monthly_sales": item.get("monthly_sales"),
                        "Barcode": item.get("Barcode"),
                        "vendor_id": str(item.get("vendor_id")) if item.get("vendor_id") else None,
                        "Product Size": item.get("productSize"),
                        "sale_date": item.get("sale_date"),
                        "season": item.get("season")

                
                    }
                    for item in product.get("products", [])
                ],
                "upload_date": product.get("upload_date"),
            })

        if not formatted_products:
            return {"error": "No products found for the user"}, 404

        return {"products": [product["products"] for product in formatted_products]}, 200


    def get_expired_products(self, user_id, category=None):
        """
        Fetch all expired products for a given user.
        Returns product_id, productname, category, expirydate
        """
        if not user_id or not ObjectId.is_valid(user_id):
            return {"error": "Invalid or missing user_id"}, 400

        try:
            # Get today's date
            today = datetime.today().date()

            # Build query
            match_query = {"user_id": ObjectId(user_id)}
            if category:
                match_query["products.category"] = category

            pipeline = [
                {"$match": match_query},
                {"$unwind": "$products"},
                {
                    "$replaceRoot": {
                        "newRoot": "$products"
                    }
                },
                {
                    "$project": {
                        "_id": 1,
                        "productname_id":1,
                        "productname": 1,
                        "category": 1,
                        "expirydate": {"$toString":"$expirydate"}
                    }
                },
                {
                    "$addFields": {
                        "is_expired": {
                            "$cond": [
                                {"$ne": ["$expirydate", "N/A"]},
                                {
                                    "$lt": [
                                        {"$dateFromString": {"dateString": "$expirydate"}},
                                        datetime(today.year, today.month, today.day)
                                    ]
                                },
                                False
                            ]
                        }
                    }
                },
                {"$match": {"is_expired": True}},
                {"$sort": {"expirydate": 1}}
            ]

            result = list(self.db["products"].aggregate(pipeline))

            # Convert ObjectIds to string
            cleaned_result = [
                {
                    "product_id": item.get("productname_id", "N/A"),
                    "productname": item.get("productname", "Unknown"),
                    "category": item.get("category", "Uncategorized"),
                    "expirydate": item.get("expirydate", "N/A")
                }
                for item in result
            ]
            print("expired",cleaned_result)
            if not cleaned_result:
                return {"message": "No expired products found.", "data": []}, 200

            return {"status": "success", "data": cleaned_result}, 200

        except Exception as e:
            print(f"Error fetching expired products: {e}")
            return {"status": "error", "message": str(e)}, 500


def get_inventory_visuals(self, user_id):
    """Optimized method to calculate category-wise and product-wise analytics."""
    if not user_id or not ObjectId.is_valid(user_id):
        return {"error": "Invalid or missing user_id"}, 400

    user = self.db["users"].find_one({"_id": ObjectId(user_id)}, {"_id": 1})
    if not user:
        return {"error": "User not found!"}, 404

    # Category-wise analytics
    category_pipeline = [
        {"$match": {"user_id": ObjectId(user_id)}},
        {"$unwind": "$products"},
        {
            "$group": {
                "_id": "$products.category",
                "total_profit_margin": {
                    "$sum": {
                        "$cond": {
                            "if": {"$gt": ["$products.costprice", 0]},
                            "then": {
                                "$multiply": [
                                    {"$divide": [
                                        {"$subtract": ["$products.sellingprice", "$products.costprice"]},
                                        "$products.costprice"
                                    ]}, 100
                                ]
                            },
                            "else": 0
                        }
                    }
                },
                "total_cost": {"$sum": "$products.costprice"},
                "count": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "category": "$_id",
                "avg_profit_margin": {"$divide": ["$total_profit_margin", "$count"]},
                "total_cost": 1
            }
        },
        {"$sort": {"avg_profit_margin": -1}},
        {"$limit": 10}
    ]

    category_data = list(self.db["products"].aggregate(category_pipeline))

    # Product price comparison (selling price vs. cost price)
    product_price_pipeline = [
        {"$match": {"user_id": ObjectId(user_id)}},
        {"$unwind": "$products"},
        {
            "$project": {
                "_id": 0,
                "productname": "$products.name",
                "sellingprice": "$products.sellingprice",
                "costprice": "$products.costprice"
            }
        },
        {"$sort": {"sellingprice": -1}},
        {"$limit": 10}
    ]

    product_price_comparison = list(self.db["products"].aggregate(product_price_pipeline))

    return {
        "category_profit_margin": category_data,
        "category_cost": [{"category": item["category"], "total_cost": item["total_cost"]} for item in category_data],
        "product_price_comparison": product_price_comparison  # ✅ Added this key
    }, 200