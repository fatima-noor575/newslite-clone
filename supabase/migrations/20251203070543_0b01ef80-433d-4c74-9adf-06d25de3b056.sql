-- Add rejection_reason column to ads table
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS rejection_reason text;