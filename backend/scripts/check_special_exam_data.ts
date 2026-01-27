
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- Checking Special Exam Results ---');
    const { data: results, error: rError } = await supabase
        .from('special_exam_results')
        .select('*')
        .limit(5);

    if (rError) {
        console.error('Error fetching results:', rError);
        return;
    }

    console.log(`Found ${results.length} results.`);
    if (results.length === 0) return;

    const result = results[0];
    console.log('Sample Result:', result);

    console.log('\n--- Checking Linked Exam Set ---');
    const { data: set, error: sError } = await supabase
        .from('special_exam_sets')
        .select('*')
        .eq('special_exam_id', result.special_exam_id)
        .eq('set_number', result.set_number)
        .single();

    if (sError) {
        console.error('Error fetching set:', sError);
    } else {
        console.log('Linked Set:', set);
    }
}

checkData();
