
import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';

async function checkPlans() {
    console.log('Checking user plans...');

    // 1. Get latest plan to find phone number
    const { data: latest, error: lastError } = await supabaseAdmin
        .from('user_plans')
        .select('student_phone')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (lastError || !latest) {
        console.error('Error getting latest plan or no plans found:', lastError);
        return;
    }

    const phone = latest.student_phone;
    console.log(`Checking all plans for user: ${phone}`);

    // 2. Fetch ALL plans for this user
    const { data, error } = await supabaseAdmin
        .from('user_plans')
        .select('id, plan_name, exam_ids, created_at, is_active, expires_at')
        .eq('student_phone', phone)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${data.length} total plans.`);
    const allIds = new Set();

    data.forEach((p: any) => {
        console.log(`Plan: ${p.plan_name} | Active: ${p.is_active} | Expires: ${p.expires_at}`);
        console.log(`IDs Count: ${Array.isArray(p.exam_ids) ? p.exam_ids.length : 'Not Array'}`);
        if (p.is_active !== false) { // Assuming default is true if null/undefined, or check logic
            // logic to add IDs would go here
        }
    });

    console.log('--- Aggregated Unlocked IDs ---');
    console.log(Array.from(allIds));
}

checkPlans();
