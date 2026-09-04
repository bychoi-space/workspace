$rootDir = Split-Path $PSScriptRoot -Parent
$uiLibDir = Join-Path $rootDir 'assets\ui_library'
$outputFile = Join-Path $rootDir 'assets\ui_library_fallback.js'

$filesToCompile = @(
    @{ name = 'atomic_cards.html'; variable = 'window.VCTRL_UI_FALLBACK_ATOMIC' },
    @{ name = 'icon_cards.html'; variable = 'window.VCTRL_UI_FALLBACK_ICON' },
    @{ name = 'inspector_panels.html'; variable = 'window.VCTRL_UI_FALLBACK_INSPECTOR' },
    @{ name = 'modals.html'; variable = 'window.VCTRL_UI_FALLBACK_MODALS' }
)

Write-Host '[BUILD UI FALLBACK] Starting build via PowerShell...'

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('/**')
[void]$sb.AppendLine(' * ui_library_fallback.js')
[void]$sb.AppendLine(' * Fallback data for offline file:// protocol execution.')
[void]$sb.AppendLine(' * Auto-generated.')
[void]$sb.AppendLine(' */')
[void]$sb.AppendLine('')

$backtickChar = [char]96
$dollarChar = [char]36
$backslashChar = [char]92

foreach ($f in $filesToCompile) {
    $srcPath = Join-Path $uiLibDir $f.name
    if (-not (Test-Path $srcPath)) {
        Write-Error "[BUILD UI FALLBACK] Error: Source file not found at $srcPath"
        exit 1
    }

    $rawContent = [System.IO.File]::ReadAllText($srcPath, [System.Text.Encoding]::UTF8)

    # Escape backslashes, backticks, and dollar braces for template literal
    $escaped = $rawContent.Replace("$backslashChar", "$backslashChar$backslashChar")
    $escaped = $escaped.Replace("$backtickChar", "$backslashChar$backtickChar")
    $escaped = $escaped.Replace("${dollarChar}{", "$backslashChar${dollarChar}{")

    [void]$sb.AppendLine($f.variable + " = " + $backtickChar)
    [void]$sb.AppendLine($escaped)
    [void]$sb.AppendLine($backtickChar + ";`n")

    Write-Host "[BUILD UI FALLBACK] Compiled $($f.name) into $($f.variable)"
}

[System.IO.File]::WriteAllText($outputFile, $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "[BUILD UI FALLBACK] Success! Wrote output to $outputFile"
