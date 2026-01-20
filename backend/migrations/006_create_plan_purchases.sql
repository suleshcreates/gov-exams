-- Create plan_purchases table to store plan purchases
CREATE TABLE IF NOT EXISTS public.plan_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_phone TEXT NOT NULL,
    student_name TEXT NOT NULL,
    plan_id UUID NOT NULL,
    plan_name TEXT NOT NULL,
    price_paid NUMERIC NOT NULL,
    exam_ids TEXT[] NOT NULL,
    expires_at TIMESTAMPTZ,
    payment_id TEXT NOT NULL UNIQUE,
    order_id TEXT NOT NULL,
    payment_signature TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on student_phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_plan_purchases_student_phone 
ON public.plan_purchases(student_phone);

-- Create index on plan_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_plan_purchases_plan_id 
ON public.plan_purchases(plan_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_plan_purchases_created_at 
ON public.plan_purchases(created_at DESC);

-- Enable RLS
ALTER TABLE public.plan_purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to do everything
CREATE POLICY "Allow service role full access" ON public.plan_purchases
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Policy: Students can view their own purchases
CREATE POLICY "Students can view own purchases" ON public.plan_purchases
    FOR SELECT
    USING (student_phone = (SELECT phone FROM students WHERE auth_user_id = auth.uid()));

-- Grant permissions
GRANT ALL ON public.plan_purchases TO service_role;
GRANT SELECT ON public.plan_purchases TO authenticated;
GRANT SELECT ON public.plan_purchases TO anon;

-- Add comment
COMMENT ON TABLE public.plan_purchases IS 'Stores plan purchase records with Razorpay payment details';
