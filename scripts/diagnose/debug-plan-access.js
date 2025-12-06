// Debug Plan Access Issue
// Paste this in browser console to diagnose the problem

async function debugPlanAccess() {
  console.log('=== DEBUGGING PLAN ACCESS ===');
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  console.log('1. Current Auth User:', user?.id, user?.email);
  
  // Get student record
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('auth_user_id', user?.id)
    .single();
  console.log('2. Student Record:', student);
  console.log('   - Phone:', student?.phone);
  console.log('   - Name:', student?.name);
  
  if (!student?.phone) {
    console.error('❌ NO PHONE NUMBER - User must complete profile!');
    return;
  }
  
  // Get user plans
  const { data: plans, error: plansError } = await supabase
    .from('user_plans')
    .select('*')
    .eq('student_phone', student.phone)
    .eq('is_active', true);
  
  console.log('3. User Plans Query Result:', { plans, error: plansError });
  
  if (plans && plans.length > 0) {
    plans.forEach((plan, index) => {
      console.log(`   Plan ${index + 1}:`, {
        plan_id: plan.plan_id,
        plan_template_id: plan.plan_template_id,
        plan_name: plan.plan_name,
        exam_ids: plan.exam_ids,
        exam_ids_type: typeof plan.exam_ids,
        exam_ids_is_array: Array.isArray(plan.exam_ids),
        is_active: plan.is_active,
        expires_at: plan.expires_at,
        purchased_at: plan.purchased_at
      });
    });
  } else {
    console.error('❌ NO PLANS FOUND for phone:', student.phone);
  }
  
  // Check what exam IDs are available
  console.log('4. Available Exam IDs in mockExams:');
  console.log('   - exam-1 (Mathematics)');
  console.log('   - exam-2 (Physics)');
  console.log('   - exam-3 (Chemistry)');
  console.log('   - exam-4 (Biology)');
  console.log('   - exam-5 (General Knowledge)');
  
  // Test access for each exam
  if (plans && plans.length > 0) {
    console.log('5. Testing Access for Each Exam:');
    const examIds = ['exam-1', 'exam-2', 'exam-3', 'exam-4', 'exam-5'];
    
    examIds.forEach(examId => {
      const hasAccess = plans.some(plan => {
        const examIdsArray = Array.isArray(plan.exam_ids) ? plan.exam_ids : [];
        return examIdsArray.includes(examId);
      });
      console.log(`   ${examId}: ${hasAccess ? '✅ HAS ACCESS' : '❌ NO ACCESS'}`);
    });
  }
  
  // Check plan templates
  const { data: templates } = await supabase
    .from('plan_templates')
    .select('*')
    .eq('is_active', true);
  
  console.log('6. Active Plan Templates:', templates);
  if (templates) {
    templates.forEach((template, index) => {
      console.log(`   Template ${index + 1}:`, {
        id: template.id,
        name: template.name,
        subjects: template.subjects,
        subjects_type: typeof template.subjects,
        subjects_is_array: Array.isArray(template.subjects)
      });
    });
  }
  
  console.log('=== END DEBUG ===');
}

// Run the debug
debugPlanAccess();
