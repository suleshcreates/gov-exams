$file = "c:\Users\sules\OneDrive\Desktop\docter agent\exam portal\ethereal-exam-quest\src\admin\lib\adminService.ts"
$lines = Get-Content $file

# Remove lines 14-47 (the backend API code)
$newLines = @()
for ($i = 0; $i -lt $lines.Length; $i++) {
    # Keep lines 0-13 (lines 1-14 in 1-indexed)
    # Skip lines 14-46 (lines 15-47 in 1-indexed) - the bad code
    # Keep lines 47+ (line 48+ in 1-indexed)
    
    if ($i -lt 13) {
        # Keep lines before the bad code
        $newLines += $lines[$i]
    }
    elseif ($i -eq 13) {
        # After line 13 (the students query), add the new code
        $newLines += $lines[$i]  # Keep line 13
        $newLines += ""
        $newLines += "      if (studentsError) {"
        $newLines += "        logger.error('[adminService] Error counting students:', studentsError);"
        $newLines += "      }"
        $newLines += ""
        $newLines += "      // Get active plans count"
        $newLines += "      const now = new Date().toISOString();"
        $newLines += "      const { count: activePlansCount, error: plansError } = await supabase"
        $newLines += "        .from('user_plans')"
        $newLines += "        .select('*', { count: 'exact', head: true })"
        $newLines += "        .eq('is_active', true)"
        $newLines += "        .or(`expires_at.is.null,expires_at.gt.\${now}`);"
        $newLines += ""
        $newLines += "      if (plansError) {"
        $newLines += "        logger.error('[adminService] Error counting plans:', plansError);"
        $newLines += "      }"
        $newLines += ""
        $newLines += "      // Get total exam results count"
        $newLines += "      const { count: resultsCount, error: resultsError } = await supabase"
        $newLines += "        .from('exam_results')"
        $newLines += "        .select('*', { count: 'exact', head: true });"
        $newLines += ""
        $newLines += "      if (resultsError) {"
        $newLines += "        logger.error('[adminService] Error counting results:', resultsError);"
        $newLines += "      }"
        $newLines += ""
        $newLines += "      // Get total revenue"
        $newLines += "      const { data: revenueData, error: revenueError } = await supabase"
        $newLines += "        .from('user_plans')"
        $newLines += "        .select('price_paid');"
        $newLines += ""
        $newLines += "      if (revenueError) {"
        $newLines += "        logger.error('[adminService] Error fetching revenue:', revenueError);"
        $newLines += "      }"
        $newLines += ""
        $newLines += "      const totalRevenue = revenueData?.reduce((sum, plan) => sum + plan.price_paid, 0) || 0;"
        $newLines += ""
        $newLines += "      // Get average score"
        $newLines += "      const { data: scoresData, error: scoresError } = await supabase"
        $newLines += "        .from('exam_results')"
        $newLines += "        .select('accuracy');"
        $newLines += ""
        $newLines += "      if (scoresError) {"
        $newLines += "        logger.error('[adminService] Error fetching scores:', scoresError);"
        $newLines += "      }"
        $newLines += ""
        $newLines += "      const averageScore = scoresData && scoresData.length > 0"
        $newLines += "        ? scoresData.reduce((sum, result) => sum + result.accuracy, 0) / scoresData.length"
        $newLines += "        : 0;"
        $newLines += ""
        $newLines += "      return {"
        $newLines += "        totalStudents: studentsCount || 0,"
        $newLines += "        activePlans: activePlansCount || 0,"
        $newLines += "        totalExamResults: resultsCount || 0,"
        $newLines += "        totalRevenue,"
        $newLines += "        averageScore: Number(averageScore.toFixed(1)),"
        $newLines += "      };"
        $newLines += "    } catch (error) {"
        $newLines += "      logger.error('[adminService] Error fetching dashboard metrics:', error);"
        $newLines += "      return {"
        $newLines += "        totalStudents: 0,"
        $newLines += "        activePlans: 0,"
        $newLines += "        totalExamResults: 0,"
        $newLines += "        totalRevenue: 0,"
        $newLines += "        averageScore: 0,"
        $newLines += "      };"
        $newLines += "    }"
        $newLines += "  },"
        # Now skip to line 48 (index 47)
        $i = 47
    }
    elseif ($i -gt 47) {
        # Keep lines after the bad code
        $newLines += $lines[$i]
    }
}

# Save
$newLines | Set-Content $file
Write-Host "✅ File fixed! Lines 14-47 replaced with Supabase queries"
