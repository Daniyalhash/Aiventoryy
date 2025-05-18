# from bson import ObjectId
# from pymongo import MongoClient

# class InsightsManager:
#     def __init__(self, db):
#         self.db = db

#     def get_low_stock_products(self, user_id):
#         """Fetch low stock products for the given user."""
#         if not user_id:
#             return {"error": "User ID is required!"}, 400

#         try:
#             # Fetch all product documents for the user
#             product_documents = self.db["products"].find({"user_id": ObjectId(user_id)})
            
#             low_stock_product_list = []
#             for product_doc in product_documents:
#                 products_array = product_doc.get("products", [])
#                 if not isinstance(products_array, list):
#                     continue  # Skip invalid data
                
#                 for product in products_array:
#                     stockquantity = product.get("stockquantity", 0)
#                     reorderthreshold = product.get("reorderthreshold", 0)

#                     if stockquantity < reorderthreshold:
#                         low_stock_product_list.append({
#                             "productname": product.get("productname"),
#                             "category": product.get("category", "N/A"),
#                             "stockquantity": stockquantity,
#                             "vendor_id": str(product.get("vendor_id", "N/A")) , # Convert ObjectId to string
#                              "costprice": product.get("costprice", 0.0),  # Default to 0.0 if missing
#                             "sellingprice": product.get("sellingprice", 0.0)  # Default to 0.0 if missing
#                         })

#             return {"low_stock_products": low_stock_product_list}, 200

#         except Exception as e:
#             return {"error": str(e)}, 500

#     def get_vendor_details(self, user_id, category, vendor_id, productname):
#         """Fetch vendor details for a specific product and category."""
#         if not user_id or not category or not productname:
#             return {"error": "Missing required parameters!"}, 400

#         try:
#             user_id = ObjectId(user_id) 

#             print(f"🔍 Fetching product '{productname}' in category '{category}' for user: {user_id}")

#             product_found = self.db["products"].find_one(
#                 {"user_id": user_id, "products": {"$elemMatch": {"category": category, "productname": productname}}}
#             )

#             if not product_found:
#                 print("🚨 Product not found in the specified category!")
#                 return {"error": "Product not found in the specified category!"}, 404

#             print(f"✅ Product '{productname}' found. Fetching vendors...")

#             distinct_categories = self.db["vendors"].distinct("vendors.category")
#             print("📌 Available Vendor Categories:", distinct_categories)

#             possible_categories = [category]  
#             if category == "Biscuits/Snacks":
#                 possible_categories.append("Biscuits")  

#             vendor_list = list(self.db["vendors"].aggregate([
#                 {"$unwind": "$vendors"}, 
#                 {"$match": {"vendors.category": {"$in": possible_categories}}}, 
#                 {"$group": { 
#                     "_id": "$vendors.vendor",
#                     "vendor": {"$first": "$vendors.vendor"},
#                     "vendorPhones": {"$push": "$vendors.vendorPhone"},  
#                     "categories": {"$addToSet": "$vendors.category"},  
#                     "DeliveryTime": {"$first": "$vendors.DeliveryTime"},  
#                      "ReliabilityScore": {"$first": "$vendors.ReliabilityScore"} 
#                 }},
#                 {"$project": {
#         "_id": 0,
#         "vendor": 1,
#         "vendorPhone": {"$arrayElemAt": ["$vendorPhones", 0]},  
#         "categories": 1,
#         "DeliveryTime": 1,
#         "ReliabilityScore": 1
#     }}
#             ]))

#             if not vendor_list:
#                 print(f"🚨 No vendors found for category '{category}'!")
#                 return {"error": f"No vendors found for category '{category}'!"}, 404

#             sorted_vendors = sorted(vendor_list, key=lambda x: x.get("ReliabilityScore", 0), reverse=True)

#             return {"vendors": sorted_vendors}, 200

#         except Exception as e:
#             print(f"🔥 Exception: {str(e)}")
#             return {"error": str(e)}, 500
        
from bson import ObjectId
from pymongo import MongoClient

