import { supabase } from '@/lib/supabase';
import logger from '@/lib/logger';


export const adminService = {
  // Dashboard Metrics
  async getDashboardMetrics() {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
      }

      const result = await response.json();
      return {
        totalStudents: result.stats?.totalStudents || 0,
        activePlans: result.stats?.activePlans || 0,
        totalExamResults: result.stats?.totalResults || 0,
        totalRevenue: result.stats?.totalRevenue || 0,
        averageScore: result.stats?.averageScore || 0,
        revenueByPlan: result.stats?.revenueByPlan || {},
      };
    } catch (error) {
      logger.error('[adminService] Error fetching dashboard metrics:', error);
      return {
        totalStudents: 0,
        activePlans: 0,
        totalExamResults: 0,
        totalRevenue: 0,
        averageScore: 0,
        revenueByPlan: {},
      };
    }
  },

  // Recent Activity
  async getRecentRegistrations(limit = 5) {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/recent-registrations?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent registrations');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      logger.error('[adminService] Error fetching recent registrations:', error);
      return [];
    }
  },

  async getRecentExamCompletions(limit = 10) {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/recent-exam-completions?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent exam completions');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      logger.error('[adminService] Error fetching recent exam completions:', error);
      return [];
    }
  },

  async getRecentPlanPurchases(limit = 5) {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/recent-plan-purchases?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent plan purchases');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      logger.error('[adminService] Error fetching recent plan purchases:', error);
      return [];
    }
  },

  // Students Management
  async getStudents(page = 1, limit = 20, search = '') {
    try {
      const token = localStorage.getItem('admin_access_token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/students?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const result = await response.json();
      return result.data;
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
        .order('created_at', { ascending: false });

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
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/subjects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subject');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      logger.error('[adminService] Error creating subject:', error);
      throw error;
    }
  },

  async updateSubject(id: string, name: string, description: string) {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/subjects/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update subject');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      logger.error('[adminService] Error updating subject:', error);
      throw error;
    }
  },

  async deleteSubject(id: string) {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/subjects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete subject');
      }

      return true;
    } catch (error) {
      logger.error('[adminService] Error deleting subject:', error);
      throw error;
    }
  },

  // Topics Management
  async getTopics(subjectId: string) {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/subjects/${subjectId}/topics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      logger.error('[adminService] Error fetching topics:', error);
      throw error;
    }
  },

  async createTopic(data: {
    subject_id: string;
    title: string;
    description: string;
    video_url: string;
    video_duration: number;
    order_index: number;
  }) {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/topics`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create topic');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      logger.error('[adminService] Error creating topic:', error);
      throw error;
    }
  },

  async updateTopic(id: string, data: Partial<{
    title: string;
    description: string;
    video_url: string;
    video_duration: number;
    order_index: number;
    is_active: boolean;
  }>) {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/topics/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update topic');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      logger.error('[adminService] Error updating topic:', error);
      throw error;
    }
  },

  async deleteTopic(id: string) {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/topics/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete topic');
      }

      return true;
    } catch (error) {
      logger.error('[adminService] Error deleting topic:', error);
      throw error;
    }
  },

  async uploadTopicVideo(file: File) {
    try {
      const token = localStorage.getItem('admin_access_token');
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/upload-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Content-Type is automatically set by browser for FormData
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload video');
      }

      const result = await response.json();
      return result.publicUrl;
    } catch (error) {
      logger.error('[adminService] Error uploading video:', error);
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
          subject:subjects(id, name),
          topic:topics(title)
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
    exam_id?: string;
    topic_id?: string;
    set_number: number;
    time_limit_minutes: number;
  }) {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/question-sets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create question set');
      }

      const result = await response.json();
      return result;
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
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/question-sets/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update question set');
      }

      const result = await response.json();
      return result;
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

      // Insert in batch via backend API (bypass RLS)
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/questions/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ questions: questionsToInsert })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to bulk import questions');
      }

      const result = await response.json();
      logger.info(`[adminService] Bulk imported ${result?.length || 0} questions`);
      return result || [];
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
      const token = localStorage.getItem('admin_access_token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.examId && { examId: filters.examId }),
        ...(filters?.studentSearch && { studentSearch: filters.studentSearch }),
        ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters?.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/exam-results?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exam results');
      }

      const result = await response.json();
      return result.data;
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
      const token = localStorage.getItem('admin_access_token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.studentSearch && { studentSearch: filters.studentSearch }),
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/plans?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user plans');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('[adminService] Error fetching user plans:', error);
      throw error;
    }
  },

  async deactivateUserPlan(id: string) {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/plans/${id}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate user plan');
      }

      const result = await response.json();
      return result.data;
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
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/plans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create manual plan');
      }

      const result = await response.json();
      return result.data;
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

  // Plan Templates Management
  async getPlanTemplates() {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/plan-templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plan templates');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('[adminService] Error fetching plan templates:', error);
      throw error;
    }
  },

  async createPlanTemplate(data: any) {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/plan-templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create plan template');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('[adminService] Error creating plan template:', error);
      throw error;
    }
  },

  async updatePlanTemplate(id: string, data: any) {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/plan-templates/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan template');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('[adminService] Error updating plan template:', error);
      throw error;
    }
  },

  async deletePlanTemplate(id: string) {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/plan-templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete plan template');
      }

      return true;
    } catch (error) {
      logger.error('[adminService] Error deleting plan template:', error);
      throw error;
    }
  },
};
