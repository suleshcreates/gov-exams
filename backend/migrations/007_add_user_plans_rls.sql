-- Secure RLS for user_plans table
-- Regular users: Use backend API (blocked from direct access)
-- Admins: Use direct Supabase queries (authenticated access allowed)
-- Backend: Use service_role for API operations

-- Enable RLS on user_plans
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own plans" ON public.user_plans;
DROP POLICY IF EXISTS "Service role can manage all plans" ON public.user_plans;
DROP POLICY IF EXISTS "Deny all anon access" ON public.user_plans;
DROP POLICY IF EXISTS "Admins and service role can manage plans" ON public.user_plans;

-- Allow service role full access (backend API)
CREATE POLICY "Service role full access"
ON public.user_plans
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Allow authenticated admins (from admins table) full access
CREATE POLICY "Authenticated admins full access"
ON public.user_plans
FOR ALL
USING (
  auth.role() = 'authenticated' 
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.email = auth.jwt() ->> 'email'
  )
)
WITH CHECK (
  auth.role() = 'authenticated' 
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.email = auth.jwt() ->> 'email'
  )
);

COMMENT ON POLICY "Service role full access" ON public.user_plans IS 'Backend API has full access via service_role';
COMMENT ON POLICY "Authenticated admins full access" ON public.user_plans IS 'Authenticated admins can manage all plans directly via Supabase';
