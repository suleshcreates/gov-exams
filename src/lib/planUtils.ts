import { supabaseService } from './supabaseService';
import { mockExams } from '@/data/mockData';
import logger from './logger';

export const planUtils = {
  /**
   * Check if user has access to a specific exam
   * Checks both plan-based access AND individual subject purchases
   */
  async hasExamAccess(studentPhone: string | null, examId: string): Promise<boolean> {
    try {
      if (!studentPhone) {
        return false;
      }

      // Get token for API call
      const token = localStorage.getItem('access_token');
      if (!token) return false;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/plans/my-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return false;
      const data = await response.json();

      const plans = data.plans || [];
      const purchasedSubjects = data.purchased_subjects || [];

      // 1. Check plans (exam_ids or subjects field)
      const planAccess = plans.some((plan: any) => {
        if (Array.isArray(plan.exam_ids) && plan.exam_ids.includes(examId)) return true;
        if (plan.subjects && Array.isArray(plan.subjects) && plan.subjects.includes(examId)) return true;
        return false;
      });

      if (planAccess) return true;

      // 2. Check individual subject purchases
      const subjectAccess = purchasedSubjects.some((purchase: any) => {
        if (purchase.expires_at && new Date(purchase.expires_at) < new Date()) return false;
        return purchase.subject_id === examId;
      });

      return subjectAccess;
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
