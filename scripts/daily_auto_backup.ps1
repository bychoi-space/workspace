# ==============================================================================
# daily_auto_backup.ps1 - Workspace Editor Project & Screen Daily Backup Engine
# ==============================================================================
[CmdletBinding()]
param (
    [string]$ConfigFile = "$PSScriptRoot\..\backup_config.json"
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"
$sw = [System.Diagnostics.Stopwatch]::StartNew()

# 1. Load configuration
$rootDir = (Resolve-Path "$PSScriptRoot\..").Path
$sourceDir = Join-Path $rootDir "data"
$backupBaseDir = "C:\ai_work_backups\daily"
$retentionDays = 30
$minRetentionCount = 5
$enableToast = $true

if (Test-Path $ConfigFile) {
    try {
        $cfgContent = [System.IO.File]::ReadAllText($ConfigFile, [System.Text.Encoding]::UTF8)
        $cfgJson = ConvertFrom-Json $cfgContent
        if ($cfgJson.sourcePath) { $sourceDir = $cfgJson.sourcePath }
        if ($cfgJson.backupDirectory) { $backupBaseDir = $cfgJson.backupDirectory }
        if ($cfgJson.retentionDays) { $retentionDays = [int]$cfgJson.retentionDays }
        if ($cfgJson.minRetentionCount) { $minRetentionCount = [int]$cfgJson.minRetentionCount }
        if ($null -ne $cfgJson.showToastNotification) { $enableToast = [bool]$cfgJson.showToastNotification }
    } catch {
        Write-Warning "[BACKUP] Config load failed: $_"
    }
}

$logsDir = Join-Path $rootDir "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -Path $logsDir -ItemType Directory -Force | Out-Null
}
$logFile = Join-Path $logsDir "backup_history.log"

function Write-BackupLog([string]$msg) {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $logLine = "[$timestamp] $msg"
    Write-Host $logLine
    [System.IO.File]::AppendAllText($logFile, "$logLine`r`n", [System.Text.Encoding]::UTF8)
}

function Show-WindowsToast([string]$title, [string]$message) {
    if (-not $enableToast) { return }
    try {
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
        $template = "<toast><visual><binding template='ToastGeneric'><text>$title</text><text>$message</text></binding></visual></toast>"
        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml.LoadXml($template)
        $toast = New-Object Windows.UI.Notifications.ToastNotification $xml
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Workspace Editor Backup").Show($toast)
    } catch {
        # Toast failure should never block or fail the backup process
    }
}

