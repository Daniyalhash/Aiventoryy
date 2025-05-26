from django.urls import path
from .views import delete_ExpiredProduct,get_expired_products,fetch_smart_reorder_products,automate_order,get_logs,export_products,export_vendors,get_vendor_performance,products_by_category,fetch_cached_predictions,get_expiry_forecast,get_product_by_id,get_vendor_by_id,get_vendor_summary,delete_received_order_invoice,get_user_received_orders,delete_open_order_invoice,get_inventory_summary,vendors_by_category,search_product,update_product,delete_product,add_product,search_vendor,update_vendor,delete_vendor,update_vendor_reliability,predict_demand,get_monthly_sales,bestSales,last_sales_month,train_models,get_top_predicted_products,predict_sales,get_model_performance,check_stock_levels,mark_notification_as_read,get_notifications,delete_notifications,confirm_invoice,update_invoice,discard_signup,in_complete_signup,add_vendor,update_user,signup,delete_invoice,get_invoices,get_user_details,save_invoice,get_stock_levels, login,forgot_password,reset_password, validate_token,upload_dataset,complete_signup,get_vendor_visuals,get_total_products,get_dashboard_visuals,get_current_dataset,get_inventory_visuals,get_vendor,get_categories,get_top_products_by_category,get_products_by_name,get_categories_p,get_vendor_details

urlpatterns = [
    # login---
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
    path('automate_order/', automate_order, name='automate_order'),

    path('get_expired_products/', get_expired_products, name='get_expired_products'),
    path('delete_ExpiredProduct/', delete_ExpiredProduct, name='delete_ExpiredProduct'),


    path('validate-token/', validate_token, name='validate_token'),
    path('upload_dataset/', upload_dataset, name='upload_dataset'),  # Add this line
    path('complete_signup/', complete_signup, name='complete_signup'),  # Add this line
          path('in_complete_signup/', in_complete_signup, name='in_complete_signup'),  # Add this line
    path('discard_signup/', discard_signup, name='discard_signup'),  # Add this line
    path('get-vendor-id/', get_vendor_by_id, name='get_vendor_by_id'),  # Add this line
        path('get-product-ids/', get_product_by_id, name='get_product_by_id'),  # Add this line
    path('get_vendor_summary/', get_vendor_summary, name='get_vendor_summary'),  # Add this line
    path('get_expiry_forecast/', get_expiry_forecast, name='get_expiry_forecast'),  # Add this line
    path('fetch_cached_predictions/', fetch_cached_predictions, name='fetch_cached_predictions'),  # Add this line
    path('get_vendor_performance/', get_vendor_performance, name='get_vendor_performance'),  # Add this line
    path('export_vendors/', export_vendors, name='export_vendors'),  # Add this line
        path('export_products/', export_products, name='export_products'),  # Add this line
        path('get_logs/', get_logs, name='get_logs'),  # Add this line
        #   path('retrain_model_view/', retrain_model_view, name='retrain_model_view'),  # Add this line

          path('update_vendor_reliability/', update_vendor_reliability, name='update_vendor_reliability'),  # Add this line

        path('forgot_password/', forgot_password, name='forgot_password'),  # Add this line
        path('reset-password/', reset_password, name='reset_password'),  # Add this line
        path('update-user/', update_user, name='update_user'),  # Add this line
                path('get_user_details/', get_user_details, name='get_user_details'),  # Add this line

        path('get-stock-levels/', get_stock_levels, name='get_stock_levels'),  # Add this line
    # inovice management
    path("save-invoice/", save_invoice, name="save_invoice"),
    path('get-invoices/', get_invoices, name='get-invoices'),
    path('update-invoice/<str:invoice_id>/', update_invoice, name='update_invoice'),
    path('confirm-invoice/<str:invoice_id>/', confirm_invoice, name='confirm_invoice'),    
    path('delete-invoice/<str:invoice_id>/', delete_invoice, name='delete_invoice'),
    path('delete_open_order_invoice/', delete_open_order_invoice, name='delete_open_order_invoice'),
    path('get_user_received_orders/', get_user_received_orders, name='get_user_received_orders'),
    path('delete_received_order_invoice/', delete_received_order_invoice, name='delete_received_order_invoice'),


    # dashboard---

    path('get-total-products/',get_total_products, name='get_total_products'),
        path('bestSales/',bestSales, name='bestSales'),
        path('get_monthly_sales/',get_monthly_sales, name='get_monthly_sales'),

    
    
    path('get-dashbaord-visuals/',get_dashboard_visuals, name='get_dashboard_visuals'),
    # inventory page
    path('get-current-dataset/',get_current_dataset, name='get_current_dataset'),

    path('fetch_smart_reorder_products/',fetch_smart_reorder_products, name='fetch_smart_reorder_products'),
    path('get-inventory-visuals/',get_inventory_visuals, name='get_inventory_visuals'),
    path('get-inventory-summary/', get_inventory_summary, name='get_inventory_summary'),

    path("add-product/", add_product, name="add_product"),  # ✅ Correct endpoint
    path("delete-product/", delete_product, name="delete_product"),  # ✅ Correct endpoint
    path("update-product/", update_product, name="update_product"),  # ✅ Correct endpoint
    path("search-product/", search_product, name="search_product"),  # ✅ Correct endpoint
    
    # vendor page
    path('get-vendor/',get_vendor, name='get_vendor'),
    path('get-vendor-visuals/',get_vendor_visuals, name='get_vendor_visuals'),

    path("add-vendor/", add_vendor, name="add_vendor"),  # ✅ Correct endpoint
    path("delete-vendor/", delete_vendor, name="delete_vendor"),  # ✅ Correct endpoint
    path("update-vendor/", update_vendor, name="update_vendor"),  # ✅ Correct endpoint
    path("search-vendor/", search_vendor, name="search_vendor"),  # ✅ Correct endpoint
    path("vendors-by-category/", vendors_by_category, name="vendors_by_category"),  # ✅ Correct endpoint
        path("products-by-category/", products_by_category, name="products_by_category"),  # ✅ Correct endpoint

    
    # insights --
    path('get-top-products-by-category/',get_top_products_by_category, name='get_top_products_by_category'),
    path('get-categories/',get_categories, name='get_categories'),
        path('get-categories-p/',get_categories_p, name='get_categories_p'),

        path('get-products-by-name/',get_products_by_name, name='get_products_by_name'),
        path('get-vendor-details/',get_vendor_details, name='get_vendor_details'),
        
            # notification
        path('get_notifications/',get_notifications, name='get_notifications'),
        
        #demanfd prediction
        path('predict_demand/',predict_demand, name='predict_demand'),
        path('delete_notifications/',delete_notifications, name='delete_notifications'),
        path('mark_notification_as_read/',mark_notification_as_read, name='mark_notification_as_read'),
        path('check_stock_levels/',check_stock_levels, name='check_stock_levels'),
 path('train-models/', train_models, name='train_models'),
    path('predict-sales/', predict_sales, name='predict_sales'),
    path('model-performance/', get_model_performance, name='model_performance'),
 path('get-top-predicted-products/', get_top_predicted_products, name='get_top_predicted_products'),
    path('last-sales-month/', last_sales_month, name='last_sales_month'),

]
