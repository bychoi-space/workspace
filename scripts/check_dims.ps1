Add-Type -AssemblyName System.Drawing
$files = @('mi_short_logo.png', 'ebm_short_logo.png', 'it_short_logo.png')
foreach ($f in $files) {
    $fullPath = Join-Path (Split-Path $PSScriptRoot -Parent) ('assets\' + $f)
    $img = [System.Drawing.Image]::FromFile($fullPath)
    Write-Host "$f : $($img.Width) x $($img.Height)"
    $img.Dispose()
}
