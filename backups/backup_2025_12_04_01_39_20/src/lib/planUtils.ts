import { supabaseService } from './supabaseService';
import { mockExams } from '@/data/mockData';
import logger from './logger';

export const planUtils = {
  /**
   * Check if user has access to a specific exam
   */
  async hasExamAccess(studentPhone: string | null, examId: string): Promise<boolean> {
    try {
      if (!studentPhone) {
        logger.debug('No phone number provided, access denied');
        return false;
      }
      const plans = await supabaseService.getActiveStudentPlans(studentPhone);
      console.log(`🔍 [planUtils] Checking access for exam:`, examId);
      console.log(`📋 [planUtils] Found ${plans.length} active plans:`, plans);

      // Log each plan's exam_ids for debugging
      plans.forEach((plan, index) => {
        console.log(`📦 [planUtils] Plan ${index + 1}:`, {
          plan_name: plan.plan_name,
          exam_ids: plan.exam_ids,
          subjects: (plan as any).subjects,
          exam_ids_type: typeof plan.exam_ids,
          is_array: Array.isArray(plan.exam_ids),
          looking_for: examId,
          includes_in_exam_ids: Array.isArray(plan.exam_ids) ? plan.exam_ids.includes(examId) : false,
          includes_in_subjects: (plan as any).subjects && Array.isArray((plan as any).subjects) ? (plan as any).subjects.includes(examId) : false
        });
      });

      const hasAccess = plans.some(plan => {
        // Check exam_ids field (standard field for purchased plans)
        if (Array.isArray(plan.exam_ids) && plan.exam_ids.includes(examId)) {
          return true;
        }

        // Also check if plan has a 'subjects' field (from admin panel plan templates)
        // @ts-ignore - subjects might not be in type but could exist in database
        if (plan.subjects && Array.isArray(plan.subjects) && plan.subjects.includes(examId)) {
          return true;
        }

        return false;
      });
      logger.debug(`Access result: ${hasAccess}`);
      return hasAccess;
    } catch (error) {
      logger.error('Error checking exam access:', error);
      return false;
    }
  },

  /**
   * Get all accessible exam IDs for a user
   */
  async getAccessibleExams(studentPhone: string | null): Promise<string[]> {
    try {
      if (!studentPhone) {
        return [];
      }
      const plans = await supabaseService.getActiveStudentPlans(studentPhone);
      const examIds = new Set<string>();

      plans.forEach(plan => {
        // Add from exam_ids field
        if (Array.isArray(plan.exam_ids)) {
          plan.exam_ids.forEach(id => examIds.add(id));
        }
        // Also add from subjects field if it exists
        // @ts-ignore - subjects might not be in type
        if (plan.subjects && Array.isArray(plan.subjects)) {
          // @ts-ignore
          plan.subjects.forEach(id => examIds.add(id));
        }
      });

      return Array.from(examIds);
    } catch (error) {
      logger.error('Error getting accessible exams:', error);
      return [];
    }
  },

  /**
   * Check if user has already purchased a specific subject
   */
  async hasSubjectPurchased(studentPhone: string | null, examId: string): Promise<boolean> {
    return this.hasExamAccess(studentPhone, examId);
  },

  /**
   * Get purchased plans with details including subject names
   */
  async getPurchasedPlansWithDetails(studentPhone: string | null) {
    try {
      if (!studentPhone) {
        return [];
      }
      const plans = await supabaseService.getActiveStudentPlans(studentPhone);
      return plans.map(plan => ({
        ...plan,
        subjectNames: mockExams
          .filter(exam => plan.exam_ids.includes(exam.id))
          .map(exam => exam.title)
      }));
    } catch (error) {
      logger.error('Error getting purchased plans:', error);
      return [];
    }
  }
};
