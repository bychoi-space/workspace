Add-Type -AssemblyName System.Drawing

function Convert-3DToTransparentPng {
    param(
        [Parameter(Mandatory=$true)][string]$srcPath,
        [Parameter(Mandatory=$true)][string]$dstPath,
        [int]$threshold = 240,
        [int]$softEdge = 215
    )

    if (-not (Test-Path $srcPath)) {
        Write-Error "Source file not found: $srcPath"
        return
    }

    $srcImg = [System.Drawing.Bitmap]::FromFile($srcPath)
    $w = $srcImg.Width
    $h = $srcImg.Height

    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($srcImg, 0, 0, $w, $h)
    $g.Dispose()
    $srcImg.Dispose()

    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $bmpData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $stride = [Math]::Abs($bmpData.Stride)
    $bytes = New-Object byte[] ($stride * $h)
    [System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $bytes, 0, $bytes.Length)

    # Sample corner background color
    $cornerOffset = 0
    $bgB = $bytes[$cornerOffset]
    $bgG = $bytes[$cornerOffset + 1]
    $bgR = $bytes[$cornerOffset + 2]

    $visited = New-Object bool[] ($w * $h)
    $queue = New-Object System.Collections.Generic.Queue[int]

    # Seed all edges
    for ($x = 0; $x -lt $w; $x++) {
        $topIdx = $x
        $visited[$topIdx] = $true
        $queue.Enqueue($topIdx)

        $botIdx = ($h - 1) * $w + $x
        $visited[$botIdx] = $true
        $queue.Enqueue($botIdx)
    }
    for ($y = 0; $y -lt $h; $y++) {
        $leftIdx = $y * $w
        if (-not $visited[$leftIdx]) {
            $visited[$leftIdx] = $true
            $queue.Enqueue($leftIdx)
        }
        $rightIdx = $y * $w + ($w - 1)
        if (-not $visited[$rightIdx]) {
            $visited[$rightIdx] = $true
            $queue.Enqueue($rightIdx)
        }
    }

    while ($queue.Count -gt 0) {
        $curr = $queue.Dequeue()
        $cx = $curr % $w
        $cy = [Math]::Floor($curr / $w)
        $offset = $cy * $stride + ($cx * 4)

        $b = $bytes[$offset]
        $gVal = $bytes[$offset + 1]
        $r = $bytes[$offset + 2]

        $diff = [Math]::Sqrt([Math]::Pow($r - $bgR, 2) + [Math]::Pow($gVal - $bgG, 2) + [Math]::Pow($b - $bgB, 2))
        $brightness = ($r + $gVal + $b) / 3.0

        if ($brightness -ge $threshold -or $diff -le 12) {
            # Fully transparent
            $bytes[$offset + 3] = 0

            # 4-way neighbors
            if ($cx + 1 -lt $w) {
                $n = $curr + 1
                if (-not $visited[$n]) { $visited[$n] = $true; $queue.Enqueue($n) }
            }
            if ($cx - 1 -ge 0) {
                $n = $curr - 1
                if (-not $visited[$n]) { $visited[$n] = $true; $queue.Enqueue($n) }
            }
            if ($cy + 1 -lt $h) {
                $n = $curr + $w
                if (-not $visited[$n]) { $visited[$n] = $true; $queue.Enqueue($n) }
            }
            if ($cy - 1 -ge 0) {
                $n = $curr - $w
                if (-not $visited[$n]) { $visited[$n] = $true; $queue.Enqueue($n) }
            }
        } elseif ($brightness -ge $softEdge) {
            # Soft shadow edge
            $ratio = ($brightness - $softEdge) / ($threshold - $softEdge)
            $alpha = [byte][Math]::Max(0, [Math]::Min(255, [Math]::Round((1.0 - $ratio) * 255)))
            $bytes[$offset + 3] = $alpha
        }
    }

    [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $bmpData.Scan0, $bytes.Length)
    $bmp.UnlockBits($bmpData)

    $bmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()

    Write-Host "Created transparent 3D PNG: $dstPath"
}

Convert-3DToTransparentPng -srcPath "C:\Users\sisun\.gemini\antigravity-ide\brain\7ff22387-4c41-4562-8efa-83f26d456a2c\admin_3d_pim_raw_1789973751032.jpg" -dstPath "c:\Users\sisun\ai_work\assets\illustrations\admin_3d_pim.png" -threshold 248 -softEdge 220
Convert-3DToTransparentPng -srcPath "C:\Users\sisun\.gemini\antigravity-ide\brain\7ff22387-4c41-4562-8efa-83f26d456a2c\admin_3d_cms_raw_1789973981208.jpg" -dstPath "c:\Users\sisun\ai_work\assets\illustrations\admin_3d_cms.png" -threshold 248 -softEdge 220
Convert-3DToTransparentPng -srcPath "C:\Users\sisun\.gemini\antigravity-ide\brain\7ff22387-4c41-4562-8efa-83f26d456a2c\admin_3d_logistics_raw_1789974294769.jpg" -dstPath "c:\Users\sisun\ai_work\assets\illustrations\admin_3d_logistics.png" -threshold 240 -softEdge 215
