import { supabase } from '@/lib/supabase';
import logger from '@/lib/logger';


export const adminService = {
  // Dashboard Metrics
  async getDashboardMetrics() {
    try {
      // Get total students count
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });



      if (studentsError) {
        logger.error('[adminService] Error counting students:', studentsError);
      }

      // Get active plans count
      const now = new Date().toISOString();
      const { count: activePlansCount, error: plansError } = await supabase
        .from('user_plans')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`);

      if (plansError) {
        logger.error('[adminService] Error counting plans:', plansError);
      }

      // Get total exam results count
      const { count: resultsCount, error: resultsError } = await supabase
        .from('exam_results')
        .select('*', { count: 'exact', head: true });

      if (resultsError) {
        logger.error('[adminService] Error counting results:', resultsError);
      }

      // Get total revenue
      const { data: revenueData, error: revenueError } = await supabase
        .from('user_plans')
        .select('price_paid');

      if (revenueError) {
        logger.error('[adminService] Error fetching revenue:', revenueError);
      }

      const totalRevenue = revenueData?.reduce((sum, plan) => sum + plan.price_paid, 0) || 0;

      // Get average score
      const { data: scoresData, error: scoresError } = await supabase
        .from('exam_results')
        .select('accuracy');

      if (scoresError) {
        logger.error('[adminService] Error fetching scores:', scoresError);
      }

      const averageScore = scoresData && scoresData.length > 0
        ? scoresData.reduce((sum, result) => sum + result.accuracy, 0) / scoresData.length
        : 0;

      return {
        totalStudents: studentsCount || 0,
        activePlans: activePlansCount || 0,
        totalExamResults: resultsCount || 0,
        totalRevenue,
        averageScore: Number(averageScore.toFixed(1)),
      };
    } catch (error) {
      logger.error('[adminService] Error fetching dashboard metrics:', error);
      return {
        totalStudents: 0,
        activePlans: 0,
        totalExamResults: 0,
        totalRevenue: 0,
        averageScore: 0,
      };
    }
  },

  // Recent Activity
  async getRecentRegistrations(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('email, username, name, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('[adminService] Error fetching recent registrations:', error);
      throw error;
    }
  },

  async getRecentExamCompletions(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select('id, student_name, exam_title, score, total_questions, accuracy, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('[adminService] Error fetching recent exam completions:', error);
      throw error;
    }
  },

  async getRecentPlanPurchases(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('user_plans')
        .select('id, student_name, plan_name, price_paid, purchased_at')
        .order('purchased_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('[adminService] Error fetching recent plan purchases:', error);
      throw error;
    }
  },

  // Students Management
  async getStudents(page = 1, limit = 20, search = '') {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('students')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (search) {
        query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%,name.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        students: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      logger.error('[adminService] Error fetching students:', error);
      throw error;
    }
  },

  async getStudentById(email: string) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('[adminService] Error fetching student:', error);
      throw error;
    }
  },

  async updateStudentVerification(email: string, verified: boolean) {
    try {
      const { data, error } = await supabase
        .from('students')
        .update({ email_verified: verified, is_verified: verified })
        .eq('email', email)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('[adminService] Error updating student verification:', error);
      throw error;
    }
  },

  async updateStudentInfo(email: string, updates: { name?: string; phone?: string }) {
    try {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('email', email)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('[adminService] Error updating student info:', error);
      throw error;
    }
  },

  async getStudentPlans(studentName: string) {
    try {
      const { data, error } = await supabase
        .from('user_plans')
        .select('*')
        .eq('student_name', studentName)
        .order('purchased_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((plan: any) => ({
        ...plan,
        exam_access: plan.exam_ids || plan.subjects || [],
      }));
    } catch (error) {
      logger.error('[adminService] Error fetching student plans:', error);
      throw error;
    }
  },

  async getStudentExamHistory(studentName: string) {
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('student_name', studentName)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('[adminService] Error fetching student exam history:', error);
      throw error;
    }
  },

  async getStudentAnalytics(studentName: string) {
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select('accuracy, score, total_questions')
        .eq('student_name', studentName);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          totalExams: 0,
          averageScore: 0,
          passRate: 0,
        };
      }

      const totalExams = data.length;
      const averageScore = data.reduce((sum, r) => sum + r.accuracy, 0) / totalExams;
      const passRate = (data.filter(r => r.accuracy >= 85).length / totalExams) * 100;

      return {
        totalExams,
        averageScore: Number(averageScore.toFixed(1)),
        passRate: Number(passRate.toFixed(1)),
      };
    } catch (error) {
      logger.error('[adminService] Error fetching student analytics:', error);
      throw error;
    }
  },

  // Subjects Management
  async getSubjects() {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('[adminService] Error fetching subjects:', error);
      throw error;
    }
  },

  async getSubjectById(id: string) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('[adminService] Error fetching subject:', error);
      throw error;
    }
  },

  async createSubject(name: string, description: string) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([{ name, description }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('[adminService] Error creating subject:', error);
      throw error;
    }
  },

  async updateSubject(id: string, name: string, description: string) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update({ name, description })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('[adminService] Error updating subject:', error);
      throw error;
    }
  },

  async deleteSubject(id: string) {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('[adminService] Error deleting subject:', error);
      throw error;
    }
  },

  // Question Sets Management
  async getQuestionSets(subjectId?: string) {
    try {
      let query = supabase
        .from('question_sets')
        .select(`
          *,
          subject:subjects(id, name)
        `)
        .order('created_at', { ascending: false });

      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('[adminService] Error fetching question sets:', error);
      throw error;
    }
  },

  async createQuestionSet(data: {
    subject_id: string;
    exam_id: string;
    set_number: number;
    time_limit_minutes: number;
  }) {
    try {
      const { data: questionSet, error } = await supabase
        .from('question_sets')
        .insert([data])
        .select()
        .single();

      if (error) {
        logger.error('[adminService] Supabase error creating question set:', error);
        // Check if it's a table doesn't exist error
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          throw new Error('Database tables not set up. Please run the SQL migration script first. See ADMIN_PANEL_SETUP.md for instructions.');
        }
        throw error;
      }
      return questionSet;
    } catch (error) {
      logger.error('[adminService] Error creating question set:', error);
      throw error;
    }
  },

  async updateQuestionSet(id: string, data: {
    subject_id?: string;
    exam_id?: string;
    set_number?: number;
    time_limit_minutes?: number;
  }) {
    try {
      const { data: questionSet, error } = await supabase
        .from('question_sets')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return questionSet;
    } catch (error) {
      logger.error('[adminService] Error updating question set:', error);
      throw error;
    }
  },

  async deleteQuestionSet(id: string) {
    try {
      const { error } = await supabase
        .from('question_sets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('[adminService] Error deleting question set:', error);
      throw error;
    }
  },

  // Questions Management
  async getQuestions(questionSetId: string) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('question_set_id', questionSetId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('[adminService] Error fetching questions:', error);
      throw error;
    }
  },

  async createQuestion(data: {
    question_set_id: string;
    question_text: string;
    question_text_marathi: string;
    option_1: string;
    option_1_marathi: string;
    option_2: string;
    option_2_marathi: string;
    option_3: string;
    option_3_marathi: string;
    option_4: string;
    option_4_marathi: string;
    correct_answer: number;
    order_index: number;
  }) {
    try {
      const { data: question, error } = await supabase
        .from('questions')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return question;
    } catch (error) {
      logger.error('[adminService] Error creating question:', error);
      throw error;
    }
  },

  async updateQuestion(id: string, data: Partial<{
    question_text: string;
    question_text_marathi: string;
    option_1: string;
    option_1_marathi: string;
    option_2: string;
    option_2_marathi: string;
    option_3: string;
    option_3_marathi: string;
    option_4: string;
    option_4_marathi: string;
    correct_answer: number;
    order_index: number;
  }>) {
    try {
      const { data: question, error } = await supabase
        .from('questions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return question;
    } catch (error) {
      logger.error('[adminService] Error updating question:', error);
      throw error;
    }
  },

  async deleteQuestion(id: string) {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('[adminService] Error deleting question:', error);
      throw error;
    }
  },

  async bulkCreateQuestions(questionSetId: string, questions: Array<{
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string; // "A", "B", "C", or "D"
    explanation?: string;
  }>) {
    try {
      // Get current max order_index
      const { data: existing } = await supabase
        .from('questions')
        .select('order_index')
        .eq('question_set_id', questionSetId)
        .order('order_index', { ascending: false })
        .limit(1);

      let startIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 1;

      // Map questions to database format
      const questionsToInsert = questions.map((q, idx) => {
        // Convert A/B/C/D to 1/2/3/4
        // Map A,B,C,D to 0,1,2,3 (Database expects 0-based index)
        const answerMap: { [key: string]: number } = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        const correctAnswer = answerMap[q.correct_answer.toUpperCase()];

        return {
          question_set_id: questionSetId,
          question_text: q.question_text,
          question_text_marathi: '', // Will be auto-translated on frontend
          option_1: q.option_a,
          option_1_marathi: '',
          option_2: q.option_b,
          option_2_marathi: '',
          option_3: q.option_c,
          option_3_marathi: '',
          option_4: q.option_d,
          option_4_marathi: '',
          correct_answer: correctAnswer,
          // explanation: q.explanation || '', // Temporarily disabled: Column missing in DB
          order_index: startIndex + idx
        };
      });

      // Insert in batch
      const { data, error } = await supabase
        .from('questions')
        .insert(questionsToInsert)
        .select();

      if (error) throw error;

      logger.info(`[adminService] Bulk imported ${data?.length || 0} questions`);
      return data || [];
    } catch (error) {
      logger.error('[adminService] Error bulk creating questions:', error);
      throw error;
    }
  },

  // Exam Results
  async getExamResults(page = 1, limit = 20, filters?: {
    examId?: string;
    studentSearch?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('exam_results')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (filters?.examId) {
        query = query.eq('exam_id', filters.examId);
      }

      if (filters?.studentSearch) {
        query = query.or(`student_name.ilike.%${filters.studentSearch}%,student_phone.ilike.%${filters.studentSearch}%`);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        results: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      logger.error('[adminService] Error fetching exam results:', error);
      throw error;
    }
  },

  // User Plans
  async getUserPlans(page = 1, limit = 20, filters?: {
    status?: 'active' | 'expired' | 'all';
    studentSearch?: string;
  }) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('user_plans')
        .select('*', { count: 'exact' })
        .order('purchased_at', { ascending: false })
        .range(from, to);

      if (filters?.status === 'active') {
        const now = new Date().toISOString();
        query = query.eq('is_active', true).or(`expires_at.is.null,expires_at.gt.${now}`);
      } else if (filters?.status === 'expired') {
        const now = new Date().toISOString();
        query = query.or(`is_active.eq.false,expires_at.lt.${now}`);
      }

      if (filters?.studentSearch) {
        query = query.or(`student_name.ilike.%${filters.studentSearch}%,student_phone.ilike.%${filters.studentSearch}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        plans: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      logger.error('[adminService] Error fetching user plans:', error);
      throw error;
    }
  },

  async deactivateUserPlan(id: string) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/plans/deactivate/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.plan;
    } catch (error) {
      logger.error('[adminService] Error deactivating user plan:', error);
      throw error;
    }
  },

  async createManualPlan(planData: {
    student_id: string;
    plan_name: string;
    price_paid: number;
    exam_access: string[];
    expires_at: string | null;
  }) {
    try {
      // Get student info
      const student = await this.getStudentById(planData.student_id);

      const { data, error } = await supabase
        .from('user_plans')
        .insert([{
          student_id: planData.student_id,
          student_name: student.name,
          student_phone: student.phone || student.email,
          plan_name: planData.plan_name,
          price_paid: planData.price_paid,
          exam_access: planData.exam_access,
          purchased_at: new Date().toISOString(),
          expires_at: planData.expires_at,
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('[adminService] Error creating manual plan:', error);
      throw error;
    }
  },

  async searchStudentsForPlan(search: string) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, email, phone, username')
        .or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,username.ilike.%${search}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('[adminService] Error searching students:', error);
      throw error;
    }
  },

  // Subject Pricing Methods
  async getSubjectPricing() {
    try {
      const { data, error } = await supabase
        .from('subject_pricing')
        .select(`
          *,
          subject:subjects(id, name, description)
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('[adminService] Error fetching subject pricing:', error);
      throw error;
    }
  },

  async updateSubjectPricing(subjectId: string, data: {
    price: number;
    validity_days: number | null;
    is_active: boolean;
  }) {
    try {
      // Check if pricing exists for this subject
      const { data: existing } = await supabase
        .from('subject_pricing')
        .select('id')
        .eq('subject_id', subjectId)
        .single();

      if (existing) {
        // Update existing
        const { data: updated, error } = await supabase
          .from('subject_pricing')
          .update(data)
          .eq('subject_id', subjectId)
          .select()
          .single();

        if (error) throw error;
        return updated;
      } else {
        // Create new
        const { data: created, error } = await supabase
          .from('subject_pricing')
          .insert([{ subject_id: subjectId, ...data }])
          .select()
          .single();

        if (error) throw error;
        return created;
      }
    } catch (error) {
      logger.error('[adminService] Error updating subject pricing:', error);
      throw error;
    }
  },

  async toggleSubjectPricingStatus(subjectId: string, isActive: boolean) {
    try {
      const { data, error } = await supabase
        .from('subject_pricing')
        .update({ is_active: isActive })
        .eq('subject_id', subjectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('[adminService] Error toggling subject pricing status:', error);
      throw error;
    }
  },

  // Plan Template Methods
  async getPlanTemplates(includeInactive = false) {
    try {
      let query = supabase
        .from('plan_templates')
        .select('*')
        .order('display_order', { ascending: true });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('[adminService] Error fetching plan templates:', error);
      throw error;
    }
  },

  async createPlanTemplate(data: {
    name: string;
    description: string;
    price: number;
    validity_days: number | null;
    subjects: string[];
    badge?: string;
    display_order?: number;
  }) {
    try {
      const { data: plan, error } = await supabase
        .from('plan_templates')
        .insert([{
          ...data,
          subjects: JSON.stringify(data.subjects),
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return plan;
    } catch (error) {
      logger.error('[adminService] Error creating plan template:', error);
      throw error;
    }
  },

  async updatePlanTemplate(id: string, data: {
    name?: string;
    description?: string;
    price?: number;
    validity_days?: number | null;
    subjects?: string[];
    badge?: string;
    display_order?: number;
    is_active?: boolean;
  }) {
    try {
      logger.debug('[adminService] Updating plan template:', id, data);

      const updateData = { ...data };
      if (data.subjects) {
        updateData.subjects = JSON.stringify(data.subjects) as any;
      }

      const { data: plan, error } = await supabase
        .from('plan_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('[adminService] Supabase error updating plan template:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        // Provide more specific error messages
        if (error.code === '42501') {
          throw new Error('Permission denied. Please ensure you are logged in as an admin.');
        } else if (error.code === '23505') {
          throw new Error('A plan with this name already exists.');
        } else {
          throw new Error(`Failed to update plan: ${error.message}`);
        }
      }

      logger.debug('[adminService] Plan template updated successfully:', plan);
      return plan;
    } catch (error) {
      logger.error('[adminService] Error updating plan template:', error);
      throw error;
    }
  },

  async deletePlanTemplate(id: string) {
    try {
      const { error } = await supabase
        .from('plan_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('[adminService] Error deleting plan template:', error);
      throw error;
    }
  },

  // Discount Methods
  async createDiscount(data: {
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    applicable_to?: string[] | null;
    start_date: string;
    end_date: string;
    usage_limit?: number | null;
  }) {
    try {
      const { data: discount, error } = await supabase
        .from('plan_discounts')
        .insert([{
          ...data,
          applicable_to: data.applicable_to ? JSON.stringify(data.applicable_to) : null,
          is_active: true,
          usage_count: 0,
        }])
        .select()
        .single();

      if (error) throw error;
      return discount;
    } catch (error) {
      logger.error('[adminService] Error creating discount:', error);
      throw error;
    }
  },

  async applyDiscountCode(code: string, planId: string, originalPrice: number) {
    try {
      const { data: discount, error } = await supabase
        .from('plan_discounts')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !discount) {
        throw new Error('Invalid or expired discount code');
      }

      // Check if discount is valid for this plan
      if (discount.applicable_to) {
        const applicablePlans = JSON.parse(discount.applicable_to);
        if (!applicablePlans.includes(planId)) {
          throw new Error('Discount code not applicable to this plan');
        }
      }

      // Check date validity
      const now = new Date();
      const startDate = new Date(discount.start_date);
      const endDate = new Date(discount.end_date);

      if (now < startDate || now > endDate) {
        throw new Error('Discount code has expired');
      }

      // Check usage limit
      if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
        throw new Error('Discount code usage limit reached');
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (discount.discount_type === 'percentage') {
        discountAmount = (originalPrice * discount.discount_value) / 100;
      } else {
        discountAmount = discount.discount_value;
      }

      // Ensure discount doesn't exceed original price
      discountAmount = Math.min(discountAmount, originalPrice);

      return {
        isValid: true,
        discountAmount,
        finalPrice: originalPrice - discountAmount,
        discountCode: code.toUpperCase(),
      };
    } catch (error: any) {
      logger.error('[adminService] Error applying discount code:', error);
      throw error;
    }
  },

  async getActiveDiscounts() {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('plan_discounts')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('[adminService] Error fetching active discounts:', error);
      throw error;
    }
  },
};
