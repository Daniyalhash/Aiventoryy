# debugger.py

import logging
from config import Config

# Initialize logger
logging.basicConfig(level=Config.LOG_LEVEL)
logger = logging.getLogger(__name__)

class Debugger:
    @staticmethod
    def log(message, level="INFO"):
        levels = {"DEBUG": logging.DEBUG, "INFO": logging.INFO, "ERROR": logging.ERROR}
        
        # Ensure correct log level
        log_level = levels.get(level.upper(), logging.INFO)
        logger.log(log_level, message)
    
    @staticmethod
    def error(message, exception=None):
        logger.error(f"❌ {message}")
        if exception:
            logger.error(exception)
            
    @staticmethod
    def debug(message):
        Debugger.log(message, level="DEBUG")
    
    @staticmethod
    def info(message):
        Debugger.log(message, level="INFO")

    @staticmethod
    def exception(message, exception):
        logger.error(f"❌ {message}")
        logger.exception(exception)

# Example Usage
Debugger.debug("This is a debug message.")
Debugger.info("This is an info message.")
Debugger.error("This is an error message.", Exception("An error occurred"))
