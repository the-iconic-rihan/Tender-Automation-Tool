from loguru import logger

logger.add(
    "/mnt/logs/audit_operation.log",
    filter=lambda record: record["extra"].get("name") == "audit",
)
logger.add(
    "/mnt/logs/transaction_operation.log",
    filter=lambda record: record["extra"].get("name") == "transaction",
)
logger.add(
    "/mnt/logs/exceptions.log",
    filter=lambda record: record["extra"].get("name") == "exception",
)

logger.add(
    "/mnt/logs/celery/celery.log",
    filter=lambda record: record["extra"].get("name") == "celery",
)
logger.add(
    "/mnt/logs/celery/celery.log",
    filter=lambda record: record["extra"].get("name") == "exception",
)
logger.add(
    "/mnt/logs/socket/socket.log",
    filter=lambda record: record["extra"].get("name") == "socket",
)

celery_logger = logger.bind(name="celery")
celery_exception = logger.bind(name="exception")
socket_logger = logger.bind(name="socket")

# Create bound loggers
audit_logger = logger.bind(name="audit")
transaction_logger = logger.bind(name="transaction")
exception_logger = logger.bind(name="exception")