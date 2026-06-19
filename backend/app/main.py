from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from app.controllers.chat_controller import router as chat_router
from app.controllers.calendar_controller import router as calendar_router
from app.tasks.token_refresh_task import refresh_calendar_token

app = FastAPI(title="Professional Assistant API", root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(calendar_router)


# Start background scheduler for token refresh
scheduler = BackgroundScheduler()


@app.on_event("startup")
def start_scheduler():
    # Refresh token on startup
    refresh_calendar_token()
    # Schedule token refresh every 6 hours
    scheduler.add_job(refresh_calendar_token, "interval", hours=6)
    scheduler.start()


@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()
