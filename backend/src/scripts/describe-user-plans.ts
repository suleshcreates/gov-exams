
import { supabaseAdmin } from '../config/supabase';

async function describeUserPlans() {
    console.log('Fetching one row from user_plans to see all keys...');

    const { data, error } = await supabaseAdmin
        .from('user_plans')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Keys:', Object.keys(data[0]));
    } else {
        console.log('No data found to infer schema.');
    }
}

describeUserPlans();
