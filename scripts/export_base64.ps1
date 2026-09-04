$assetsDir = Join-Path (Split-Path $PSScriptRoot -Parent) 'assets'
$m = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $assetsDir 'mi_short_logo.png')))
$e = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $assetsDir 'ebm_short_logo.png')))
$it = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $assetsDir 'it_short_logo.png')))

$obj = @{
    michaa = "data:image/png;base64,$m"
    ebm = "data:image/png;base64,$e"
    itmichaa = "data:image/png;base64,$it"
}

$jsonPath = Join-Path $assetsDir 'logos_base64.json'
$obj | ConvertTo-Json | Set-Content -Path $jsonPath -Encoding UTF8
Write-Host "Wrote base64 logos to $jsonPath"
