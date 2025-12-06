# PowerShell script to replace all console statements with logger in admin panel
$files = Get-ChildItem -Path 'src\admin' -Recurse -Include *.ts,*.tsx

$totalReplaced = 0
$processedFiles = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Check if logger is already imported
    $hasLoggerImport = $content -match "import logger from '@/lib/logger'"
   
    # Replace console.log with logger.debug
    $content = $content -replace "console\.log\(", "logger.debug("
    
    # Replace console.error with logger.error  
    $content = $content -replace "console\.error\(", "logger.error("
    
    # Replace console.warn with logger.warn
    $content = $content -replace "console\.warn\(", "logger.warn("
    
    # If we made replacements and logger isn't imported, add the import
    if ($content -ne $originalContent -and -not $hasLoggerImport) {
        # Find the last import statement
        if ($content -match "^(import .+ from .+;)\r?\n") {
            $lastImport = $matches[0]
            $content = $content -replace [regex]::Escape($lastImport), "$lastImport`nimport logger from '@/lib/logger';"
        }
    }
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        $replacedCount = ([regex]::Matches($originalContent, 'console\.(log|error|warn)')).Count
        $totalReplaced += $replacedCount
        $processedFiles += $file.Name
        
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Output "✓ $($file.Name): Replaced $replacedCount console statements"
    }
}

Write-Output "`n=== Summary ==="
Write-Output "Files processed: $($processedFiles.Count)"
Write-Output "Total console statements replaced: $totalReplaced"
Write-Output "`nProcessed files:"
$processedFiles | ForEach-Object { Write-Output "  - $_" }
