$filePath = "c:\Users\sules\OneDrive\Desktop\docter agent\exam portal\ethereal-exam-quest\src\admin\lib\adminService.ts"
$content = Get-Content $filePath -Raw

# Define the old code to replace
$oldCode = @'
  // Dashboard Metrics
  async getDashboardMetrics() {
    try {
      // Get total students count
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });


      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats from backend');
      }

      const { stats } = await response.json();
      
      // Map backend response to expected format
      return {
        totalStudents: stats.totalStudents,
        activePlans: stats.totalPlans, // Backend returns totalPlans
        totalExamResults: stats.totalResults, // Backend returns totalResults
        totalRevenue: 0, // Not implemented in backend yet
        averageScore: 0, // Not implemented in backend yet
      };
    } catch (error) {
      logger.error('[adminService] Error fetching dashboard metrics from backend:', error);
      // Return empty metrics on error
      return {
        totalStudents: 0,
        activePlans: 0,
        totalExamResults: 0,
        totalRevenue: 0,
        averageScore: 0,
      };
    }
  },
'@

# Define the new code
$newCode = @'
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
'@

# Replace the content
$newContent = $content -replace [regex]::Escape($oldCode), $newCode

# Write back to file
Set-Content -Path $filePath -Value $newContent -NoNewline

Write-Host "✅ File updated successfully!"
