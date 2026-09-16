---
name: workspace-editor-flowchart
description: Use when creating or editing Workspace Editor process screens, flowcharts, 1600x900 absolute-position layouts, nodes, connectors, straight arrows, diamond decisions, Y/N labels, dividers, swimlane-like sections, or scroll-free process diagrams.
---

# Workspace Editor Flowchart

## Canvas
- Place nodes and connectors with `position: absolute` inside the 1600x900 canvas (legacy 1440x900 supported).
- Avoid browser scroll by fitting the whole process layout inside the canvas.
- Keep screen dimensions aligned with the Cover canvas size.

## Flow Semantics
- Use diamond nodes (`.v4-shape-diamond`) for conditional branches.
- Add separate `Y` and `N` text nodes for every conditional branch so direction is unambiguous.
- When the actor/system changes, such as Web/App Storefront, Backend/API, OMS/SAP, or POS, use horizontal dotted dividers (`.v4-shape-line` with `data-line-dir="horizontal"`, `data-line-style="dotted"`) to separate visual zones.

## Line & Shape Precision (`vctrl_object_shape.js`)
- **Line Components (`.v4-shape-line`)**:
  - **Direction**: `data-line-dir="horizontal"` (default) or `"vertical"`.
  - **Styles**: `data-line-style="solid"` (default), `"dashed"` (`stroke-dasharray: 6 4`), or `"dotted"` (`stroke-dasharray: 1 5; stroke-linecap: round`).
  - **Standard Thickness**: `data-line-width="1.6"` (`stroke-width: 1.6`) default.
- **Dedicated Shapes (`.v4-shape-diamond`, `.v4-shape-arrow`, `.v4-shape-triangle`)**:
  - Keep all shape borders at the standard **`1.6px`**.
  - Internal text must be encapsulated inside `.v4-shape-text-content` or `.v4-shape-text-overlay` with `.v4-editable-cell` to protect SVG paths from editor destruction.

## Connector Precision (`vctrl_connectors.js` & `vctrl_object_connector.js`)
- **Dual Path Structure**: Connector lines inside `LF_RENDER_CONNECTORS` are rendered with two SVG paths: an invisible 40px hit-area path (`stroke="transparent" stroke-width="40"`) for easy selection, and a visible path (`stroke-width: 1.6` or `baseWidth + 1` when selected).
- **Magnetic Port Snapping**: When dragging connector endpoints within **`30px`** of a component port, the target port element (`.lf-connector-port`) scales up (`transform: scale(1.8)`) and highlights with a pink background (`#fb7185`).
- **Real-Time Anchoring (`syncAnchoredPositions` & `updateAnchoredConnectorsLocal`)**:
  - When moving or resizing any node, connected lines automatically recompute endpoints and follow along smoothly.
  - Supports both straight (`Line (Straight)`) and elbow routing (`Line (Elbow)`: `M x1 y1 H midX V y2 H x2`).
- **Connector Deletion**:
  - Deleting a connector via `.lf-delete-trigger` or `Delete`/`Backspace` dispatches `LF_DELETE_CONNECTOR` to parent `ConnectorEngine` and synchronizes `metadata.json` connectors state.

## Text & Typography
- Keep labels short and readable.
- Use `white-space: nowrap;` for branch labels, dates, and compact process tags that must stay on one line.
- Font hierarchy: Title `18-20px`, Section Header `15-16px`, Body/Nodes `14-15px`, Labels `13px`, Mini Tags `12px`.
