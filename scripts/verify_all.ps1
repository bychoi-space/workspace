$ErrorActionPreference = "Continue"

Write-Host "=== Edge Headless Syntax Check for All JS Files ==="
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) {
    $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
}

# Create a test harness HTML that imports every JS file and reports errors
$testHarnessPath = "c:\Users\sisun\ai_work\scripts\syntax_test.html"
$jsFiles = @(
    "assets/vctrl_typography.js",
    "assets/ui_library_fallback.js",
    "assets/vctrl_ui_library.js",
    "assets/templates.js",
    "assets/app.js",
    "assets/vctrl_undo.js",
    "assets/vctrl_text_measurer.js",
    "assets/vctrl_ui_atoms.js",
    "assets/vctrl_design_system.js",
    "assets/vctrl_shortcuts.js",
    "assets/vctrl_common.js",
    "assets/vctrl_object_text.js",
    "assets/vctrl_object_shape.js",
    "assets/vctrl_object_table.js",
    "assets/vctrl_object_connector.js",
    "assets/responsive_frame.js",
    "assets/vctrl_iframe_styles.js",
    "assets/vctrl_iframe_script.js",
    "assets/vctrl_iframe_grid.js",
    "assets/vctrl_iframe_accordion.js",
    "assets/vctrl_iframe_drag.js",
    "assets/vctrl_iframe_ports.js",
    "assets/vctrl_presentation_pen.js",
    "assets/vctrl_core.js",
    "assets/vctrl_smartguide.js",
    "assets/vctrl_responsive_smartguide.js",
    "assets/vctrl_responsive_multiselect.js",
    "assets/vctrl_grouping.js",
    "assets/vctrl_inspector.js",
    "assets/vctrl_v3.js",
    "assets/vctrl_properties.js",
    "assets/vctrl_connectors.js",
    "enhanced_v4/component_library_v4.js",
    "assets/vctrl_table.js",
    "assets/vctrl_component_inserter.js",
    "assets/vctrl_floating_inspector.js",
    "assets/vctrl_v4_addon.js",
    "assets/dashboard.js",
    "assets/vctrl_pdf_exporter.js"
)

$scriptsTags = ($jsFiles | ForEach-Object { "<script src='../$_'></script>" }) -join "`n"

$htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Syntax Check</title>
    <!-- Mock required global libraries -->
    <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
    <script>
        window.errors = [];
        window.onerror = function(msg, url, line, col, error) {
            window.errors.push({ msg: msg, url: url, line: line, col: col });
            console.error('[SYNTAX_ERROR]', msg, url, line, col);
            return false;
        };
        // Mock DOM elements that might be accessed on load
        window.DOM = {};
    </script>
    $scriptsTags
</head>
<body>
    <div id="result">Testing...</div>
    <script>
        // Check dynamically inlined template scripts for syntax errors
        const inlinedScripts = [
            { name: 'v4TypographyScript', code: window.v4TypographyScript },
            { name: 'v4UndoScript', code: window.v4UndoScript },
            { name: 'v4TableScript', code: window.v4TableScript },
            { name: 'v4TextMeasurerScript', code: window.v4TextMeasurerScript },
            { name: 'v4UIAtomsScript', code: window.v4UIAtomsScript },
            { name: 'v4DesignSystemScript', code: window.v4DesignSystemScript },
            { name: 'v4ShortcutsScript', code: window.v4ShortcutsScript },
            { name: 'v4CommonScript', code: window.v4CommonScript },
            { name: 'v4ObjectTextScript', code: window.v4ObjectTextScript },
            { name: 'v4ObjectShapeScript', code: window.v4ObjectShapeScript },
            { name: 'v4ObjectTableScript', code: window.v4ObjectTableScript },
            { name: 'v4ObjectConnectorScript', code: window.v4ObjectConnectorScript },
            { name: 'v4DragResizeScript', code: window.v4DragResizeScript },
            { name: 'v4PortConnectorScript', code: window.v4PortConnectorScript },
            { name: 'v4GridScript', code: window.v4GridScript },
            { name: 'v4AccordionScript', code: window.v4AccordionScript },
            { name: 'v4ResponsiveSmartGuideScript', code: window.v4ResponsiveSmartGuideScript },
            { name: 'v4Script', code: window.v4Script },
            { name: 'v4ResponsiveMultiselectScript', code: window.v4ResponsiveMultiselectScript }
        ];

        inlinedScripts.forEach(item => {
            if (item.code) {
                try {
                    new Function(item.code);
                    console.log('[INLINED_OK] ' + item.name);
                } catch(e) {
                    console.error('[INLINED_SYNTAX_ERROR] ' + item.name + ':', e.message);
                    window.errors.push({ msg: 'Inlined Syntax Error in ' + item.name + ': ' + e.message });
                }
            } else {
                console.warn('[INLINED_MISSING] ' + item.name + ' is undefined or empty');
            }
        });

        document.getElementById('result').innerText = JSON.stringify(window.errors);
    </script>
</body>
</html>
"@

[System.IO.File]::WriteAllText($testHarnessPath, $htmlContent, [System.Text.Encoding]::UTF8)
Write-Host "Test harness generated at: $testHarnessPath"

# Run Edge Headless and dump DOM
$proc = Start-Process -FilePath $edge -ArgumentList "--headless", "--disable-gpu", "--dump-dom", "$testHarnessPath" -PassThru -NoNewWindow -RedirectStandardOutput "c:\Users\sisun\ai_work\scripts\edge_output.txt"
$proc.WaitForExit(10000)

if (Test-Path "c:\Users\sisun\ai_work\scripts\edge_output.txt") {
    $out = [System.IO.File]::ReadAllText("c:\Users\sisun\ai_work\scripts\edge_output.txt", [System.Text.Encoding]::UTF8)
    if ($out -match '<div id="result">([\s\S]*?)<\/div>') {
        $resultJson = $matches[1]
        Write-Host "Result from Browser Engine: $resultJson"
    } else {
        Write-Host "Output length: $($out.Length)"
    }
}
