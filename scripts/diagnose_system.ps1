$ErrorActionPreference = "Continue"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       WORKSPACE SYSTEM COMPREHENSIVE DEEP DIAGNOSIS            " -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

# 1. JSON Data Validation
Write-Host "=== 1. JSON Data Validation ===" -ForegroundColor Yellow
$jsonFiles = Get-ChildItem -Path "data" -Filter "*.json" -Recurse
$jsonErrCount = 0
foreach ($jf in $jsonFiles) {
    try {
        $raw = [System.IO.File]::ReadAllText($jf.FullName, [System.Text.Encoding]::UTF8)
        $parsed = ConvertFrom-Json $raw
    } catch {
        Write-Host "[ERROR] Invalid JSON: $($jf.FullName) - $($_.Exception.Message)" -ForegroundColor Red
        $jsonErrCount++
    }
}
if ($jsonErrCount -eq 0) {
    Write-Host "[OK] All $($jsonFiles.Count) JSON files parsed validly. 0 Errors.`n" -ForegroundColor Green
} else {
    Write-Host "[FAIL] $jsonErrCount invalid JSON file(s) found!`n" -ForegroundColor Red
}

# 2. Encoding / Broken Characters Check
Write-Host "=== 2. Encoding / Broken Characters Check ===" -ForegroundColor Yellow
$allFiles = Get-ChildItem -Path "assets", "data" -Include "*.js", "*.css", "*.html", "*.json" -Recurse
$encodingWarnCount = 0
foreach ($f in $allFiles) {
    $raw = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    if ($raw.Contains([string][char]0xFFFD)) {
        Write-Host "[WARNING] Potential broken encoding (replacement char) in: $($f.FullName)" -ForegroundColor Yellow
        $encodingWarnCount++
    }
}
if ($encodingWarnCount -eq 0) {
    Write-Host "[OK] No broken encoding characters (0xFFFD) found in any asset or data files.`n" -ForegroundColor Green
}

# 3. Comprehensive Deep Inspection Engine (Node.js)
Write-Host "=== 3. Running 6-Criteria Deep Inspection Engine ===" -ForegroundColor Yellow
$deepInspectionPath = Join-Path $PSScriptRoot "diagnose_deep_inspection.js"
if (Test-Path $deepInspectionPath) {
    & node $deepInspectionPath
} else {
    Write-Host "[WARN] diagnose_deep_inspection.js not found at $deepInspectionPath" -ForegroundColor Yellow
}

Write-Host "`n=== DIAGNOSIS COMPLETED ===" -ForegroundColor Cyan
