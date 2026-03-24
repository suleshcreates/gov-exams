const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL || 'https://vlybntpntmrlwswcqqzy.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkHistory() {
    const userPhone = "9404286121"; 
    
    // Complex join to test getStudentExamHistoryController's exact query
    const { data: complex, error: complexError } = await supabase
        .from('exam_results')
        .select(`
            *,
            question_sets (
                name,
                topics(
                    title,
                    subjects(
                        name
                    )
                )
            )
        `)
        .limit(1);

    const fs = require('fs');
    fs.writeFileSync('error.txt', JSON.stringify({
        message: complexError?.message,
        details: complexError?.details,
        hint: complexError?.hint
    }, null, 2));
    console.log("Error written to error.txt");
}

checkHistory();