try {
    # 2. Source validation
    if (-not (Test-Path $sourceDir)) {
        throw "Source directory not found: $sourceDir"
    }

    $rawFiles = Get-ChildItem -Path $sourceDir -Recurse -File
    $sourceFileCount = $rawFiles.Count
    if ($sourceFileCount -eq 0) {
        throw "Source directory is empty: $sourceDir"
    }

    $projectDirs = Get-ChildItem -Path $sourceDir -Directory
    $projectCount = $projectDirs.Count
    $screenFiles = $rawFiles | Where-Object { $_.Extension -eq ".html" }
    $screenCount = $screenFiles.Count

    # 3. Prepare backup destination
    if (-not (Test-Path $backupBaseDir)) {
        New-Item -Path $backupBaseDir -ItemType Directory -Force | Out-Null
    }

    $timeTag = (Get-Date).ToString("yyyyMMdd_HHmmss")
    $zipFileName = "data_daily_$timeTag.zip"
    $zipFilePath = Join-Path $backupBaseDir $zipFileName
    $stagingDir = Join-Path $env:TEMP "ai_work_backup_stage_$timeTag"

    # 4. Safe copy with FileShare.ReadWrite to avoid file locking conflicts
    if (Test-Path $stagingDir) { Remove-Item -Path $stagingDir -Recurse -Force | Out-Null }
    New-Item -Path $stagingDir -ItemType Directory -Force | Out-Null

    foreach ($file in $rawFiles) {
        $relativePath = $file.FullName.Substring($sourceDir.Length).TrimStart('\', '/')
        $destPath = Join-Path $stagingDir $relativePath
        $destParent = [System.IO.Path]::GetDirectoryName($destPath)
        if (-not (Test-Path $destParent)) {
            New-Item -Path $destParent -ItemType Directory -Force | Out-Null
        }

        $inStream = [System.IO.File]::Open($file.FullName, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
        $outStream = [System.IO.File]::Create($destPath)
        try {
            $inStream.CopyTo($outStream)
        } finally {
            $outStream.Dispose()
            $inStream.Dispose()
        }
    }

    # 5. Fast ZIP compression with explicit UTF-8 encoding
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory(
        $stagingDir,
        $zipFilePath,
        [System.IO.Compression.CompressionLevel]::Optimal,
        $false,
        [System.Text.Encoding]::UTF8
    )

    # 6. Self-Verification
    if (-not (Test-Path $zipFilePath)) {
        throw "Failed to create backup ZIP archive."
    }
    $zipFileInfo = Get-Item $zipFilePath
    if ($zipFileInfo.Length -eq 0) {
        throw "Generated backup ZIP archive is 0 bytes (corrupted)."
    }

    $zipArchive = [System.IO.Compression.ZipFile]::OpenRead($zipFilePath)
    $entryCount = $zipArchive.Entries.Count
    $hasGlobalComp = $false
    $metaCount = 0
    foreach ($entry in $zipArchive.Entries) {
        if ($entry.Name -eq "global_components.json") { $hasGlobalComp = $true }
        if ($entry.Name -eq "metadata.json") { $metaCount++ }
    }
    $zipArchive.Dispose()

    if ($entryCount -lt $sourceFileCount) {
        throw "Self-validation failed: ZIP entries ($entryCount) less than source files ($sourceFileCount)."
    }
    if ($metaCount -lt $projectCount) {
        Write-Warning "Self-validation warning: Metadata count ($metaCount) less than project count ($projectCount)."
    }

    # Clean staging directory
    Remove-Item -Path $stagingDir -Recurse -Force -ErrorAction SilentlyContinue

    # 7. Safe retention policy (Keep at least $minRetentionCount backups)
    $existingBackups = Get-ChildItem -Path $backupBaseDir -Filter "data_daily_*.zip" | Sort-Object CreationTime -Descending
    if ($existingBackups.Count -gt $minRetentionCount) {
        $thresholdDate = (Get-Date).AddDays(-$retentionDays)
        $candidates = $existingBackups | Select-Object -Skip $minRetentionCount
        foreach ($oldZip in $candidates) {
            if ($oldZip.CreationTime -lt $thresholdDate) {
                Write-BackupLog "[ROTATION] Removing expired backup: $($oldZip.Name) (Created: $($oldZip.CreationTime.ToString('yyyy-MM-dd')))"
                Remove-Item -Path $oldZip.FullName -Force -ErrorAction SilentlyContinue
            }
        }
    }

    # 8. Report and logging
    $sw.Stop()
    $sizeMB = [Math]::Round($zipFileInfo.Length / 1MB, 2)
    $elapsedSec = [Math]::Round($sw.Elapsed.TotalSeconds, 2)
    $successMsg = "SUCCESS: Backup complete. $projectCount Projects, $screenCount Screens ($entryCount files, $sizeMB MB) in ${elapsedSec}s. Destination: $zipFilePath"
    Write-BackupLog $successMsg
    Show-WindowsToast "Workspace Editor Backup" "Backup complete: $projectCount Projects, $screenCount Screens (${sizeMB} MB)"
    exit 0

} catch {
    $sw.Stop()
    $errMsg = "ERROR: Backup failed after $([Math]::Round($sw.Elapsed.TotalSeconds, 2))s - $_"
    Write-BackupLog $errMsg
    Show-WindowsToast "Workspace Editor Backup Warning" "Backup failed: $_"
    if ($stagingDir -and (Test-Path $stagingDir)) {
        Remove-Item -Path $stagingDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    exit 1
}
