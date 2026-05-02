
-- 1. Profiles: hide phone from public, owner sees own row fully
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Public-safe view exposing only non-sensitive fields (no phone)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT id, user_id, name, avatar_url, created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 2. user_roles: prevent users from inserting/updating/deleting their own roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Ads: prevent self-approval. Replace blanket update policy.
DROP POLICY IF EXISTS "Users can update own ads" ON public.ads;

CREATE POLICY "Users can update own ads (no status change)"
ON public.ads
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND rejection_reason IS NULL
);

CREATE POLICY "Admins can update any ad"
ON public.ads
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Make ad-images bucket private (unused by news site)
UPDATE storage.buckets SET public = false WHERE id = 'ad-images';

-- 5. Restrict SECURITY DEFINER helper functions to authenticated only
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
