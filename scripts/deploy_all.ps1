param (
    [string]$CommitMessage = "feat: synchronize system to dual remotes (GitHub and Sisun Git)"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   🚀 Dual Remote Deployment Engine (GitHub + Sisun Git)   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1. Mandatory Gateway 6: Syntax Verification
Write-Host "`n[Step 1/4] Running Mandatory Syntax Verification..." -ForegroundColor Yellow
$syntaxCheckScript = Join-Path $PSScriptRoot "check_syntax.ps1"
if (Test-Path $syntaxCheckScript) {
    & powershell -ExecutionPolicy Bypass -File $syntaxCheckScript
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Syntax check failed! Deployment aborted to protect production integrity." -ForegroundColor Red
        exit 1
    }
    Write-Host "✔ Syntax verification passed (0 errors)." -ForegroundColor Green
} else {
    Write-Host "⚠ Warning: check_syntax.ps1 not found. Proceeding with caution." -ForegroundColor DarkYellow
}

# Step 2. Check Git Status & Commit if needed
Write-Host "`n[Step 2/4] Checking Working Tree and Staging Changes..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "Staging modified and untracked files..." -ForegroundColor Gray
    git add -A
    git commit -m $CommitMessage
    Write-Host "✔ Committed changes with message: '$CommitMessage'" -ForegroundColor Green
} else {
    Write-Host "ℹ No unstaged changes to commit. Proceeding with existing commits." -ForegroundColor Gray
}

# Step 3. Pull rebase to ensure clean history
Write-Host "`n[Step 3/4] Pulling latest changes from GitHub (rebase)..." -ForegroundColor Yellow
try {
    git pull --rebase origin main
    Write-Host "✔ Rebase sync successful." -ForegroundColor Green
} catch {
    Write-Host "⚠ Warning during pull --rebase. Please check for merge conflicts." -ForegroundColor DarkYellow
}

# Step 4. Push to Dual Remotes
Write-Host "`n[Step 4/4] Pushing to Dual Remotes (GitHub + Sisun Git)..." -ForegroundColor Yellow

# Ensure SSL verification is bypassed for IP-based direct Sisun access
git config http.sslVerify false

$origPref = $ErrorActionPreference
$ErrorActionPreference = "Continue"

Write-Host "Executing: git push origin main" -ForegroundColor Cyan
git push origin main
$pushExitCode = $LASTEXITCODE

$ErrorActionPreference = $origPref

if ($pushExitCode -eq 0) {
    Write-Host "`n🎉 [SUCCESS] Successfully deployed to both GitHub and Sisun Git!" -ForegroundColor Green
} else {
    Write-Host "`n⚠ Multi-push returned non-zero code ($pushExitCode). Checking individual remotes..." -ForegroundColor Yellow
    
    Write-Host "`nAttempting dedicated push to GitHub (origin)..." -ForegroundColor Cyan
    git push https://github.com/bychoi-space/workspace.git main
    
    Write-Host "`nAttempting dedicated push to Sisun Git (sisun)..." -ForegroundColor Cyan
    git push sisun main
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "   Deployment Summary Complete                             " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
