from django.apps import AppConfig
import threading
# from .ml_utils import train_model_for_user,USER_IDS_TO_TRAIN


# def periodic_train():
#     print(f"Periodic training started for users: {USER_IDS_TO_TRAIN}")
#     for user_id in list(USER_IDS_TO_TRAIN):
#         try:
#             print(f"Training model for user {user_id}")
#             train_model_for_user(user_id)
#         except Exception as e:
#             print(f"Error training for user {user_id}: {e}")
#     threading.Timer(600, periodic_train).start()   
    
class AiventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'aiventory'
    # def ready(self):
    #     # Avoid starting multiple timers if already started
    #     if not hasattr(self, 'training_thread_started'):
    #         print("Starting periodic training thread...")
    #         # Start immediately on server start (no delay)
    #         threading.Thread(target=periodic_train).start()
    #         self.training_thread_started = True