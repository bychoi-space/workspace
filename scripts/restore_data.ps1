# ==============================================================================
# restore_data.ps1 - Workspace Editor Interactive Rollback & Restore Engine
# ==============================================================================
[CmdletBinding()]
param (
    [string]$ConfigFile = "$PSScriptRoot\..\backup_config.json",
    [string]$TargetZip = "",
    [switch]$Latest,
    [switch]$Force
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

# 1. Load configuration
$rootDir = (Resolve-Path "$PSScriptRoot\..").Path
$sourceDir = Join-Path $rootDir "data"
$backupBaseDir = "C:\ai_work_backups\daily"

if (Test-Path $ConfigFile) {
    try {
        $cfg = [System.IO.File]::ReadAllText($ConfigFile, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
        if ($cfg.sourcePath) { $sourceDir = $cfg.sourcePath }
        if ($cfg.backupDirectory) { $backupBaseDir = $cfg.backupDirectory }
    } catch {
        Write-Warning "[RESTORE] Config reading failed, using defaults: $_"
    }
}

$logsDir = Join-Path $rootDir "logs"
$logFile = Join-Path $logsDir "backup_history.log"

function Write-RestoreLog([string]$msg) {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $logLine = "[$timestamp] [RESTORE] $msg"
    Write-Host $logLine
    if (Test-Path $logsDir) {
        [System.IO.File]::AppendAllText($logFile, "$logLine`r`n", [System.Text.Encoding]::UTF8)
    }
}

# 2. Find backup archives
if (-not (Test-Path $backupBaseDir)) {
    Write-Error "[RESTORE] Backup directory does not exist: $backupBaseDir"
    exit 1
}

$backupList = Get-ChildItem -Path $backupBaseDir -Filter "data_daily_*.zip" | Sort-Object CreationTime -Descending

if ($backupList.Count -eq 0) {
    Write-Error "[RESTORE] No backup archives found in $backupBaseDir."
    exit 1
}

$selectedZip = $null

if ($TargetZip) {
    if (Test-Path $TargetZip) {
        $selectedZip = Get-Item $TargetZip
    } else {
        $candidate = Join-Path $backupBaseDir $TargetZip
        if (Test-Path $candidate) {
            $selectedZip = Get-Item $candidate
        } else {
            Write-Error "[RESTORE] Specified backup file not found: $TargetZip"
            exit 1
        }
    }
} elseif ($Latest) {
    $selectedZip = $backupList[0]
} else {
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host " Workspace Editor Available Backup Archives" -ForegroundColor Cyan
    Write-Host "==================================================================" -ForegroundColor Cyan
    for ($i = 0; $i -lt $backupList.Count; $i++) {
        $item = $backupList[$i]
        $sizeMB = [Math]::Round($item.Length / 1MB, 2)
        $dateStr = $item.CreationTime.ToString("yyyy-MM-dd HH:mm:ss")
        $tag = if ($i -eq 0) { " [LATEST]" } else { "" }
        Write-Host (" [{0,2}] {1}  ({2,6} MB)  {3}{4}" -f ($i + 1), $dateStr, $sizeMB, $item.Name, $tag)
    }
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host ""

    $choice = Read-Host "Select backup number to restore (or 'Q' to cancel)"
    if ($choice -match "^[Qq]") {
        Write-Host "[RESTORE] Cancelled by user." -ForegroundColor Yellow
        exit 0
    }

    $idx = 0
    if ([int]::TryParse($choice, [ref]$idx) -and $idx -ge 1 -and $idx -le $backupList.Count) {
        $selectedZip = $backupList[$idx - 1]
    } else {
        Write-Error "[RESTORE] Invalid selection. Aborted."
        exit 1
    }
}

Write-Host ""
Write-Host "[RESTORE] Selected archive : $($selectedZip.Name)" -ForegroundColor Green
Write-Host "[RESTORE] Destination target : $sourceDir"

if (-not $Force) {
    $confirm = Read-Host "Are you sure you want to restore? Current data will be safely backed up before replacement. (Y/N)"
    if ($confirm -notmatch "^[Yy]") {
        Write-Host "[RESTORE] Aborted by user." -ForegroundColor Yellow
        exit 0
    }
}

# 3. Transactional Restore Pipeline with Auto-Rollback
Add-Type -AssemblyName System.IO.Compression.FileSystem
$timeTag = (Get-Date).ToString("yyyyMMdd_HHmmss")
$safetyBackupDir = Join-Path $backupBaseDir "_pre_restore_safety_$timeTag"
$extractStagingDir = Join-Path $env:TEMP "ai_work_restore_stage_$timeTag"

try {
    Write-Host "[RESTORE] Creating safety snapshot of current data..."
    if (Test-Path $sourceDir) {
        Copy-Item -Path $sourceDir -Destination $safetyBackupDir -Recurse -Force
    }

    Write-Host "[RESTORE] Extracting backup to staging environment..."
    if (Test-Path $extractStagingDir) { Remove-Item -Path $extractStagingDir -Recurse -Force | Out-Null }
    New-Item -Path $extractStagingDir -ItemType Directory -Force | Out-Null

    [System.IO.Compression.ZipFile]::ExtractToDirectory($selectedZip.FullName, $extractStagingDir, [System.Text.Encoding]::UTF8)

    # Validate extracted data
    $extractedFiles = Get-ChildItem -Path $extractStagingDir -Recurse -File
    if ($extractedFiles.Count -eq 0) {
        throw "Extracted archive contains no files."
    }

    Write-Host "[RESTORE] Applying restored files to $sourceDir..."
    if (Test-Path $sourceDir) {
        Remove-Item -Path "$sourceDir\*" -Recurse -Force
    } else {
        New-Item -Path $sourceDir -ItemType Directory -Force | Out-Null
    }

    Copy-Item -Path "$extractStagingDir\*" -Destination $sourceDir -Recurse -Force

    # Clean up staging
    Remove-Item -Path $extractStagingDir -Recurse -Force -ErrorAction SilentlyContinue

    Write-RestoreLog "SUCCESS: Restored data from $($selectedZip.Name) to $sourceDir ($($extractedFiles.Count) files)."
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Green
    Write-Host " RESTORE COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host " Safety copy preserved at: $safetyBackupDir"
    Write-Host " Please refresh your browser (Ctrl+F5) to view restored screens."
    Write-Host "==================================================================" -ForegroundColor Green
    exit 0

} catch {
    Write-RestoreLog "ERROR: Restore failed: $_ - Initiating automatic rollback..."
    if (Test-Path $safetyBackupDir) {
        try {
            if (-not (Test-Path $sourceDir)) { New-Item -Path $sourceDir -ItemType Directory -Force | Out-Null }
            Copy-Item -Path "$safetyBackupDir\*" -Destination $sourceDir -Recurse -Force
            Write-RestoreLog "ROLLBACK SUCCESS: Restored original state from safety backup."
        } catch {
            Write-RestoreLog "CRITICAL: Rollback failed: $_. Manual recovery required from $safetyBackupDir"
        }
    }
    if (Test-Path $extractStagingDir) {
        Remove-Item -Path $extractStagingDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    exit 1
}
