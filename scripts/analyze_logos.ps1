Add-Type -AssemblyName System.Drawing
$assetsDir = Join-Path (Split-Path $PSScriptRoot -Parent) 'assets'

foreach ($name in @('mi_short_logo', 'ebm_short_logo', 'it_short_logo')) {
    $img = [System.Drawing.Image]::FromFile((Join-Path $assetsDir ($name + '.png')))
    $bmp = New-Object System.Drawing.Bitmap $img
    Write-Host "=== $name (64x64) ==="
    # Print downsampled 32x32 or 64x64 ascii
    for ($y = 0; $y -lt 64; $y += 2) {
        $line = ""
        for ($x = 0; $x -lt 64; $x += 1) {
            $c = $bmp.GetPixel($x, $y)
            if ($c.A -gt 128 -and $c.R -lt 128) {
                $line += "#"
            } else {
                $line += " "
            }
        }
        Write-Host $line
    }
    $bmp.Dispose()
    $img.Dispose()
}
