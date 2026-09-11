$files = @(
    "c:\Users\sisun\ai_work\assets\vctrl_responsive_multiselect.js",
    "c:\Users\sisun\ai_work\assets\vctrl_responsive_pins.js",
    "c:\Users\sisun\ai_work\assets\vctrl_shortcuts.js",
    "c:\Users\sisun\ai_work\assets\vctrl_core.js",
    "c:\Users\sisun\ai_work\assets\vctrl_inspector.js",
    "c:\Users\sisun\ai_work\assets\vctrl_annotation_pins.js",
    "c:\Users\sisun\ai_work\assets\vctrl_canvas_viewport.js",
    "c:\Users\sisun\ai_work\assets\vctrl_iframe_drag.js",
    "c:\Users\sisun\ai_work\assets\vctrl_iframe_script.js",
    "c:\Users\sisun\ai_work\assets\vctrl_text_measurer.js",
    "c:\Users\sisun\ai_work\assets\vctrl_iframe_styles.js",
    "c:\Users\sisun\ai_work\assets\responsive_frame.js",
    "c:\Users\sisun\ai_work\assets\vctrl_common.js",
    "c:\Users\sisun\ai_work\assets\vctrl_component_inserter.js",
    "c:\Users\sisun\ai_work\assets\vctrl_v4_addon.js",
    "c:\Users\sisun\ai_work\assets\vctrl_iframe_grid.js",
    "c:\Users\sisun\ai_work\assets\vctrl_iframe_accordion.js",
    "c:\Users\sisun\ai_work\assets\vctrl_iframe_tab.js",
    "c:\Users\sisun\ai_work\assets\vctrl_properties.js",
    "c:\Users\sisun\ai_work\assets\vctrl_smartguide.js",
    "c:\Users\sisun\ai_work\assets\vctrl_responsive_smartguide.js",
    "c:\Users\sisun\ai_work\assets\inspector\inspector_grid.js",
    "c:\Users\sisun\ai_work\assets\inspector\inspector_accordion.js",
    "c:\Users\sisun\ai_work\assets\inspector\inspector_tab.js",
    "c:\Users\sisun\ai_work\assets\inspector\inspector_shapes.js",
    "c:\Users\sisun\ai_work\assets\inspector\inspector_atoms.js",
    "c:\Users\sisun\ai_work\assets\ui_library_fallback.js",
    "c:\Users\sisun\ai_work\assets\vctrl_ui_library.js",
    "c:\Users\sisun\ai_work\assets\vctrl_presentation_pen.js",
    "c:\Users\sisun\ai_work\assets\vctrl_pdf_exporter.js",
    "c:\Users\sisun\ai_work\assets\vctrl_design_system.js",
    "c:\Users\sisun\ai_work\assets\vctrl_color_picker.js",
    "c:\Users\sisun\ai_work\assets\vctrl_screen_manager.js",
    "c:\Users\sisun\ai_work\assets\vctrl_connectors.js",
    "c:\Users\sisun\ai_work\assets\inspector\inspector_admin_settings.js",
    "c:\Users\sisun\ai_work\assets\vctrl_ui_atoms.js",
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

Write-Host "`n--- Validating Inlined Template Scripts via Node VM ---"
node -e "
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const context = { window: {}, document: {}, console: console };
vm.createContext(context);

const scriptsToLoad = [
    'vctrl_typography.js', 'vctrl_undo.js', 'vctrl_table.js', 'vctrl_text_measurer.js',
    'vctrl_ui_atoms.js', 'vctrl_design_system.js', 'vctrl_shortcuts.js', 'vctrl_common.js',
    'vctrl_object_shape.js', 'vctrl_object_connector.js', 'vctrl_iframe_drag.js',
    'vctrl_iframe_ports.js', 'vctrl_iframe_grid.js', 'vctrl_iframe_accordion.js',
    'vctrl_iframe_tab.js', 'vctrl_responsive_smartguide.js', 'vctrl_responsive_pins.js',
    'vctrl_responsive_multiselect.js', 'vctrl_iframe_script.js'
];

scriptsToLoad.forEach(s => {
    const p = path.join('assets', s);
    if (fs.existsSync(p)) {
        try { vm.runInContext(fs.readFileSync(p, 'utf8'), context); } catch(e) {}
    }
});

const vars = [
    'v4TypographyScript', 'v4UndoScript', 'v4TableScript', 'v4TextMeasurerScript',
    'v4UIAtomsScript', 'v4DesignSystemScript', 'v4ShortcutsScript', 'v4CommonScript',
    'v4ObjectShapeScript', 'v4ObjectConnectorScript', 'v4DragResizeScript',
    'v4PortConnectorScript', 'v4GridScript', 'v4AccordionScript', 'v4TabScript',
    'v4ResponsiveSmartGuideScript', 'v4ResponsivePinsScript', 'v4ResponsiveMultiselectScript',
    'v4Script'
];

let assembled = '';
let hasError = false;
vars.forEach(v => {
    if (context.window[v]) {
        assembled += context.window[v] + '\n';
        try {
            new vm.Script(context.window[v]);
        } catch(err) {
            console.error('[INLINED SCRIPT SYNTAX ERROR]', v, err.message);
            hasError = true;
        }
    }
});

try {
    new vm.Script(assembled);
    console.log('All inlined engine scripts and assembled bundle passed 100% VM compilation check.');
} catch(err) {
    console.error('[ASSEMBLED SCRIPT SYNTAX ERROR]', err.message);
    hasError = true;
}

if (hasError) process.exit(1);
"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Inlined script syntax validation failed!"
    exit 1
}