class InsightsManager:
    def __init__(self, db):
        self.db = db

    def get_low_stock_products(self, user_id):
        """Get unique low stock products using barcode as unique key."""
        try:
            pipeline = [
                {"$match": {"user_id": ObjectId(user_id)}},
                {"$unwind": "$products"},
                {"$match": {
                    "$expr": {"$lt": ["$products.stockquantity", "$products.reorderthreshold"]}
                }},
                {
                    "$group": {
                        "_id": "$products.Barcode",  # Group by Barcode
                        "product": {"$first": "$products"}  # Keep the first product per Barcode
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "productname_id": {"$toString": "$product.productname_id"},  # <- Add this line
                        "productname": "$product.productname",
                        "category": {"$ifNull": ["$product.category", "N/A"]},
                        "stockquantity": "$product.stockquantity",
                        "vendor_id": {"$toString": "$product.vendor_id"},
                        "costprice": {"$ifNull": ["$product.costprice", 0.0]},
                        "sellingprice": {"$ifNull": ["$product.sellingprice", 0.0]},
                        "Barcode": "$product.Barcode",
                        "productSize": "$product.productSize",
                        "reorderthreshold": "$product.reorderthreshold"
                    }
                }
            ]

            low_stock_products = list(self.db["products"].aggregate(pipeline))
            print("low stock",low_stock_products)
            return {"low_stock_products": low_stock_products}, 200

        except Exception as e:
            return {"error": str(e)}, 500


    def get_vendor_details(self, user_id, category, vendor_id, productname):
        """Fetch vendor details for a specific product faster."""
        try:
            user_id = ObjectId(user_id)

            # 🚀 Fast check using projection
            found = self.db["products"].find_one(
                {
                    "user_id": user_id,
                    "products": {"$elemMatch": {"category": category, "productname": productname}}
                },
                {"_id": 1}
            )
            if not found:
                return {"error": "Product not found in the specified category!"}, 404

            possible_categories = [category]
            if category == "Biscuits/Snacks":
                possible_categories.append("Biscuits")

            pipeline = [
                {"$match": {"user_id": user_id}},  # Filter by user first

                {"$unwind": "$vendors"},
                {"$match": {"vendors.category": {"$in": possible_categories}}},
                
                {"$group": {
                    "_id": "$vendors.vendor_id",
                    "vendor": {"$first": "$vendors.vendor"},
                    "vendorPhone": {"$first": "$vendors.vendorPhone"},
                    "categories": {"$addToSet": "$vendors.category"},
                    "DeliveryTime": {"$first": "$vendors.DeliveryTime"},
                    "ReliabilityScore": {"$first": "$vendors.ReliabilityScore"}
                }},
                {"$project": {
                    # "_id": 0,
                    "vendor_id": "$_id",
                    "vendor": 1,
                    "vendorPhone": 1,
                    "categories": 1,
                    "DeliveryTime": 1,
                    "ReliabilityScore": 1
                }}
            ]

            vendor_list = list(self.db["vendors"].aggregate(pipeline))
            print("vendor_list",vendor_list)
            if not vendor_list:
                return {"error": f"No vendors found for category '{category}'!"}, 404
            # Run this in your MongoDB shell or Compass
            # cursor = self.db.vendors.find({ "vendors._id": { "$exists": False } })
            # missing_ids = list(cursor)
            # print("Documents with missing vendor _id:", missing_ids)
            # print("Vendor document structure:", self.db.vendors.find_one({"vendors.vendor": "PastaNova Foods"}, {"vendors.$": 1}))          
            
            # Query for the specific vendor "TeaWorld Distributors"
            vendor_name = "TeaWorld Distributors"
            vendor_details = self.db.vendors.find_one({
                "vendors.vendor": vendor_name
            })

            if vendor_details:
                # Extract the vendors array from the document
                vendor = next((v for v in vendor_details['vendors'] if v['vendor'] == vendor_name), None)
                
                if vendor:
                    print("Vendor Details:", vendor)
                else:
                    print("Vendor not found in the vendors list.")
            else:
                print("Vendor document not found.")
            
            sorted_vendors = sorted(vendor_list, key=lambda x: x.get("ReliabilityScore", 0), reverse=True)
            return {"vendors": sorted_vendors}, 200

        except Exception as e:
            return {"error": str(e)}, 500
    def watch_vendor_changes(self):
        """Watch for changes in the vendor collection and automatically update any changes."""
        try:
            # Set up a change stream to listen for changes in the vendor collection
            change_stream = self.db["vendors"].watch()

            for change in change_stream:
                print(f"Change detected: {change}")
                # You can handle the change here, e.g., refreshing or invalidating cache
                # Example: If a vendor is updated, trigger cache invalidation or update the data source
                if change['operationType'] == 'update':
                    vendor_id = change['documentKey']['_id']
                    print(f"Vendor {vendor_id} updated. Refreshing vendor data.")
                    # Trigger refresh here (either invalidate cache or notify the frontend)
                    # For example, you could refresh the cache or re-fetch data from DB.
        
        except Exception as e:
            print(f"Error in watching vendor changes: {str(e)}")
        