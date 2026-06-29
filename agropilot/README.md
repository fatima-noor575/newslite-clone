# AgroPilot AI — AI-Powered Digital Farm Manager

Production-ready monorepo:

- `frontend/` — Next.js 14 (App Router), React + TypeScript, Tailwind, shadcn/ui, React Query, Zustand
- `backend/` — FastAPI (Python 3.11), SQLAlchemy 2, PostgreSQL, Redis, Celery, JWT auth
- `infra/` — Docker Compose for local dev (Postgres + Redis + backend + frontend + nginx)

## Modules
Auth · Users · Farms · Crops · Disease Detection · Weather · Irrigation · Fertilizer ·
Yield Prediction · Profit Prediction · Market · Notifications · Reports · AI Services
(chat, STT, TTS, translation EN/UR/PN, PDF reports).

## Quick start (local)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
docker compose -f infra/docker-compose.yml up --build
```

- Frontend: http://localhost:3000
- Backend (OpenAPI docs): http://localhost:8000/docs
- Postgres: localhost:5432  ·  Redis: localhost:6379

## Manual run

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main.app:app --reload --port 8000

# Worker
celery -A services.tasks.celery_app worker -l info

# Frontend
cd frontend
pnpm install
pnpm dev
```

## Required env (backend/.env)
```
DATABASE_URL=postgresql+psycopg://agropilot:agropilot@db:5432/agropilot
REDIS_URL=redis://redis:6379/0
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
ACCESS_TTL_MIN=15
REFRESH_TTL_DAYS=30
OPENAI_API_KEY=sk-...
OPENWEATHER_API_KEY=...
CLOUDINARY_URL=cloudinary://key:secret@cloud
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
FRONTEND_URL=http://localhost:3000
```

## Sample complex implementations (fully working)
1. **Disease Detection** — `backend/services/ai/disease_detection.py` (OpenAI vision)
2. **Irrigation Recommendation** — `backend/services/ai/irrigation.py` (ET₀ + soil + weather)
3. **Profit Calculator** — `backend/services/ai/profit.py` (ROI, break-even, scenarios)

See `docs/` and inline docstrings for full details.
