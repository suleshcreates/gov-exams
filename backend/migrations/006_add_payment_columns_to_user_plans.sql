-- Add payment tracking columns to user_plans table if they don't exist
-- These columns will store Razorpay payment details

-- Add payment_id column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_plans' 
        AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE public.user_plans ADD COLUMN payment_id TEXT;
        CREATE INDEX idx_user_plans_payment_id ON public.user_plans(payment_id);
    END IF;
END $$;

-- Add order_id column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_plans' 
        AND column_name = 'order_id'
    ) THEN
        ALTER TABLE public.user_plans ADD COLUMN order_id TEXT;
    END IF;
END $$;

-- Add payment_signature column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_plans' 
        AND column_name = 'payment_signature'
    ) THEN
        ALTER TABLE public.user_plans ADD COLUMN payment_signature TEXT;
    END IF;
END $$;

-- Add payment_status column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_plans' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE public.user_plans ADD COLUMN payment_status TEXT DEFAULT 'completed';
    END IF;
END $$;

COMMENT ON COLUMN public.user_plans.payment_id IS 'Razorpay payment ID';
COMMENT ON COLUMN public.user_plans.order_id IS 'Razorpay order ID';
COMMENT ON COLUMN public.user_plans.payment_signature IS 'Razorpay payment signature for verification';
COMMENT ON COLUMN public.user_plans.payment_status IS 'Payment status: pending, completed, failed';
