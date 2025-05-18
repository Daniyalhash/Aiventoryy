# from bson import ObjectId
# from pymongo import MongoClient

# class InventoryUtils:
#     def __init__(self, db):
#         self.db = db

#     def get_user_products(self, user_id):
#         """Fetch and format product data for a user."""
#         if not user_id or not ObjectId.is_valid(user_id):
#             return {"error": "Invalid or missing user_id"}, 400

#         products_cursor = self.db["products"].find({"user_id": ObjectId(user_id)})
#         products_list = list(products_cursor)

#         if not products_list:
#             return {"error": "No products found for the user"}, 404

#         formatted_products = [
#             {
#                 "_id": str(product.get("_id")),
#                 "dataset_id": str(product.get("dataset_id")) if product.get("dataset_id") else None,
#                 "products": [
#                     {
#                         "productname": item.get("productname"),
#                         "category": item.get("category"),
#                         "subcategory": item.get("subcategory"),
#                         "stockquantity": item.get("stockquantity"),
#                         "sellingprice": item.get("sellingprice"),
#                         "Barcode": item.get("Barcode"),
#                         "expirydate": item.get("expirydate"),
#                         "pastsalesdata": item.get("pastsalesdata"),
#                         "timespan": item.get("timespan"),
#                         "reorderthreshold": item.get("reorderthreshold"),
#                         "costprice": item.get("costprice"),
#                         "vendor_id": str(item.get("vendor_id")) if item.get("vendor_id") else None,
#                     }
#                     for item in product.get("products", [])
#                 ],
#                 "upload_date": product.get("upload_date"),
#             }
#             for product in products_list
#         ]

#         return {"products": [product["products"] for product in formatted_products]}, 200

#     def get_inventory_visuals(self, user_id):
#         """Calculate category-wise and product-wise visualizations."""
#         if not user_id or not ObjectId.is_valid(user_id):
#             return {"error": "Invalid or missing user_id"}, 400

#         user = self.db["users"].find_one({"_id": ObjectId(user_id)})
#         if not user:
#             return {"error": "User not found!"}, 404

#         products_cursor = self.db["products"].find({"user_id": ObjectId(user_id)})
#         products_list = list(products_cursor)
        
#         if not products_list:
#             return {"error": "No products found for the user"}, 404

#         formatted_products = self.get_user_products(user_id)[0]["products"]

#         category_profit_margin, category_cost, product_profit_margin, product_price_comparison = [], [], [], []

#         category_data, product_data = {}, {}

#         for product in formatted_products:
#             for item in product:
#                 category = item["category"]
#                 selling_price = item["sellingprice"]
#                 cost_price = item["costprice"]
#                 product_name = item["productname"]

#                 profit_margin = ((selling_price - cost_price) / cost_price * 100) if cost_price > 0 else 0

#                 if category not in category_data:
#                     category_data[category] = {"total_profit_margin": 0, "count": 0, "total_cost": 0}
#                 category_data[category]["total_profit_margin"] += profit_margin
#                 category_data[category]["count"] += 1
#                 category_data[category]["total_cost"] += cost_price

#                 product_data[product_name] = product_data.get(product_name, {"total_profit_margin": 0, "count": 0})
#                 product_data[product_name]["total_profit_margin"] += profit_margin
#                 product_data[product_name]["count"] += 1

#                 product_price_comparison.append({
#                     "productname": product_name,
#                     "sellingprice": selling_price,
#                     "costprice": cost_price
#                 })

#         for category, data in category_data.items():
#             avg_profit_margin = data["total_profit_margin"] / data["count"] if data["count"] > 0 else 0
#             category_profit_margin.append({
#                 "category": category,
#                 "avg_profit_margin": avg_profit_margin,
#                 "total_cost": data["total_cost"]
#             })

#         product_profit_margin = [{"productname": product_name, "avg_profit_margin": data["total_profit_margin"] / data["count"]}
#                                  for product_name, data in product_data.items()]

#         product_profit_margin = sorted(product_profit_margin, key=lambda x: x["avg_profit_margin"], reverse=True)[:10]

#         return {
#             "category_profit_margin": category_profit_margin,
#             "category_cost": [{"category": category, "total_cost": data["total_cost"]} for category, data in category_data.items()],
#             "product_profit_margin": product_profit_margin,
#             "product_price_comparison": product_price_comparison,
#         }, 200

from bson import ObjectId
from pymongo import MongoClient
from rest_framework.decorators import api_view
from rest_framework.response import Response

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