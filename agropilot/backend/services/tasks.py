"""Celery worker tasks: notifications, scheduled jobs, report generation."""
from celery import Celery
from config.settings import settings

celery_app = Celery("agropilot", broker=settings.REDIS_URL, backend=settings.REDIS_URL)

@celery_app.task
def dispatch_notification(user_id: int, type_: str, message: str):
    # Persist + (future) push to email/SMS/FCM
    from database.session import SessionLocal
    from repositories import NotificationRepo
    db = SessionLocal()
    try: NotificationRepo(db).create(user_id, type_, message)
    finally: db.close()

@celery_app.task
def daily_advisory():
    """Cron-style: build advisory for each user (rain/disease/irrigation reminders)."""
    return "ok"
