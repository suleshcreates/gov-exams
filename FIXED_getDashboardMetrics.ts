import { supabase } from '@/lib/supabase';
import logger from '@/lib/logger';


export const adminService = {
    // Dashboard Metrics - Direct Supabase queries (uses RLS policies)
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

// PASTE THE REST OF THE FILE BELOW THIS LINE
// Keep everything from line 57 onwards from the original file
