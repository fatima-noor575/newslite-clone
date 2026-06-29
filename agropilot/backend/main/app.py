from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.responses import JSONResponse

from config.settings import settings
from middleware import limiter, request_log_mw
from routes import auth, users, farms, crops, ai, weather, market, reports, notifications
from database.session import Base, engine
import models  # noqa: F401 — register models

Base.metadata.create_all(bind=engine)  # dev convenience; production uses Alembic

app = FastAPI(title="AgroPilot AI", version="1.0.0")
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"])
app.middleware("http")(request_log_mw)

@app.exception_handler(RateLimitExceeded)
async def rl_handler(_, exc):
    return JSONResponse(status_code=429, content={"error": "rate limit exceeded"})

@app.get("/health")
def health(): return {"ok": True}

for r in (auth, users, farms, crops, ai, weather, market, reports, notifications):
    app.include_router(r.router)
