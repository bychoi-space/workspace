Add-Type -AssemblyName System.Drawing

function Draw-RoundRect($g, $brush, $x, $y, $w, $h, $r) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    $g.FillPath($brush, $path)
    $path.Dispose()
}

function Render-Icon([int]$size, [string]$outputPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Deep Dark Background
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#0f1117"))
    $g.FillRectangle($bgBrush, 0, 0, $size, $size)
    $bgBrush.Dispose()

    # Scale logo dimensions (center slightly inside maskable safe zone)
    $safeScale = 0.85
    $scale = ($size / 100.0) * $safeScale
    $offsetX = ($size * (1.0 - $safeScale)) / 2.0
    $offsetY = ($size * (1.0 - $safeScale)) / 2.0

    # Layer 1
    $b1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 99, 102, 241))
    Draw-RoundRect $g $b1 ($offsetX + 15 * $scale) ($offsetY + 22 * $scale) (55 * $scale) (14 * $scale) (7 * $scale)
    $b1.Dispose()

    # Layer 2
    $b2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb([int](255 * 0.7), 99, 102, 241))
    Draw-RoundRect $g $b2 ($offsetX + 25 * $scale) ($offsetY + 43 * $scale) (55 * $scale) (14 * $scale) (7 * $scale)
    $b2.Dispose()

    # Layer 3
    $b3 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb([int](255 * 0.4), 99, 102, 241))
    Draw-RoundRect $g $b3 ($offsetX + 35 * $scale) ($offsetY + 64 * $scale) (55 * $scale) (14 * $scale) (7 * $scale)
    $b3.Dispose()

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "Successfully generated: $outputPath ($size x $size)"
}

$baseDir = Split-Path -Parent $PSScriptRoot
$assetsDir = Join-Path $baseDir "assets"

Render-Icon 192 (Join-Path $assetsDir "icon-192.png")
Render-Icon 512 (Join-Path $assetsDir "icon-512.png")
