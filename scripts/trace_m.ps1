Add-Type -AssemblyName System.Drawing
$assetsDir = Join-Path (Split-Path $PSScriptRoot -Parent) 'assets'
$img = [System.Drawing.Image]::FromFile((Join-Path $assetsDir 'mi_short_logo.png'))
$bmp = New-Object System.Drawing.Bitmap $img

Write-Host "mi_short_logo bounds:"
$minX = 64; $maxX = 0; $minY = 64; $maxY = 0
for ($y = 0; $y -lt 64; $y++) {
    for ($x = 0; $x -lt 64; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -gt 100 -and $c.R -lt 128) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Host "X: $minX to $maxX, Y: $minY to $maxY"
for ($y = $minY; $y -le $maxY; $y += 2) {
    $row = ""
    for ($x = $minX; $x -le $maxX; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -gt 100 -and $c.R -lt 128) { $row += "#" } else { $row += "." }
    }
    Write-Host ("{0,2}: {1}" -f $y, $row)
}
$bmp.Dispose()
$img.Dispose()
