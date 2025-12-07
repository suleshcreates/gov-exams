-- Secure RLS for user_plans table
-- Frontend will use backend API endpoints, not direct Supabase queries
-- This ensures proper authentication and data isolation

-- Enable RLS on user_plans
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own plans" ON public.user_plans;
DROP POLICY IF EXISTS "Service role can manage all plans" ON public.user_plans;
DROP POLICY IF EXISTS "Deny all anon access" ON public.user_plans;

-- DENY all anonymous access (force queries through backend API)
CREATE POLICY "Deny all anon access"
ON public.user_plans
FOR ALL
USING (false);

-- Allow service role full access (backend API only)
CREATE POLICY "Service role can manage all plans"
ON public.user_plans
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "Deny all anon access" ON public.user_plans IS 'Block direct frontend access - must use backend API';
COMMENT ON POLICY "Service role can manage all plans" ON public.user_plans IS 'Backend API has full access for authenticated operations';
