Add-Type -AssemblyName System.Drawing
$assetsDir = Join-Path (Split-Path $PSScriptRoot -Parent) 'assets'

function Trace-ImageToSvg($name) {
    $pngPath = Join-Path $assetsDir ($name + '.png')
    $img = [System.Drawing.Image]::FromFile($pngPath)
    $bmp = New-Object System.Drawing.Bitmap $img
    $w = $bmp.Width
    $h = $bmp.Height

    # Create boolean grid
    $grid = New-Object 'bool[,]' $w, $h
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $c = $bmp.GetPixel($x, $y)
            # alpha threshold
            $grid[$x, $y] = ($c.A -ge 120 -and $c.R -lt 140)
        }
    }

    # Generate SVG with pixel rects combined or paths
    # Better: Potrace-like boundary segments or horizontal run rectangles
    # Horizontal spans:
    $paths = New-Object System.Collections.ArrayList
    for ($y = 0; $y -lt $h; $y++) {
        $startX = -1
        for ($x = 0; $x -lt $w; $x++) {
            if ($grid[$x, $y]) {
                if ($startX -eq -1) { $startX = $x }
            } else {
                if ($startX -ne -1) {
                    $len = $x - $startX
                    [void]$paths.Add("M$startX,${y}h${len}v1h-${len}z")
                    $startX = -1
                }
            }
        }
        if ($startX -ne -1) {
            $len = $w - $startX
            [void]$paths.Add("M$startX,${y}h${len}v1h-${len}z")
        }
    }
    
    $svgData = $paths -join " "
    $svgOut = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 $w $h' fill='currentColor'><path d='$svgData'/></svg>"
    
    $outPath = Join-Path $assetsDir ($name + '.svg')
    [System.IO.File]::WriteAllText($outPath, $svgOut)
    Write-Host "Generated $outPath with $($paths.Count) spans"

    $bmp.Dispose()
    $img.Dispose()
}

Trace-ImageToSvg 'mi_short_logo'
Trace-ImageToSvg 'ebm_short_logo'
Trace-ImageToSvg 'it_short_logo'
