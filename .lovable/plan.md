
# AgroPilot on Lovable Cloud — Rebuild Plan

Replacing the current news platform. All existing tables (`articles`, `categories`, `ads`, `favorites`) and their pages are dropped. `profiles` and `user_roles` are kept and repurposed. Everything runs in the Lovable preview — no Docker, no FastAPI, no Celery, no OpenAI key.

## 1. Database (one migration)

Drop: `articles`, `categories`, `ads`, `favorites`, `ad-images` storage bucket.

Create (all with RLS + GRANTs, `auth.uid()` ownership):

- `farms` — name, location, size_hectares, soil_type, notes
- `crops` — farm_id, name, variety, planted_at, expected_harvest_at, area_hectares, status (`planted|growing|harvested|failed`), notes
- `disease_scans` — crop_id (nullable), image_url, diagnosis (jsonb: disease, confidence, severity, treatment[]), created_at
- `advisories` — farm_id, crop_id, kind (`irrigation|fertilizer|weather`), input (jsonb), recommendation (jsonb), created_at
- `yield_predictions` — crop_id, predicted_yield_kg, predicted_at, inputs (jsonb), reasoning
- `profit_scenarios` — crop_id, name, cost_per_hectare, expected_price_per_kg, expected_yield_kg, roi, break_even_price, scenarios (jsonb)
- `reports` — user_id, title, kind, payload (jsonb), pdf_url (nullable), created_at
- `chat_threads` + `chat_messages` — for the AI farming assistant
- `notifications` — user_id, title, body, kind, read, created_at

Storage buckets: `crop-scans` (private, user-scoped), `reports` (private).

`profiles`: keep as-is (already has trigger via `handle_new_user`). Add `preferred_language` (`en|ur|pa`).

## 2. Auth

Keep existing email/password + Google (already configured on the news app). Redirect target changes to `/dashboard`.

## 3. Frontend structure (`src/`)

Wipe news pages/components. New route tree:

```text
/                    landing (marketing)
/auth                sign in / sign up
/dashboard           overview: farm count, active crops, latest advisories, weather card
/farms               list + create
/farms/:id           farm detail: crops, advisories, quick actions
/crops/:id           crop detail: growth timeline, scans, yield/profit
/scanner             disease detection (upload image → AI diagnosis)
/irrigation          irrigation recommender form + history
/fertilizer          fertilizer recommender form + history
/weather             mock/static weather (no API key) with clear "sample data" note
/yield               yield prediction tool
/profit              profit / ROI calculator (client-side math, no AI needed)
/reports             list + generate PDF (client-side jsPDF)
/chat                AI farming assistant (threaded)
/notifications       list
/settings            profile + language
```

Shared layout: sidebar nav + top bar, Modern Minimalist (kept from current design system).

## 4. AI features (Lovable AI Gateway — no user key)

Edge functions in `supabase/functions/`:

- `ai-disease-detect` — accepts image URL, calls `google/gemini-2.5-pro` vision, returns structured `{disease, confidence, severity, treatment[]}`.
- `ai-irrigation` — inputs (crop, soil, recent rainfall, temp) → structured recommendation (mm/day, schedule, reasoning). Uses simple ET₀ heuristic + AI narrative.
- `ai-fertilizer` — inputs (crop, soil test values, stage) → NPK plan.
- `ai-yield-predict` — inputs (crop, area, conditions, history) → predicted kg + reasoning.
- `ai-chat` — streaming chat assistant, persists to `chat_messages`.

All use `createLovableAiGatewayProvider` helper, `google/gemini-3-flash-preview` default (vision uses `gemini-2.5-pro`), CORS enabled, Zod input validation.

## 5. Client-only features

- Profit calculator: pure math, no backend.
- Reports: `jspdf` for PDF export in the browser.
- Weather: static sample dataset with a visible "demo data" banner (no OpenWeather key).
- Translation (EN/UR/PN): `preferred_language` on profile + i18n dictionaries for UI labels only (not AI content).

## 6. Out of scope (v1)

- Celery/background jobs (not needed in preview).
- SMTP notifications (in-app only).
- Market prices (needs external data source).
- Real weather (needs OpenWeather key — can add later via `add_secret`).
- STT/TTS (can add later using Lovable AI speech models).

## 7. Delivery order

1. Migration (drop news tables + create AgroPilot schema + storage buckets).
2. Wipe old pages, install `jspdf` + i18n, scaffold new route tree and layout.
3. Farms + Crops CRUD + Dashboard.
4. Edge functions for AI (disease, irrigation, fertilizer, yield, chat).
5. Scanner, Irrigation, Fertilizer, Yield, Profit, Weather pages.
6. Reports (PDF export), Notifications, Chat, Settings.
7. Landing + polish.

Expect this to span multiple turns — I'll ship it in the order above so each step is verifiable in the preview.

## Technical notes

- Storage: signed URLs for `crop-scans`; edge function fetches image server-side before sending to the vision model.
- All AI edge functions return structured JSON via `Output.object` (Gemini — no `structuredOutputs` flag needed).
- No SQL RPCs beyond the existing `has_role`; role table stays as-is (used for future admin panel).
- `agropilot/` folder stays untouched — it's the reference implementation, not shipped.
