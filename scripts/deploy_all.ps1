param (
    [string]$CommitMessage = "feat: synchronize workspace code to GitHub (origin)"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   GitHub Deployment Engine (origin/main)                 " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1. Mandatory Gateway 6: Syntax Verification
Write-Host "`n[Step 1/4] Running Mandatory Syntax Verification..." -ForegroundColor Yellow
$syntaxCheckScript = Join-Path $PSScriptRoot "check_syntax.ps1"
if (Test-Path $syntaxCheckScript) {
    & powershell -ExecutionPolicy Bypass -File $syntaxCheckScript
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Syntax check failed! Deployment aborted to protect production integrity." -ForegroundColor Red
        exit 1
    }
    Write-Host "Syntax verification passed (0 errors)." -ForegroundColor Green
} else {
    Write-Host "Warning: check_syntax.ps1 not found. Proceeding with caution." -ForegroundColor DarkYellow
}

# Step 2. Check Git Status & Commit if needed
Write-Host "`n[Step 2/4] Checking Working Tree and Staging Changes..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "Staging modified and untracked files..." -ForegroundColor Gray
    git add -A
    git commit -m $CommitMessage
    Write-Host "Committed changes with message: '$CommitMessage'" -ForegroundColor Green
} else {
    Write-Host "No unstaged changes to commit. Proceeding with existing commits." -ForegroundColor Gray
}

# Step 3. Pull rebase to ensure clean history
Write-Host "`n[Step 3/4] Pulling latest changes from GitHub (rebase)..." -ForegroundColor Yellow
git pull --rebase origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Rebase failed or conflict detected. Resolve conflicts before pushing." -ForegroundColor Red
    exit 1
}
Write-Host "Rebase sync successful." -ForegroundColor Green

# Step 4. Push to GitHub origin
Write-Host "`n[Step 4/4] Pushing to GitHub (origin main)..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Push to origin main failed." -ForegroundColor Red
    exit 1
}

Write-Host "`n[SUCCESS] Successfully deployed to GitHub (origin/main)!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
