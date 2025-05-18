from bson import ObjectId
from rest_framework.response import Response
import random
from datetime import datetime, timedelta, timezone


class DashboardUtils:
    def __init__(self, db):
        self.db = db
    def get_total_products(self, user_id):
        if not user_id:
            return {"error": "User ID is required!", "status": 400}

        try:
            today_date = datetime.utcnow()  # Get current UTC date

            pipeline = [
                {"$match": {"user_id": ObjectId(user_id)}},
                {"$unwind": "$products"},
                {
                    "$group": {
                        "_id": None,
                        "total_unique_products": {"$addToSet": "$products.productname_id"},
                        "expired_products_list": {
                            "$sum": {
                                "$cond": [
                                {"$lt": ["$products.expirydate", today_date]},
                                    1,
                                    0
                                ]
                            }
                        },
                        "expired_unique_products": {
                            "$addToSet": {
                                "$cond": [
                                    {"$lt": ["$products.expirydate", today_date]},
                                    "$products.productname_id",
                                    None
                                ]
                            }
                        },
                        
                         "low_stock_products": {
                            "$sum": {
                                "$cond": [
                                    {"$lt": ["$products.stock", 10]},  # 👈 Low stock threshold
                                    1,
                                    0
                                ]
                            }
                        },
                        "total_vendors": {"$addToSet": "$products.vendor_id"},
                        "all_products": {"$push": "$products"}  # Keep all products for next stage

                    }
                },
                {
                    "$project": {
                        "_id": 0,
                       
                        "total_unique_products": {"$size": "$total_unique_products"},
                        "expired_products_list": 1,
                        "expired_unique_products": {
                            "$size": {
                                "$setDifference": ["$expired_unique_products", [None]]
                            }
                        },
                        "low_stock_products": 1,

                        "total_vendors": {"$size": "$total_vendors"},

                         "best_product": {
                            "$reduce": {
                                "input": "$all_products",
                                "initialValue": {
                                    "monthly_sales": -1,
                                    "product": None
                                },
                                "in": {
                                    "$cond": [
                                        {"$gt": ["$$this.monthly_sales", "$$value.monthly_sales"]},
                                        {
                                            "monthly_sales": "$$this.monthly_sales",
                                            "product": "$$this"
                                        },
                                        "$$value"
                                    ]
                                }
                            }
                        }
                    }
                },
                
                # Final projection to clean up output
                {
                    "$project": {
                        "total_unique_products": 1,
                        "expired_products_list": 1,
                        "expired_unique_products": 1,
                        "low_stock_products": 1,
                        "total_vendors": 1,
                        "best_product": "$best_product.product"
                    }
                }
            ]
            result = list(self.db["products"].aggregate(pipeline))
            print(result)
            if result:
                return result[0]
            else:
                return {"error": "No products found for this user!", "status": 404}

        except Exception as e:
            return {"error": str(e), "status": 500}
        
        

     

    def get_inventory_summary(self, user_id):
        if not user_id:
            return {"error": "User ID is required!", "status": 400}

        try:
            # Use timezone-aware UTC datetime
            today_date = datetime.now(timezone.utc)

            pipeline = [
                # Match user ID
                {"$match": {"user_id": ObjectId(user_id)}},

                # Unwind products array
                {"$unwind": "$products"},

                # Convert expirydate if stored as string (optional, based on data inspection)
                {
                    "$addFields": {
                        "products.expirydate": {
                            "$dateFromString": {
                                "dateString": "$products.expirydate",
                                "format": "%Y-%m-%d"
                            }
                        }
                    }
                },

                # Project relevant fields and calculate expiry status
                {
                    "$project": {
                        "productname_id": "$products.productname_id",
                        "expirydate": "$products.expirydate",
                        "is_expired": {
                            "$cond": [
                                {"$lt": ["$products.expirydate", today_date]},
                                1,
                                0
                            ]
                        }
                    }
                },

                # Group by user and calculate totals
                {
                    "$group": {
                        "_id": None,
                        "total_products": {"$sum": 1},
                        "total_unique_products": {"$addToSet": "$productname_id"},
                        "total_expired": {"$sum": "$is_expired"}
                    }
                },

                # Final projection for clean output
                {
                    "$project": {
                        "_id": 0,
                        "total_products": 1,
                        "total_unique_products": {"$size": "$total_unique_products"},
                        "total_expired": 1
                    }
                }
            ]

            result = list(self.db["products"].aggregate(pipeline))
            print(result)
            if result:
                summary = result[0]
                return {
                    "status": 200,
                    "message": "Inventory summary fetched successfully",
                    "data": {
                        "total_products": summary["total_products"],
                        "total_unique_products": summary["total_unique_products"],
                        "total_expired": summary["total_expired"]
                    }
                }
            else:
                return {"error": "No products found for this user!", "status": 404}

        except Exception as e:
            return {"error": str(e), "status": 500}

    def get_vendor_summary(self, user_id):
        if not user_id:
            return {"error": "User ID is required!", "status": 400}

        try:
            user_id_obj = ObjectId(user_id)

            # Step 1: Get all vendors stored in one document
            vendor_doc = self.db["vendors"].find_one({"user_id": user_id_obj})
            all_vendors = vendor_doc.get("vendors", []) if vendor_doc else []

            # Total vendors
            all_vendor_ids = [v["vendor_id"] for v in all_vendors if "vendor_id" in v]
            total_vendor = len(all_vendor_ids)

            # Step 2: Get linked vendor IDs from product collection
            pipeline_product_vendors = [
                {"$match": {"user_id": user_id_obj}},
                {"$unwind": "$products"},
                {"$group": {"_id": "$products.vendor_id"}}
            ]
            linked_vendor_cursor = self.db["products"].aggregate(pipeline_product_vendors)
            linked_vendor_ids = [doc["_id"] for doc in linked_vendor_cursor if doc["_id"]]

            total_vendor_links = len(linked_vendor_ids)

            # Step 3: Vendors not linked to any product
            unlinked_vendor_ids = set(all_vendor_ids) - set(linked_vendor_ids)
            total_vendor_not_links = len(unlinked_vendor_ids)

            print("Total Vendor Not Links:", total_vendor_not_links)
            print("Total Vendor Links:", total_vendor_links)
            print("Total Vendor:", total_vendor)

            return {
                "status": 200,
                "message": "Vendor summary fetched successfully",
                "data": {
                    "totalVendorLinks": total_vendor_links,
                    "totalVendor": total_vendor,
                    "totalVendorNotLinks": total_vendor_not_links
                }
            }

        except Exception as e:
            return {"error": str(e), "status": 500}

 
        
        
        
        
        
        
        
        
        
        
        
    def get_dashboard_visuals(self, user_id):
        if not user_id:
            return {"error": "User ID is required!", "status": 400}

        try:
            user = self.db["users"].find_one({"_id": ObjectId(user_id)})
            if not user:
                return {"error": "User not found!", "status": 404}

            pipeline = [
                {"$match": {"user_id": ObjectId(user_id)}},
                {"$unwind": "$products"},
                {"$addFields": {
                    "productname": "$products.productname",
                    "category": "$products.category",
                    "sellingprice": "$products.sellingprice",
                    "costprice": "$products.costprice"
                }},
                {"$addFields": {
                    "profit_margin": {
                        "$cond": [
                            {"$gt": ["$products.sellingprice", 0]},
                            {"$divide": [
                                {"$subtract": ["$products.sellingprice", "$products.costprice"]},
                                "$products.sellingprice"
                            ]},
                            0
                        ]
                    }
                }},
                {"$project": {
                    "_id": 0,
                    "productname": 1,
                    "category": 1,
                    "sellingprice": 1,
                    "costprice": 1,
                    "profit_margin": 1
                }},
                {"$sample": {"size": 20}}  # Fetch enough to ensure valid category
            ]

            product_docs = list(self.db["products"].aggregate(pipeline))

            if not product_docs:
                return {"error": "No products found for this user!", "status": 404}

            # Group by category
            category_products = {}
            for product in product_docs:
                category = product.get("category")
                if not category:
                    continue
                category_products.setdefault(category, []).append(product)

            valid_categories = [cat for cat in category_products if len(category_products[cat]) >= 2]
            if not valid_categories:
                return {"error": "Not enough products in any category for comparison.", "status": 404}

            selected_category = random.choice(valid_categories)
            selected_products = random.sample(category_products[selected_category], 2)

            response_data = {
                "benchmarks": [
                    {
                        "productname": selected_products[0]["productname"],
                        "sellingprice": selected_products[0]["sellingprice"],
                        "profitmargin": round(selected_products[0]["profit_margin"] * 100, 2)
                    },
                    {
                        "productname": selected_products[1]["productname"],
                        "sellingprice": selected_products[1]["sellingprice"],
                        "profitmargin": round(selected_products[1]["profit_margin"] * 100, 2)
                    }
                ]
            }
            return response_data

        except Exception as e:
            return {"error": str(e), "status": 500}
 
    # def get_dashboard_visuals(self, user_id):
    #     if not user_id:
    #         return {"error": "User ID is required!", "status": 400}

    #     try:
    #         user = self.db["users"].find_one({"_id": ObjectId(user_id)})
    #         if not user:
    #             return {"error": "User not found!", "status": 404}

    #         product_documents = list(self.db["products"].aggregate([
    #             {"$match": {"user_id": ObjectId(user_id)}},
    #             {"$sample": {"size": 2}}  # Fetch 2 random products directly
    #         ]))
    #         if not product_documents:
    #             return {"error": "No products found for this user!", "status": 404}

    #         category_products = {}

    #         for product_doc in product_documents:
    #             products_array = product_doc.get("products", [])
    #             if not isinstance(products_array, list):
    #                 continue

    #             for product in products_array:
    #                 category = product.get("category")
    #                 if category:
    #                     if category not in category_products:
    #                         category_products[category] = []

    #                     selling_price = product.get("sellingprice", 0)
    #                     cost_price = product.get("costprice", 0)
    #                     profit_margin = (selling_price - cost_price) / selling_price if selling_price > 0 else 0

    #                     category_products[category].append({
    #                         "productname": product.get("productname"),
    #                         "category": category,
    #                         "sellingprice": selling_price,
    #                         "costprice": cost_price,
    #                         "profit_margin": profit_margin
    #                     })

    #         if category_products:
    #             random_category = random.choice(list(category_products.keys()))
    #             products_in_category = category_products[random_category]

    #             if len(products_in_category) >= 2:
    #                 random_products = random.sample(products_in_category, 2)
    #                 response_data = {
    #                     "benchmarks": [
    #                         {
    #                             "productname": random_products[0]["productname"],
    #                             "sellingprice": random_products[0]["sellingprice"],
    #                             "profitmargin": random_products[0]["profit_margin"] * 100
    #                         },
    #                         {
    #                             "productname": random_products[1]["productname"],
    #                             "sellingprice": random_products[1]["sellingprice"],
    #                             "profitmargin": random_products[1]["profit_margin"] * 100
    #                         }
    #                     ]
    #                 }
    #                 return response_data
    #             else:
    #                 return {"error": "Not enough products in this category for comparison.", "status": 404}
    #         else:
    #             return {"error": "No products available for comparison.", "status": 404}

    #     except Exception as e:
    #         return {"error": str(e), "status": 500}
