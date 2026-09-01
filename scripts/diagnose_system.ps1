$ErrorActionPreference = "Continue"

Write-Host "=== 1. JSON Data Validation ==="
$jsonFiles = Get-ChildItem -Path "data" -Filter "*.json" -Recurse
foreach ($jf in $jsonFiles) {
    try {
        $raw = [System.IO.File]::ReadAllText($jf.FullName, [System.Text.Encoding]::UTF8)
        $parsed = ConvertFrom-Json $raw
        Write-Host "[OK] JSON: $($jf.FullName)"
    } catch {
        Write-Host "[ERROR] Invalid JSON: $($jf.FullName) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== 2. Encoding / Broken Characters Check ==="
$allFiles = Get-ChildItem -Path "assets", "enhanced_v4", "data" -Include "*.js", "*.css", "*.html", "*.json" -Recurse
foreach ($f in $allFiles) {
    $raw = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    if ($raw.Contains("")) {
        Write-Host "[WARNING] Potential broken encoding (replacement char) in: $($f.FullName)" -ForegroundColor Yellow
    }
}

Write-Host "`n=== 3. JS Bracket Balance (String/Comment-Aware) ==="
function Test-JsBrackets($path) {
    $code = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $len = $code.Length
    $i = 0
    $round = 0
    $curly = 0
    $square = 0
    $inSingleQuote = $false
    $inDoubleQuote = $false
    $inTemplate = $false
    $inLineComment = $false
    $inBlockComment = $false
    $inRegex = $false

    while ($i -lt $len) {
        $c = $code[$i]
        $next = if ($i + 1 -lt $len) { $code[$i + 1] } else { '' }

        if ($inLineComment) {
            if ($c -eq "`n") { $inLineComment = $false }
            $i++; continue
        }
        if ($inBlockComment) {
            if ($c -eq '*' -and $next -eq '/') { $inBlockComment = $false; $i += 2; continue }
            $i++; continue
        }
        if ($inSingleQuote) {
            if ($c -eq '\') { $i += 2; continue }
            if ($c -eq "'") { $inSingleQuote = $false }
            $i++; continue
        }
        if ($inDoubleQuote) {
            if ($c -eq '\') { $i += 2; continue }
            if ($c -eq '"') { $inDoubleQuote = $false }
            $i++; continue
        }
        if ($inTemplate) {
            if ($c -eq '\') { $i += 2; continue }
            if ($c -eq '`') { $inTemplate = $false }
            $i++; continue
        }

        # Check comment start
        if ($c -eq '/' -and $next -eq '/') {
            $inLineComment = $true; $i += 2; continue
        }
        if ($c -eq '/' -and $next -eq '*') {
            $inBlockComment = $true; $i += 2; continue
        }
        if ($c -eq "'") { $inSingleQuote = $true; $i++; continue }
        if ($c -eq '"') { $inDoubleQuote = $true; $i++; continue }
        if ($c -eq '`') { $inTemplate = $true; $i++; continue }

        if ($c -eq '(') { $round++ }
        elseif ($c -eq ')') { $round-- }
        elseif ($c -eq '{') { $curly++ }
        elseif ($c -eq '}') { $curly-- }
        elseif ($c -eq '[') { $square++ }
        elseif ($c -eq ']') { $square-- }

        if ($round -lt 0 -or $curly -lt 0 -or $square -lt 0) {
            # Write-Host "Negative balance at index $i in $path"
        }
        $i++
    }

    $name = [System.IO.Path]::GetFileName($path)
    if ($round -ne 0 -or $curly -ne 0 -or $square -ne 0) {
        Write-Host "[BRACKET MISMATCH] $name -> Round: $round, Curly: $curly, Square: $square" -ForegroundColor Red
    } else {
        Write-Host "[OK] $name -> Perfect Balance () {} []" -ForegroundColor Green
    }
}

$jsFiles = Get-ChildItem -Path "assets", "enhanced_v4" -Filter "*.js" -Recurse
foreach ($jf in $jsFiles) {
    Test-JsBrackets $jf.FullName
}
