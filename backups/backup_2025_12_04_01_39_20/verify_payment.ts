
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentPurchases() {
    const { data, error } = await supabase
        .from('user_plans')
        .select('*')
        .order('purchased_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching plans:', error);
        return;
    }

    console.log('Recent Plan Purchases:');
    if (data.length === 0) {
        console.log('No purchases found.');
    } else {
        data.forEach(plan => {
            console.log(`- ${plan.student_name} (${plan.student_phone}): ${plan.plan_name} - ${plan.price_paid} (Active: ${plan.is_active})`);
        });
    }
}

checkRecentPurchases();
