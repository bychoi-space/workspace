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
$allFiles = Get-ChildItem -Path "assets", "data" -Include "*.js", "*.css", "*.html", "*.json" -Recurse
foreach ($f in $allFiles) {
    $raw = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    if ($raw.Contains([string][char]0xFFFD)) {
        Write-Host "[WARNING] Potential broken encoding (replacement char) in: $($f.FullName)" -ForegroundColor Yellow
    }
}

Write-Host "`n=== 3. JS V8 Syntax & Bracket Validation ==="
$jsFiles = Get-ChildItem -Path "assets", "enhanced_v4" -Filter "*.js" -Recurse
$hasNode = $null -ne (Get-Command node -ErrorAction SilentlyContinue)

foreach ($jf in $jsFiles) {
    $name = $jf.Name
    $path = $jf.FullName
    $v8Ok = $false
    
    if ($hasNode) {
        $nodeCheck = & node --check "$path" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $v8Ok = $true
            Write-Host "[V8 OK] $name -> Clean Syntax" -ForegroundColor Green
        } else {
            Write-Host "[V8 ERROR] $name -> $nodeCheck" -ForegroundColor Red
            continue
        }
    }

    # Lexer-based bracket check (aware of comments, quotes, backticks, and regex literals)
    $code = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $len = $code.Length
    $i = 0
    $round = 0
    $curly = 0
    $square = 0
    $templateDepth = 0
    $inSingle = $false
    $inDouble = $false
    $inTemplate = $false
    $inLineComment = $false
    $inBlockComment = $false

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
        if ($inSingle) {
            if ($c -eq '\') { $i += 2; continue }
            if ($c -eq "'") { $inSingle = $false }
            $i++; continue
        }
        if ($inDouble) {
            if ($c -eq '\') { $i += 2; continue }
            if ($c -eq '"') { $inDouble = $false }
            $i++; continue
        }
        if ($inTemplate) {
            if ($c -eq '\') { $i += 2; continue }
            if ($c -eq '$' -and $next -eq '{') {
                # Expression inside template literal
                $curly++
                $templateDepth++
                $inTemplate = $false
                $i += 2
                continue
            }
            if ($c -eq '`') { $inTemplate = $false }
            $i++; continue
        }

        # Comments
        if ($c -eq '/' -and $next -eq '/') { $inLineComment = $true; $i += 2; continue }
        if ($c -eq '/' -and $next -eq '*') { $inBlockComment = $true; $i += 2; continue }

        # Regex literal detection: '/' after punctuation / operator / return / etc.
        if ($c -eq '/') {
            $prevText = if ($i -gt 0) { $code.Substring(0, $i).TrimEnd() } else { '' }
            $prevChar = if ($prevText.Length -gt 0) { $prevText[$prevText.Length - 1] } else { '' }
            if ($prevChar -match '[(=,;:!?+*&|^%~{\[\]\n\r]' -or $prevText -match '\b(return|case|delete|typeof|void|yield)$') {
                # Skip regex literal until unescaped '/'
                $i++
                while ($i -lt $len) {
                    $rc = $code[$i]
                    if ($rc -eq '\') { $i += 2; continue }
                    if ($rc -eq '[') {
                        # Character class inside regex
                        $i++
                        while ($i -lt $len -and $code[$i] -ne ']') {
                            if ($code[$i] -eq '\') { $i += 2 } else { $i++ }
                        }
                    }
                    if ($rc -eq '/') { $i++; break }
                    $i++
                }
                # Skip regex flags (e.g. gimsuy)
                while ($i -lt $len -and $code[$i] -match '[a-z]') { $i++ }
                continue
            }
        }

        # Quotes & template
        if ($c -eq "'") { $inSingle = $true; $i++; continue }
        if ($c -eq '"') { $inDouble = $true; $i++; continue }
        if ($c -eq '`') { $inTemplate = $true; $i++; continue }

        # Brackets
        if ($c -eq '(') { $round++ }
        elseif ($c -eq ')') { $round-- }
        elseif ($c -eq '{') { $curly++ }
        elseif ($c -eq '}') {
            $curly--
            if ($templateDepth -gt 0 -and $curly -lt $templateDepth) {
                $templateDepth--
                $inTemplate = $true
            }
        }
        elseif ($c -eq '[') { $square++ }
        elseif ($c -eq ']') { $square-- }

        $i++
    }

    if (!$hasNode) {
        if ($round -ne 0 -or $curly -ne 0 -or $square -ne 0) {
            Write-Host "[BRACKET MISMATCH] $name -> Round: $round, Curly: $curly, Square: $square" -ForegroundColor Yellow
        } else {
            Write-Host "[OK] $name -> Perfect Balance () {} []" -ForegroundColor Green
        }
    }
}
