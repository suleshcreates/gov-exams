
import { supabaseAdmin } from '../config/supabase';

async function listSubjects() {
    console.log('Fetching all subjects...');

    const { data, error } = await supabaseAdmin
        .from('subjects')
        .select('id, name, price')
        .order('name');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Subjects found:', data?.length);
    if (data) {
        data.forEach((s: any) => {
            console.log(`[${s.id}] ${s.name} (₹${s.price})`);
        });
    }
}

listSubjects();
