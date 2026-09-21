# ==============================================================================
# setup_daily_schedule.ps1 - Windows Task Scheduler Daily Backup Manager
# ==============================================================================
[CmdletBinding()]
param (
    [ValidateSet("install", "uninstall", "status")]
    [string]$Action = "install",
    [string]$ConfigFile = "$PSScriptRoot\..\backup_config.json"
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$taskName = "AiWork_Daily_Project_Backup"
$scriptPath = (Resolve-Path "$PSScriptRoot\daily_auto_backup.ps1").Path
$timeStr = "18:00"
$catchUp = $true

if (Test-Path $ConfigFile) {
    try {
        $cfg = [System.IO.File]::ReadAllText($ConfigFile, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
        if ($cfg.scheduledTime) { $timeStr = $cfg.scheduledTime }
        if ($null -ne $cfg.missedTaskCatchUp) { $catchUp = [bool]$cfg.missedTaskCatchUp }
    } catch {
        Write-Warning "[SCHEDULE] Config reading failed, using defaults: $_"
    }
}

switch ($Action.ToLower()) {
    "uninstall" {
        Write-Host "[SCHEDULE] Unregistering scheduled task: $taskName..."
        try {
            Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction Stop
            Write-Host "[SCHEDULE] SUCCESS: Task '$taskName' has been removed." -ForegroundColor Green
        } catch {
            Write-Warning "[SCHEDULE] Task '$taskName' not found or could not be removed: $_"
        }
    }

    "status" {
        try {
            $t = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
            Write-Host "=========================================="
            Write-Host " Task Name     : $($t.TaskName)"
            Write-Host " State         : $($t.State)"
            Write-Host " Next Run Time : $((Get-ScheduledTaskInfo -TaskName $taskName).NextRunTime)"
            Write-Host " Last Run Time : $((Get-ScheduledTaskInfo -TaskName $taskName).LastRunTime)"
            Write-Host " Last Result   : $((Get-ScheduledTaskInfo -TaskName $taskName).LastTaskResult)"
            Write-Host "=========================================="
        } catch {
            Write-Host "[SCHEDULE] Task '$taskName' is NOT registered." -ForegroundColor Yellow
        }
    }

    "install" {
        Write-Host "[SCHEDULE] Registering task '$taskName' to run daily at $timeStr..."
        try {
            # Action: Run PowerShell silently in background
            $argList = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""
            $taskAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $argList

            # Trigger: Daily at specified time
            $parsedTime = [DateTime]::ParseExact($timeStr, "HH:mm", [System.Globalization.CultureInfo]::InvariantCulture)
            $taskTrigger = New-ScheduledTaskTrigger -Daily -At $parsedTime

            # Settings: Run on battery, wake if needed, catch up if missed
            $taskSettings = New-ScheduledTaskSettingsSet `
                -AllowStartIfOnBatteries `
                -DontStopIfGoingOnBatteries `
                -StartWhenAvailable:$catchUp `
                -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

            # Register as current interactive user
            Register-ScheduledTask `
                -TaskName $taskName `
                -Action $taskAction `
                -Trigger $taskTrigger `
                -Settings $taskSettings `
                -Description "Workspace Editor Daily Automatic Backup (Runs daily at $timeStr, catch-up on boot)" `
                -Force | Out-Null

            Write-Host "[SCHEDULE] SUCCESS: Task '$taskName' registered successfully!" -ForegroundColor Green
            Write-Host "[SCHEDULE] Daily Time : $timeStr"
            Write-Host "[SCHEDULE] Catch-Up    : $catchUp (Executes on next boot if missed)"
            Write-Host "[SCHEDULE] Target     : $scriptPath"

            $info = Get-ScheduledTaskInfo -TaskName $taskName -ErrorAction SilentlyContinue
            if ($info) {
                Write-Host "[SCHEDULE] Next Run    : $($info.NextRunTime)"
            }
        } catch {
            Write-Error "[SCHEDULE] FAILED to register scheduled task: $_"
            exit 1
        }
    }
}
