# from bson import ObjectId
# from pymongo import MongoClient

# # Initialize DB Connection
# client = MongoClient("mongodb+srv://syeddaniyalhashmi123:test123@cluster0.dutvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
# db = client["FYP"]

# class InsightsUtils:

#     @staticmethod
#     def convert_objectid(data):
#         """ Convert ObjectId to string recursively in a dictionary or list """
#         if isinstance(data, dict):
#             return {key: InsightsUtils.convert_objectid(value) for key, value in data.items()}
#         elif isinstance(data, list):
#             return [InsightsUtils.convert_objectid(item) for item in data]
#         elif isinstance(data, ObjectId):
#             return str(data)
#         return data

#     @staticmethod
#     def fetch_categories(user_id):
#         """ Fetch unique product categories for a user """
#         product_documents = db["products"].find({"user_id": ObjectId(user_id)})
#         unique_categories = set()

#         for product_doc in product_documents:
#             for product in product_doc.get("products", []):
#                 category = product.get("category")
#                 if category:
#                     unique_categories.add(category)

#         return list(unique_categories)

   
#     @staticmethod
#     def fetch_top_products(user_id, category):
#         """ Fetch unique top products by category """
#         product_documents = db["products"].find({"user_id": ObjectId(user_id)})
#         products_in_category = []
#         seen_barcodes = set()  # To track unique products by barcode

#         for product_doc in product_documents:
#             for product in product_doc.get("products", []):
#                 if product.get("category") == category:
#                     barcode = product.get("Barcode")
#                     if barcode and barcode not in seen_barcodes:
#                         seen_barcodes.add(barcode)
#                         products_in_category.append({
#                             "productname": product.get("productname"),
#                             "category": product.get("category"),
#                             "stockquantity": product.get("stockquantity"),
#                             "sellingprice": product.get("sellingprice"),
#                             "Barcode": product.get("Barcode"),
#                             "expirydate": product.get("expirydate"),
#                             "reorderthreshold": product.get("reorderthreshold"),
#                             "costprice": product.get("costprice"),
#                             "monthly_sales":product.get("monthly_sales"),
#                             "timespan":product.get("timespan"),
#                             "sale_date":product.get("sale_date"),
#                             "productSize":product.get("productSize"),

#                             "id": str(product.get("_id", "")),
#                             "vendor_id": product.get("vendor_id")
#                         })

#         return InsightsUtils.convert_objectid(products_in_category)


#     @staticmethod
#     def calculate_profit_margin(selling_price, cost_price):
#         """ Calculate profit margin percentage """
#         return ((selling_price - cost_price) / selling_price) * 100 if selling_price else 0

   
#     @staticmethod
#     def fetch_products_by_name(user_id, category, vendor_id):
#         """ Fetch unique products by category and vendor """
#         product_documents = list(db["products"].find({"user_id": ObjectId(user_id)}))
#         vendors = list(db["vendors"].find({"user_id": ObjectId(user_id)}))

#         vendor_info = next(
#             (vendor for vendor_doc in vendors for vendor in vendor_doc.get("vendors", []) if str(vendor.get("_id")) == vendor_id), 
#             None
#         )
        
#         if not vendor_info:
#             return {"error": "Vendor not found!"}

#         vendor_name = vendor_info.get("vendor", "Unknown Vendor")
#         delivery_time = vendor_info.get("DeliveryTime", "Unknown")
#         reliability_score = vendor_info.get("ReliabilityScore", "Unknown")

#         seen_barcodes = set()
#         products_in_category = []

#         for product_doc in product_documents:
#             for product in product_doc.get("products", []):
#                 if product.get("category") == category:
#                     barcode = product.get("Barcode")
#                     if barcode and barcode not in seen_barcodes:
#                         seen_barcodes.add(barcode)
#                         products_in_category.append({
#                             "productname": product.get("productname"),
#                             "category": product.get("category"),
#                             "stockquantity": product.get("stockquantity"),
#                             "sellingprice": product.get("sellingprice"),
#                             "Barcode": product.get("Barcode"),
#                             "expirydate": product.get("expirydate"),
#                             "reorderthreshold": product.get("reorderthreshold"),
#                             "costprice": product.get("costprice"),
#                              "monthly_sales":product.get("monthly_sales"),
#                             "timespan":product.get("timespan"),
#                             "sale_date":product.get("sale_date"),
#                             "productSize":product.get("productSize"),

#                             "profitmargin": InsightsUtils.calculate_profit_margin(product.get("sellingprice", 0), product.get("costprice", 0)),
#                             "id": str(product.get("_id", "")),
#                             "vendor": vendor_name,
#                             "DeliveryTime": delivery_time,
#                             "ReliabilityScore": reliability_score
#                         })

#         return InsightsUtils.convert_objectid(products_in_category)
from bson import ObjectId
from pymongo import MongoClient
import json

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