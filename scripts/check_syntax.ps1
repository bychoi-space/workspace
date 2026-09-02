$files = @(
    "c:\Users\sisun\ai_work\assets\vctrl_responsive_multiselect.js",
    "c:\Users\sisun\ai_work\assets\vctrl_responsive_pins.js",
    "c:\Users\sisun\ai_work\assets\vctrl_shortcuts.js",
    "c:\Users\sisun\ai_work\assets\vctrl_core.js",
    "c:\Users\sisun\ai_work\assets\vctrl_inspector.js",
    "c:\Users\sisun\ai_work\assets\vctrl_v3.js",
    "c:\Users\sisun\ai_work\assets\vctrl_iframe_drag.js",
    "c:\Users\sisun\ai_work\assets\vctrl_iframe_script.js",
    "c:\Users\sisun\ai_work\assets\vctrl_text_measurer.js",
    "c:\Users\sisun\ai_work\assets\vctrl_iframe_styles.js",
    "c:\Users\sisun\ai_work\assets\responsive_frame.js",
    "c:\Users\sisun\ai_work\viewer.html"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $txt = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
        $round = 0
        $curly = 0
        $square = 0
        $backtick = 0
        for ($i = 0; $i -lt $txt.Length; $i++) {
            $c = $txt[$i]
            if ($c -eq '(') { $round++ }
            elseif ($c -eq ')') { $round-- }
            elseif ($c -eq '{') { $curly++ }
            elseif ($c -eq '}') { $curly-- }
            elseif ($c -eq '[') { $square++ }
            elseif ($c -eq ']') { $square-- }
            elseif ($c -eq '`') { $backtick++ }
        }
        $name = [System.IO.Path]::GetFileName($f)
        Write-Host "$name -> Round: $round, Curly: $curly, Square: $square, Backtick: $backtick"
    }
}
