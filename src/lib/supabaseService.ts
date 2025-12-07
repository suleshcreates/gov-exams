import { supabase } from './supabase';
import type { Database } from './supabase';
import logger from './logger';

type Student = Database['public']['Tables']['students']['Row'];
type StudentInsert = Database['public']['Tables']['students']['Insert'];
type ExamResult = Database['public']['Tables']['exam_results']['Row'];
type ExamResultInsert = Database['public']['Tables']['exam_results']['Insert'];
type ExamProgress = Database['public']['Tables']['exam_progress']['Row'];
type ExamProgressInsert = Database['public']['Tables']['exam_progress']['Insert'];
type UserPlan = Database['public']['Tables']['user_plans']['Row'];
type UserPlanInsert = Database['public']['Tables']['user_plans']['Insert'];

// Student Operations
export const supabaseService = {
  // Student CRUD
  async createStudent(data: {
    name: string;
    phone: string;
    password_hash: string;
    email?: string;
    username?: string;
    is_verified?: boolean;
    email_verified?: boolean;
  }) {
    const { data: student, error } = await supabase
      .from('students')
      .insert([{
        name: data.name,
        phone: data.phone,
        password_hash: data.password_hash,
        email: data.email || '',
        username: data.username || null,
        is_verified: data.is_verified ?? false,
        email_verified: data.email_verified ?? false
      }])
      .select()
      .single();

    if (error) throw error;
    return student;
  },

  async getStudentByPhone(phone: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  async updateStudentVerification(phone: string, isVerified: boolean) {
    const { data, error } = await supabase
      .from('students')
      .update({ is_verified: isVerified })
      .eq('phone', phone)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStudentPassword(email: string, password_hash: string) {
    const { data, error } = await supabase
      .from('students')
      .update({ password_hash })
      .eq('email', email.toLowerCase())
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Exam Results Operations
  async saveExamResult(result: ExamResultInsert) {
    // Ensure student_name is included (fetch if not provided)
    if (!result.student_name) {
      const student = await this.getStudentByPhone(result.student_phone);
      if (student) {
        result.student_name = student.name;
      }
    }

    const { data, error } = await supabase
      .from('exam_results')
      .insert([result])
      .select()
      .single();

    if (error) throw error;

    // Update progress
    try {
      await this.updateExamProgress(result.student_phone, result.exam_id, result.set_number);
    } catch (progressError) {
      logger.error('Error updating exam progress:', progressError);
      // Don't fail the result save if progress update fails
    }

    return data;
  },

  async updateExamProgress(phone: string, examId: string, completedSetNumber: number) {
    // Check existing progress
    const { data: existing } = await supabase
      .from('exam_progress')
      .select('*')
      .eq('student_phone', phone)
      .eq('exam_id', examId)
      .single();

    if (existing) {
      // Only update if new set number is higher
      if (completedSetNumber > (existing.completed_set_number || 0)) {
        await supabase
          .from('exam_progress')
          .update({
            completed_set_number: completedSetNumber,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      }
    } else {
      // Create new progress record
      await supabase
        .from('exam_progress')
        .insert([{
          student_phone: phone,
          exam_id: examId,
          completed_set_number: completedSetNumber,
          is_unlocked: true // Default to true for first record
        }]);
    }
  },

  async getStudentExamResults(phone: string) {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('student_phone', phone)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getExamResultById(resultId: string) {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('id', resultId)
      .single();

    if (error) throw error;
    return data;
  },

  // Exam Progress Operations
  async updateExamProgress(phone: string, examId: string, completedSetNumber: number, studentName?: string) {
    // Get student name if not provided
    if (!studentName) {
      const student = await this.getStudentByPhone(phone);
      if (student) {
        studentName = student.name;
      }
    }

    // Check if progress exists
    const { data: existing } = await supabase
      .from('exam_progress')
      .select('*')
      .eq('student_phone', phone)
      .eq('exam_id', examId)
      .single();

    if (existing) {
      // Update existing (also update student_name in case it changed)
      const { data, error } = await supabase
        .from('exam_progress')
        .update({
          completed_set_number: completedSetNumber,
          student_name: studentName || existing.student_name
        })
        .eq('student_phone', phone)
        .eq('exam_id', examId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('exam_progress')
        .insert([{
          student_phone: phone,
          student_name: studentName || '',
          exam_id: examId,
          completed_set_number: completedSetNumber
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async getStudentExamProgress(phone: string, examId: string) {
    const { data, error } = await supabase
      .from('exam_progress')
      .select('*')
      .eq('student_phone', phone)
      .eq('exam_id', examId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Analytics
  async getStudentAnalytics(phone: string) {
    const results = await this.getStudentExamResults(phone);

    const totalExams = results.length;
    const averageScore = results.length > 0
      ? results.reduce((acc, r) => acc + r.accuracy, 0) / results.length
      : 0;
    const examsPassed = results.filter(r => r.accuracy >= 85).length;

    return {
      totalExams,
      averageScore: Number(averageScore.toFixed(1)),
      examsPassed,
    };
  },

  // Get student global rank based on average score
  async getStudentGlobalRank(phone: string): Promise<number> {
    try {
      logger.debug('[getStudentGlobalRank] Calculating rank for:', phone);

      // Get all exam results grouped by student
      const { data: allResults, error } = await supabase
        .from('exam_results')
        .select('student_phone, accuracy');

      if (error) {
        logger.error('[getStudentGlobalRank] Error fetching results:', error);
        return 1; // Default to rank 1 if error
      }

      if (!allResults || allResults.length === 0) {
        logger.debug('[getStudentGlobalRank] No results found, returning rank 1');
        return 1; // If no results exist, everyone is rank 1
      }

      // Calculate average score for each student
      const studentScores = new Map<string, { total: number; count: number }>();

      allResults.forEach(result => {
        const existing = studentScores.get(result.student_phone) || { total: 0, count: 0 };
        existing.total += result.accuracy;
        existing.count += 1;
        studentScores.set(result.student_phone, existing);
      });

      // Calculate average for each student and get current student's average
      const averages = Array.from(studentScores.entries()).map(([studentPhone, data]) => ({
        phone: studentPhone,
        average: data.total / data.count
      }));

      // Get current student's average
      const currentStudentData = studentScores.get(phone);
      if (!currentStudentData) {
        logger.debug('[getStudentGlobalRank] Student has no exam results, returning last rank');
        return averages.length + 1; // Student hasn't taken any exams
      }

      const currentAverage = currentStudentData.total / currentStudentData.count;

      // Sort by average (descending) and calculate rank
      // Rank is 1 + number of students with higher average
      const rank = averages.filter(s => s.average > currentAverage).length + 1;

      logger.debug(`[getStudentGlobalRank] Student rank: ${rank} (average: ${currentAverage.toFixed(1)})`);
      return rank;
    } catch (error) {
      logger.error('[getStudentGlobalRank] Exception:', error);
      return 1; // Default to rank 1 if error
    }
  },

  // User Plans Operations
  async createPaymentIntent(amount: number, planId: string) {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: { amount, planId },
    });
    return { data, error };
  },

  async savePlanPurchase(data: {
    student_phone: string;
    student_name?: string;
    plan_id: string | null;
    plan_name: string | null;
    price_paid: number;
    exam_ids: string[];
    expires_at?: string | null;
  }) {
    // Get student name if not provided
    if (!data.student_name) {
      const student = await this.getStudentByPhone(data.student_phone);
      if (student) {
        data.student_name = student.name;
      }
    }

    const { data: plan, error } = await supabase
      .from('user_plans')
      .insert([{
        student_phone: data.student_phone,
        student_name: data.student_name,
        plan_id: data.plan_id,
        plan_template_id: data.plan_id, // Store in both fields for compatibility
        plan_name: data.plan_name,
        price_paid: data.price_paid,
        exam_ids: data.exam_ids,
        expires_at: data.expires_at,
        is_active: true,
      }])
      .select()
      .single();

    if (error) throw error;
    return plan;
  },

  async getStudentPlans(phone: string) {
    const { data, error } = await supabase
      .from('user_plans')
      .select('*')
      .eq('student_phone', phone)
      .eq('is_active', true)
      .order('purchased_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActiveStudentPlans(phone: string) {
    logger.debug('[getActiveStudentPlans] Fetching plans via backend API for phone:', phone);

    // Use backend API for secure plan access
    const token = localStorage.getItem('access_token');
    if (!token) {
      logger.warn('[getActiveStudentPlans] No auth token, returning empty array');
      return [];
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/plans/my-plans`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      logger.debug('[getActiveStudentPlans] Plans retrieved via API:', data);

      return data.plans || [];
    } catch (error) {
      logger.error('[getActiveStudentPlans] Error fetching from backend:', error);
      return [];
    }
  },

  async hasPlanAccess(phone: string, examId: string): Promise<boolean> {
    const plans = await this.getActiveStudentPlans(phone);
    return plans.some(plan => plan.exam_ids.includes(examId));
  },

  async hasExamAccess(phone: string, examId: string): Promise<boolean> {
    const plans = await this.getActiveStudentPlans(phone);
    return plans.some(plan => plan.exam_ids.includes(examId));
  },

  // ============================================
  // EMAIL AUTHENTICATION METHODS (NEW)
  // ============================================

  // Check if username is available
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle(); // Use maybeSingle instead of single to avoid 406 error

      // Available if no data found
      return !data;
    } catch (error) {
      logger.error('[isUsernameAvailable] Error:', error);
      return true; // Assume available on error
    }
  },

  // Check if email is available
  async isEmailAvailable(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('email')
        .eq('email', email.toLowerCase())
        .maybeSingle(); // Use maybeSingle instead of single to avoid 406 error

      // Available if no data found
      return !data;
    } catch (error) {
      logger.error('[isEmailAvailable] Error:', error);
      return true; // Assume available on error
    }
  },

  // Create student with Supabase Auth
  async createStudentWithAuth(data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) {
    const email = data.email.toLowerCase();
    const username = data.username.toLowerCase();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          username: username,
        },
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (authError) throw authError;

    // Manually create student record (don't rely on trigger)
    if (authData.user) {
      try {
        const { error: studentError } = await supabase
          .from('students')
          .insert([{
            email: email,
            username: username,
            name: data.name,
            auth_user_id: authData.user.id,
            email_verified: false,
            password_hash: '', // Not needed with Supabase Auth
            phone: null, // Phone is now optional
          }]);

        if (studentError && studentError.code !== '23505') { // 23505 = unique violation (already exists)
          logger.error('[createStudentWithAuth] Error creating student record:', studentError);
        }
      } catch (error) {
        logger.error('[createStudentWithAuth] Exception creating student record:', error);
      }
    }

    return { user: authData.user };
  },

  // Get student by email or username
  async getStudentByEmailOrUsername(identifier: string) {
    try {
      const lowerIdentifier = identifier.toLowerCase();
      logger.debug(`[getStudentByEmailOrUsername] Searching for: ${lowerIdentifier}`);

      // Check if it looks like an email
      const isEmail = lowerIdentifier.includes('@');

      if (isEmail) {
        logger.debug(`[getStudentByEmailOrUsername] Detected as email, searching by email only`);
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('email', lowerIdentifier)
          .maybeSingle();

        if (error) {
          logger.error('[getStudentByEmailOrUsername] Email search error:', error);
          return null;
        }

        logger.debug(`[getStudentByEmailOrUsername] Email search result:`, data ? 'FOUND' : 'NOT FOUND');
        return data;
      } else {
        logger.debug(`[getStudentByEmailOrUsername] Detected as username, searching by username only`);
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('username', lowerIdentifier)
          .maybeSingle();

        if (error) {
          logger.error('[getStudentByEmailOrUsername] Username search error:', error);
          return null;
        }

        logger.debug(`[getStudentByEmailOrUsername] Username search result:`, data ? 'FOUND' : 'NOT FOUND');
        return data;
      }
    } catch (error) {
      logger.error('[getStudentByEmailOrUsername] Exception:', error);
      return null;
    }
  },

  // Get student by email
  async getStudentByEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error) {
        logger.error('[getStudentByEmail] Error:', error);
        return null;
      }
      return data;
    } catch (error) {
      logger.error('[getStudentByEmail] Exception:', error);
      return null;
    }
  },

  // Update student email verification status
  async updateEmailVerification(email: string, verified: boolean) {
    const { data, error } = await supabase
      .from('students')
      .update({ email_verified: verified })
      .eq('email', email.toLowerCase())
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Resend verification email
  async resendVerificationEmail(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (error) throw error;
    return true;
  },

  // Login with email or username
  async loginWithEmailOrUsername(identifier: string, password: string) {
    try {
      logger.debug(`[loginWithEmailOrUsername] Starting login for: ${identifier}`);

      const lowerIdentifier = identifier.toLowerCase();
      const isEmail = lowerIdentifier.includes('@');

      let emailToUse = lowerIdentifier;

      // If it's a username, we need to look it up
      if (!isEmail) {
        logger.debug(`[loginWithEmailOrUsername] Username detected, looking up email`);
        const student = await this.getStudentByEmailOrUsername(identifier);

        if (!student) {
          logger.error(`[loginWithEmailOrUsername] No student found for username: ${identifier}`);
          throw new Error('Invalid credentials');
        }

        emailToUse = student.email;
        logger.debug(`[loginWithEmailOrUsername] Found email for username: ${emailToUse}`);
      } else {
        logger.debug(`[loginWithEmailOrUsername] Email detected, using directly: ${emailToUse}`);
      }

      logger.debug(`[loginWithEmailOrUsername] Attempting Supabase Auth login with: ${emailToUse}`);

      // Login with email (Supabase Auth requires email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password,
      });

      if (error) {
        logger.error(`[loginWithEmailOrUsername] Supabase Auth error:`, error);
        throw error;
      }

      logger.debug(`[loginWithEmailOrUsername] Supabase Auth successful, fetching student record`);

      // Now fetch the student record
      const student = await this.getStudentByEmail(emailToUse);

      if (!student) {
        logger.error(`[loginWithEmailOrUsername] No student record found after auth`);
        throw new Error('Account not found');
      }

      logger.debug(`[loginWithEmailOrUsername] Complete, returning data`);
      return { user: data.user, student };
    } catch (error) {
      logger.error(`[loginWithEmailOrUsername] Exception:`, error);
      throw error;
    }
  },

  // Request password reset
  async requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return true;
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return true;
  },
};
