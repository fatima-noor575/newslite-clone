
-- Admins need to see all profiles for the admin panel
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Hide non-public tables from anonymous GraphQL/API discovery
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.user_roles FROM anon;
REVOKE SELECT ON public.ads FROM anon;
REVOKE SELECT ON public.favorites FROM anon;
