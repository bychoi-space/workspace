const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('[Motion Builder] Generating 6 new Apple-style Animated WebP presets...');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'illustrations', 'motion');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PRESETS = [
    { id: 'motion_click_prompt', w: 160, h: 160, frames: 24, duration: 50 },
    { id: 'motion_scroll_prompt', w: 140, h: 180, frames: 24, duration: 50 },
    { id: 'motion_apple_spinner', w: 160, h: 160, frames: 24, duration: 50 },
    { id: 'motion_progress_bar', w: 220, h: 100, frames: 24, duration: 50 },
    { id: 'motion_skeleton_shimmer', w: 200, h: 160, frames: 24, duration: 50 },
    { id: 'motion_toast_notification', w: 220, h: 110, frames: 24, duration: 50 }
];

let savedCount = 0;

const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1:45680');

    if (req.method === 'POST' && url.pathname === '/save') {
        const name = url.searchParams.get('name');
        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', () => {
            const buf = Buffer.concat(body);
            const targetPath = path.join(OUTPUT_DIR, `${name}.webp`);
            fs.writeFileSync(targetPath, buf);
            savedCount++;
            console.log(`[Motion Builder] [${savedCount}/${PRESETS.length}] Saved: ${name}.webp (${buf.length} bytes)`);
            res.writeHead(200);
            res.end('OK');

            if (savedCount >= PRESETS.length) {
                console.log('[Motion Builder] All 6 Apple-style motion presets generated successfully!');
                setTimeout(() => {
                    server.close();
                    process.exit(0);
                }, 500);
            }
        });
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Apple-Style Motion Generator</title>
</head>
<body style="background: transparent; margin: 0; padding: 0;">
<canvas id="cvs"></canvas>
<script>
function uint24LE(num) {
    return [num & 0xFF, (num >> 8) & 0xFF, (num >> 16) & 0xFF];
}

function uint32LE(num) {
    return [num & 0xFF, (num >> 8) & 0xFF, (num >> 16) & 0xFF, (num >> 24) & 0xFF];
}

function uint16LE(num) {
    return [num & 0xFF, (num >> 8) & 0xFF];
}

function extractSubchunks(u8) {
    let offset = 12;
    const subchunks = [];
    while (offset < u8.length) {
        const fourcc = String.fromCharCode(...u8.slice(offset, offset + 4));
        const size = u8[offset + 4] | (u8[offset + 5] << 8) | (u8[offset + 6] << 16) | (u8[offset + 7] << 24);
        const paddedSize = (size % 2 === 1) ? size + 1 : size;
        const total = 8 + paddedSize;

        if (fourcc === 'VP8L' || fourcc === 'VP8 ' || fourcc === 'ALPH') {
            subchunks.push(u8.slice(offset, offset + total));
        }
        offset += total;
    }
    return subchunks;
}

function buildAnimatedWebP(width, height, frames, durationMs) {
    const parts = [];

    // 1. VP8X
    const vp8xFlags = 0x12; // Alpha + Animation
    const vp8xPayload = [
        vp8xFlags, 0, 0, 0,
        ...uint24LE(width - 1),
        ...uint24LE(height - 1)
    ];
    parts.push(new Uint8Array([
        ...'VP8X'.split('').map(c => c.charCodeAt(0)),
        ...uint32LE(10),
        ...vp8xPayload
    ]));

    // 2. ANIM
    parts.push(new Uint8Array([
        ...'ANIM'.split('').map(c => c.charCodeAt(0)),
        ...uint32LE(6),
        0, 0, 0, 0,
        ...uint16LE(0) // Infinite loop
    ]));

    // 3. ANMF Frames
    for (const frameU8 of frames) {
        const subchunks = extractSubchunks(frameU8);
        let subLen = 0;
        subchunks.forEach(s => subLen += s.length);

        const anmfPayloadSize = 16 + subLen;
        const anmfHeader = [
            ...uint24LE(0),
            ...uint24LE(0),
            ...uint24LE(width - 1),
            ...uint24LE(height - 1),
            ...uint24LE(durationMs),
            0x01 // Dispose to bg, alpha blend
        ];

        parts.push(new Uint8Array([
            ...'ANMF'.split('').map(c => c.charCodeAt(0)),
            ...uint32LE(anmfPayloadSize),
            ...anmfHeader
        ]));

        for (const sub of subchunks) {
            parts.push(sub);
        }
        if (anmfPayloadSize % 2 === 1) {
            parts.push(new Uint8Array([0]));
        }
    }

    let totalLen = 4;
    parts.forEach(p => totalLen += p.length);

    const riff = new Uint8Array([
        ...'RIFF'.split('').map(c => c.charCodeAt(0)),
        ...uint32LE(totalLen),
        ...'WEBP'.split('').map(c => c.charCodeAt(0))
    ]);

    const finalBuf = new Uint8Array(8 + totalLen);
    let cur = 0;
    finalBuf.set(riff, cur); cur += riff.length;
    for (const p of parts) {
        finalBuf.set(p, cur); cur += p.length;
    }
    return finalBuf;
}

