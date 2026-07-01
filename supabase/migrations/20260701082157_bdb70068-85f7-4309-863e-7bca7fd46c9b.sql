
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.ads CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'en'
  CHECK (preferred_language IN ('en','ur','pa'));

CREATE TABLE public.farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text,
  size_hectares numeric(10,2),
  soil_type text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.farms TO authenticated;
GRANT ALL ON public.farms TO service_role;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own farms" ON public.farms FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_farms_updated BEFORE UPDATE ON public.farms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name text NOT NULL,
  variety text,
  planted_at date,
  expected_harvest_at date,
  area_hectares numeric(10,2),
  status text NOT NULL DEFAULT 'planted' CHECK (status IN ('planted','growing','harvested','failed')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crops TO authenticated;
GRANT ALL ON public.crops TO service_role;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own crops" ON public.crops FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_crops_updated BEFORE UPDATE ON public.crops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.disease_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id uuid REFERENCES public.crops(id) ON DELETE SET NULL,
  image_path text NOT NULL,
  diagnosis jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.disease_scans TO authenticated;
GRANT ALL ON public.disease_scans TO service_role;
ALTER TABLE public.disease_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scans" ON public.disease_scans FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.advisories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_id uuid REFERENCES public.crops(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('irrigation','fertilizer','weather')),
  input jsonb NOT NULL,
  recommendation jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.advisories TO authenticated;
GRANT ALL ON public.advisories TO service_role;
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own advisories" ON public.advisories FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.yield_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id uuid REFERENCES public.crops(id) ON DELETE CASCADE,
  predicted_yield_kg numeric(12,2),
  inputs jsonb NOT NULL,
  reasoning text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.yield_predictions TO authenticated;
GRANT ALL ON public.yield_predictions TO service_role;
ALTER TABLE public.yield_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own yield predictions" ON public.yield_predictions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.profit_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id uuid REFERENCES public.crops(id) ON DELETE CASCADE,
  name text NOT NULL,
  cost_per_hectare numeric(12,2) NOT NULL,
  expected_price_per_kg numeric(12,2) NOT NULL,
  expected_yield_kg numeric(12,2) NOT NULL,
  roi numeric(12,4),
  break_even_price numeric(12,2),
  scenarios jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profit_scenarios TO authenticated;
GRANT ALL ON public.profit_scenarios TO service_role;
ALTER TABLE public.profit_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profit scenarios" ON public.profit_scenarios FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  kind text NOT NULL,
  payload jsonb NOT NULL,
  pdf_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reports" ON public.reports FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_threads TO authenticated;
GRANT ALL ON public.chat_threads TO service_role;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own threads" ON public.chat_threads FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_chat_threads_updated BEFORE UPDATE ON public.chat_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  parts jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own messages" ON public.chat_messages FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_chat_messages_thread ON public.chat_messages(thread_id, created_at);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  kind text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
