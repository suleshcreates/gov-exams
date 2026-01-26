
async function checkApi() {
    try {
        console.log("Fetching all special exams...");
        const res = await fetch('http://localhost:8080/api/public/special-exams');
        const exams = await res.json();

        console.log(`Found ${exams.length} exams.`);

        for (const e of exams) {
            console.log(`\nExam: ${e.title} (${e.id})`);

            console.log("Fetching details...");
            const detailRes = await fetch(`http://localhost:8080/api/public/special-exams/${e.id}`);
            const detail = await detailRes.json();

            console.log("Sets found:", detail.sets?.length || 0);
            if (detail.sets) {
                detail.sets.forEach(s => {
                    console.log(`  - Set ${s.set_number}: qID=${s.question_set_id} (Type: ${typeof s.question_set_id})`);
                });
            } else {
                console.log("  NO SETS ARRAY IN RESPONSE!");
            }
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

checkApi();