// -------------------------------------------------------------
// 6 Apple-Style Modern Vector Renderers
// -------------------------------------------------------------
const cvs = document.getElementById('cvs');
const ctx = cvs.getContext('2d');

const DRAW_FUNCS = {
    // 1. Click Prompt (Apple Cursor + Micro-interaction Click & Ripple)
    motion_click_prompt(ctx, t, w, h) {
        const cx = w / 2, cy = h / 2;

        // Target hotspot (subtle button / pill)
        const targetX = cx + 8, targetY = cy + 10;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(targetX - 38, targetY - 18, 76, 36, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Click', targetX, targetY);

        // Click timing: t in [0.4..0.8] is click event
        const isClick = (t >= 0.4 && t <= 0.7);
        const clickProgress = isClick ? (t - 0.4) / 0.3 : 0;

        // Ripple wave on click
        if (t >= 0.4) {
            const rippleT = (t - 0.4) / 0.6;
            const rR = 12 + rippleT * 26;
            const rA = Math.max(0, 1 - rippleT) * 0.6;
            ctx.beginPath();
            ctx.arc(targetX, targetY, rR, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(59, 130, 246, ' + rA + ')';
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }

        // Apple Cursor Position & Scaling
        // Move towards target, click down, move back
        let curX = cx - 30 + Math.sin(t * Math.PI) * 38;
        let curY = cy - 25 + Math.sin(t * Math.PI) * 35;
        let curScale = isClick ? (1 - Math.sin(clickProgress * Math.PI) * 0.18) : 1;

        ctx.save();
        ctx.translate(curX, curY);
        ctx.scale(curScale, curScale);

        // Draw Apple macOS Black Cursor with crisp white border
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 22);
        ctx.lineTo(5.5, 17.5);
        ctx.lineTo(10.5, 27);
        ctx.lineTo(14.5, 25);
        ctx.lineTo(9.5, 15.5);
        ctx.lineTo(16.5, 15.5);
        ctx.closePath();

        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.restore();
    },

    // 2. Scroll Prompt (Minimalist Apple Mouse Body + Sliding Wheel + Subtle Wave)
    motion_scroll_prompt(ctx, t, w, h) {
        const cx = w / 2, cy = h / 2 - 12;

        // Mouse Silhouette Body (Apple Magic Mouse Pill Style)
        const mw = 44, mh = 74, mr = 22;
        const mx = cx - mw / 2, my = cy - mh / 2;

        // Subtle soft drop glow
        ctx.shadowColor = 'rgba(56, 189, 248, 0.2)';
        ctx.shadowBlur = 14;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.roundRect(mx, my, mw, mh, mr);
        ctx.fill();
        ctx.stroke();

        // Center seam line at top
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx, my + 6);
        ctx.lineTo(cx, my + 24);
        ctx.stroke();

        // Animated Sliding Scroll Wheel Dot
        // Moves from top to middle, fading in then fading out
        const slideY = my + 18 + (t * 26);
        const dotAlpha = Math.sin(t * Math.PI);

        ctx.fillStyle = 'rgba(56, 189, 248, ' + (0.2 + dotAlpha * 0.8) + ')';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(cx - 3, slideY, 6, 14, 3);
        ctx.fill();

        // Downward Chevrons (∨) Pulsing
        ctx.shadowBlur = 0;
        const chevBaseY = cy + mh / 2 + 14;
        for (let i = 0; i < 2; i++) {
            const cY = chevBaseY + i * 11;
            const cAlpha = Math.max(0, Math.sin((t + i * 0.3) * Math.PI));
            ctx.strokeStyle = 'rgba(56, 189, 248, ' + (0.2 + cAlpha * 0.7) + ')';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(cx - 8, cY);
            ctx.lineTo(cx, cY + 5);
            ctx.lineTo(cx + 8, cY);
            ctx.stroke();
        }
    },

    // 3. Apple Loading Spinner (12 Radial Tick Spokes + Progressive Percentage in Center!)
    // EXACT MATCH to user's uploaded reference image
    motion_apple_spinner(ctx, t, w, h) {
        const cx = w / 2, cy = h / 2;
        const totalSpokes = 12;
        const innerR = 34; // Distance from center to start of spoke
        const spokeLen = 17; // Length of each spoke
        const spokeWidth = 7.5; // Thickness of spoke capsule

        // Which spoke is currently active (0..11)
        const activeIdx = Math.floor(t * totalSpokes) % totalSpokes;

        for (let i = 0; i < totalSpokes; i++) {
            const angle = (i * Math.PI * 2) / totalSpokes - Math.PI / 2;
            // Distance in steps from the leading active spoke
            const diff = (i - activeIdx + totalSpokes) % totalSpokes;
            
            // Fading trail opacity from leading (diff=0) down to trailing (diff=11)
            // Color interpolation: #2563eb (blue) to soft light blue #dbeafe
            let alpha = 0.16 + (1 - diff / totalSpokes) * 0.84;
            let color = 'rgba(59, 130, 246, ' + alpha.toFixed(3) + ')';
            if (diff === 0) {
                color = '#2563eb'; // Leading vibrant tip
            }

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(-spokeWidth / 2, innerR, spokeWidth, spokeLen, spokeWidth / 2);
            ctx.fill();
            ctx.restore();
        }

        // Center Percentage Display (0% to 100% counting or dynamic)
        const pct = Math.floor(t * 100);
        ctx.fillStyle = '#2563eb';
        ctx.font = '700 17px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pct + '%', cx, cy + 1);
    },

    // 4. Apple-Style Progress Bar (Sleek Track + Gradient Fill + Sheen Shimmer + Percentage)
    motion_progress_bar(ctx, t, w, h) {
        const cx = w / 2, cy = h / 2 + 5;
        const barW = 180, barH = 12, barR = 6;
        const barX = cx - barW / 2, barY = cy - barH / 2;

        // Current progress value (smooth ease-in-out loop from 25% to 92%)
        const progress = 0.25 + 0.67 * (0.5 - 0.5 * Math.cos(t * Math.PI * 2));
        const filledW = Math.max(barH, barW * progress);

        // Header Labels: "Uploading..." & "85%"
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Updating System...', barX, barY - 14);

        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(progress * 100) + '%', barX + barW, barY - 14);

        // Background Track
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, barR);
        ctx.fill();
        ctx.stroke();

        // Clip to bar track for clean edges
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, barR);
        ctx.clip();

        // Filled Gradient Bar
        const fillGrad = ctx.createLinearGradient(barX, barY, barX + filledW, barY);
        fillGrad.addColorStop(0, '#0071e3');
        fillGrad.addColorStop(1, '#38bdf8');
        ctx.fillStyle = fillGrad;
        ctx.shadowColor = '#0071e3';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(barX, barY, filledW, barH, barR);
        ctx.fill();

        // Moving Diagonal Sheen / Shimmer Reflection
        const sheenX = barX - 40 + (t * (barW + 80));
        const sheenGrad = ctx.createLinearGradient(sheenX, barY, sheenX + 35, barY);
        sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
        sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = sheenGrad;
        ctx.fillRect(barX, barY, filledW, barH);
        ctx.restore();
    },

    // 5. Apple Skeleton Shimmer Pattern (UI Card with Diagonal Sweep Shimmer)
    motion_skeleton_shimmer(ctx, t, w, h) {
        const cx = w / 2, cy = h / 2;
        const cardW = 168, cardH = 128, cardR = 12;
        const cardX = cx - cardW / 2, cardY = cy - cardH / 2;

        // Card Container Base
        ctx.fillStyle = 'rgba(24, 24, 27, 0.8)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.4;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
        ctx.fill();
        ctx.stroke();

        // Clip to skeleton placeholders
        ctx.save();
        ctx.beginPath();
        // 1. Circle Avatar
        ctx.arc(cardX + 26, cardY + 28, 14, 0, Math.PI * 2);
        // 2. Title Line
        ctx.roundRect(cardX + 50, cardY + 18, 76, 8, 4);
        // 3. Subtitle Line
        ctx.roundRect(cardX + 50, cardY + 30, 48, 6, 3);
        // 4. Middle Content Banner Box
        ctx.roundRect(cardX + 16, cardY + 54, 136, 36, 6);
        // 5. Bottom Description Line 1
        ctx.roundRect(cardX + 16, cardY + 98, 108, 6, 3);
        // 6. Bottom Description Line 2
        ctx.roundRect(cardX + 16, cardY + 109, 72, 6, 3);
        ctx.clip();

        // Base Skeleton Gray Fill
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(cardX, cardY, cardW, cardH);

        // 45-degree Diagonal Shimmer Wave sweeping across
        const shimmerX = cardX - cardW + (t * cardW * 2.2);
        const sGrad = ctx.createLinearGradient(shimmerX, cardY, shimmerX + 60, cardY + 60);
        sGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        sGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.28)');
        sGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = sGrad;
        ctx.fillRect(cardX, cardY, cardW, cardH);
        ctx.restore();
    },

    // 6. Apple Dynamic Floating Toast Pill (Dynamic Island / macOS Notification Banner)
    motion_toast_notification(ctx, t, w, h) {
        const cx = w / 2, cy = h / 2;
        const toastW = 192, toastH = 48, toastR = 24;

        // Subtle vertical breathing / floating offset
        const floatY = Math.sin(t * Math.PI * 2) * 2.5;
        const toastX = cx - toastW / 2, toastY = cy - toastH / 2 + floatY;

        // Pill shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 6;

        // Dark frosted glass pill body
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(toastX, toastY, toastW, toastH, toastR);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Left Success Icon (Emerald Check Badge with subtle glow)
        const iconX = toastX + 26, iconY = toastY + toastH / 2;
        ctx.fillStyle = '#34c759';
        ctx.shadowColor = '#34c759';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(iconX, iconY, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(iconX - 4, iconY);
        ctx.lineTo(iconX - 1, iconY + 3.5);
        ctx.lineTo(iconX + 5, iconY - 3);
        ctx.stroke();

        // Right Text: Title & Subtitle
        ctx.fillStyle = '#f4f4f5';
        ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('변경사항 저장 완료', toastX + 46, toastY + 20);

        ctx.fillStyle = '#a1a1aa';
        ctx.font = '400 9.5px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
        ctx.fillText('클라우드에 안전하게 동기화됨', toastX + 46, toastY + 33);

        // Bottom Thin Progress Timer Line
        const timerProgress = (t * 1.0) % 1;
        const timerW = (toastW - 50) * (1 - timerProgress);
        ctx.fillStyle = 'rgba(52, 199, 89, 0.7)';
        ctx.beginPath();
        ctx.roundRect(toastX + 25, toastY + toastH - 4, timerW, 2, 1);
        ctx.fill();
    }
};

async function generateAll() {
    const PRESETS = ${JSON.stringify(PRESETS)};

    for (const p of PRESETS) {
        cvs.width = p.w;
        cvs.height = p.h;
        const frames = [];
        const drawFn = DRAW_FUNCS[p.id];

        for (let i = 0; i < p.frames; i++) {
            ctx.clearRect(0, 0, p.w, p.h);
            const t = i / p.frames;
            drawFn(ctx, t, p.w, p.h);

            const blob = await new Promise(r => cvs.toBlob(r, 'image/webp', 0.95));
            const arr = new Uint8Array(await blob.arrayBuffer());
            frames.push(arr);
        }

        const animWebP = buildAnimatedWebP(p.w, p.h, frames, p.duration);
        await fetch('/save?name=' + p.id, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: animWebP
        });
    }
}

generateAll();
</script>
</body>
</html>`);
});

server.listen(45680, '127.0.0.1', () => {
    console.log('[Motion Builder] Server listening on http://127.0.0.1:45680');
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    exec(`"${chromePath}" --headless=new --disable-gpu http://127.0.0.1:45680`, (err) => {
        if (err) console.error('[Motion Builder] Chrome exec error:', err);
    });
});
