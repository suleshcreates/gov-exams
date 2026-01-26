import { supabaseAdmin as supabase } from '../config/supabase';

async function debugSets() {
    const { data: exams } = await supabase
        .from('special_exams')
        .select('*')
        .eq('title', 'test exam');

    if (!exams || exams.length === 0) {
        console.log('Exam NOT FOUND');
        return;
    }

    const exam = exams[0];
    console.log(`Exam ID: ${exam.id}`);

    const { data: sets } = await supabase
        .from('special_exam_sets')
        .select('*')
        .eq('special_exam_id', exam.id)
        .order('set_number', { ascending: true });

    if (!sets) {
        console.log('No sets found');
        return;
    }

    for (const s of sets) {
        console.log(`Set ${s.set_number}: QSetID=${s.question_set_id || 'NULL'}`);

        if (s.question_set_id) {
            // Check questions count
            const { count } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })
                .eq('question_set_id', s.question_set_id);
            console.log(`  -> Questions: ${count}`);
        }
    }
}

debugSets();
