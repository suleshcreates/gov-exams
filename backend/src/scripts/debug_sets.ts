import { supabaseAdmin as supabase } from '../config/supabase';

async function debugSets() {
    console.log('--- START DEBUG ---');

    // 1. Find exam
    const { data: exams, error: examError } = await supabase
        .from('special_exams')
        .select('*')
        .eq('title', 'test exam'); // Hardcoded title based on screenshot

    if (examError) {
        console.error('Error fetching exam:', examError);
        return;
    }

    if (!exams || exams.length === 0) {
        console.log('No exam found with title "test exam"');
        // List all exams
        const { data: all } = await supabase.from('special_exams').select('id, title');
        console.log('Available exams:', all);
        return;
    }

    const exam = exams[0];
    console.log(`Found Exam: ${exam.title} (${exam.id})`);

    // 2. Fetch sets
    const { data: sets, error: setsError } = await supabase
        .from('special_exam_sets')
        .select('*')
        .eq('special_exam_id', exam.id)
        .order('set_number', { ascending: true });

    if (setsError) {
        console.error('Error fetching sets:', setsError);
        return;
    }

    console.log('Sets:', JSON.stringify(sets, null, 2));

    // 3. For each set with a question_set_id, fetch the question set
    for (const s of sets || []) {
        if (s.question_set_id) {
            const { data: qSet } = await supabase
                .from('question_sets')
                .select('*')
                .eq('id', s.question_set_id)
                .single();
            console.log(`Set ${s.set_number} Linked Question Set:`, qSet);

            // Count questions
            const { count } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })
                .eq('question_set_id', s.question_set_id);
            console.log(`Set ${s.set_number} Question Count: ${count}`);
        } else {
            console.log(`Set ${s.set_number} has NO question_set_id`);
        }
    }

    console.log('--- END DEBUG ---');
    process.exit(0);
}

debugSets();
