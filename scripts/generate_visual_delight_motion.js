const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('[Motion Builder] Generating motion_user_visual_delight.webp...');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'illustrations', 'motion');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PRESET = {
    id: 'motion_user_visual_delight',
    w: 240,
    h: 140,
    frames: 24,
    duration: 60
};

const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1:45681');

    if (req.method === 'POST' && url.pathname === '/log') {
        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', () => {
            console.log('[Browser Console]', Buffer.concat(body).toString('utf8'));
            res.writeHead(200);
            res.end('OK');
        });
        return;
    }

    if (req.method === 'POST' && url.pathname === '/save') {
        const name = url.searchParams.get('name');
        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', () => {
            const buf = Buffer.concat(body);
            const targetPath = path.join(OUTPUT_DIR, `${name}.webp`);
            fs.writeFileSync(targetPath, buf);
            console.log(`[Motion Builder] Saved: ${name}.webp (${buf.length} bytes)`);
            res.writeHead(200);
            res.end('OK');

            setTimeout(() => {
                server.close();
                process.exit(0);
            }, 500);
        });
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Visual Delight Motion Generator</title>
</head>
<body style="background: transparent; margin: 0; padding: 0;">
<canvas id="cvs"></canvas>
<script>
window.onerror = function(msg, url, line) {
    fetch('/log', { method: 'POST', body: 'ERROR: ' + msg + ' at line ' + line });
};
fetch('/log', { method: 'POST', body: 'Page loaded, starting generation...' });
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
// Visual Delight & Lookbook Motion Renderer
// -------------------------------------------------------------
const cvs = document.getElementById('cvs');
const ctx = cvs.getContext('2d');
const PRESET = ${JSON.stringify(PRESET)};

function drawSparkle(ctx, cx, cy, size, rot, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(0, 0, size, 0);
    ctx.quadraticCurveTo(0, 0, 0, size);
    ctx.quadraticCurveTo(0, 0, -size, 0);
    ctx.quadraticCurveTo(0, 0, 0, -size);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawVisualDelight(ctx, t, w, h) {
    ctx.clearRect(0, 0, w, h);

    // 1. Outer Rounded Frame (Identical to other 5 user motions)
    // w: 240, h: 140, card box: 8, 8, 224, 124, r: 16
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.roundRect(8, 8, 224, 124, 16);
    ctx.stroke();

    const cx = w / 2;
    const cy = h / 2;

    // Subtle gentle floating breathing cycle
    const floatY = Math.sin(t * Math.PI * 2) * 2.8;

    // 2. Left Background Gallery Card (Muted Depth)
    ctx.save();
    ctx.translate(cx - 38, cy + 4 - floatY * 0.4);
    ctx.rotate(-0.07);
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-24, -34, 48, 68, 8);
    ctx.fill();
    ctx.stroke();
    // Inner placeholder lines
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(-16, -26, 32, 28, 4);
    ctx.fill();
    ctx.roundRect(-16, 8, 26, 4, 2);
    ctx.fill();
    ctx.roundRect(-16, 16, 18, 4, 2);
    ctx.fill();
    ctx.restore();

    // 3. Right Background Gallery Card (Muted Depth)
    ctx.save();
    ctx.translate(cx + 38, cy + 5 - floatY * 0.4);
    ctx.rotate(0.07);
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-24, -34, 48, 68, 8);
    ctx.fill();
    ctx.stroke();
    // Inner placeholder lines
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(-16, -26, 32, 28, 4);
    ctx.fill();
    ctx.roundRect(-16, 8, 26, 4, 2);
    ctx.fill();
    ctx.roundRect(-16, 16, 18, 4, 2);
    ctx.fill();
    ctx.restore();

    // 4. Center Featured Lookbook Card (Primary Showcase)
    ctx.save();
    ctx.translate(cx, cy + floatY);

    // Subtle card drop shadow
    ctx.shadowColor = 'rgba(37, 99, 235, 0.12)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Card Body
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(-28, -38, 56, 76, 10);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Inside Visual Media Area (Lookbook Image Frame)
    ctx.fillStyle = '#eff6ff';
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-20, -30, 40, 36, 6);
    ctx.fill();
    ctx.stroke();

    // Graphic Artwork inside Image Frame:
    // Sun/Dot + Dynamic Wave Mountains
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-20, -30, 40, 36, 6);
    ctx.clip();

    // Small glowing sun dot
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(-8, -18, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Stylish mountains
    ctx.fillStyle = 'rgba(37, 99, 235, 0.35)';
    ctx.beginPath();
    ctx.moveTo(-20, 6);
    ctx.lineTo(-4, -8);
    ctx.lineTo(12, 6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(37, 99, 235, 0.65)';
    ctx.beginPath();
    ctx.moveTo(-10, 6);
    ctx.lineTo(4, -13);
    ctx.lineTo(20, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Card Bottom Caption lines
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.roundRect(-20, 13, 28, 4.5, 2.2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(-20, 22, 38, 3.5, 1.8);
    ctx.fill();

    ctx.restore();

    // 5. Pulsing Sparkles (Visual Delight & Engagement Accent)
    // Main Sparkle 1 (Top-Right of center card)
    const sp1Phase = (t * Math.PI * 2);
    const sp1Scale = 0.75 + 0.35 * Math.sin(sp1Phase);
    const sp1Rot = t * Math.PI * 0.5;
    drawSparkle(ctx, cx + 38, cy - 30, 11 * sp1Scale, sp1Rot, '#2563eb');

    // Mini Sparkle 2 (Bottom-Left)
    const sp2Phase = ((t + 0.45) % 1) * Math.PI * 2;
    const sp2Scale = 0.65 + 0.35 * Math.sin(sp2Phase);
    drawSparkle(ctx, cx - 44, cy + 24, 7 * sp2Scale, -sp1Rot * 0.8, '#38bdf8');

    // Tiny Sparkle 3 (Top-Left subtle accent)
    const sp3Phase = ((t + 0.75) % 1) * Math.PI * 2;
    const sp3Scale = 0.5 + 0.35 * Math.sin(sp3Phase);
    drawSparkle(ctx, cx - 32, cy - 32, 5 * sp3Scale, sp1Rot * 1.2, '#60a5fa');
}

function dataURLtoU8(dataURL) {
    const binStr = atob(dataURL.split(',')[1]);
    const len = binStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binStr.charCodeAt(i);
    }
    return bytes;
}

async function generate() {
    try {
        fetch('/log', { method: 'POST', body: 'generate() entered' });
        cvs.width = PRESET.w;
        cvs.height = PRESET.h;
        const frames = [];

        for (let i = 0; i < PRESET.frames; i++) {
            const t = i / PRESET.frames;
            drawVisualDelight(ctx, t, PRESET.w, PRESET.h);
            const dataUrl = cvs.toDataURL('image/webp', 0.95);
            frames.push(dataURLtoU8(dataUrl));
        }
        fetch('/log', { method: 'POST', body: 'All 24 frames captured, building webp...' });

        const animWebP = buildAnimatedWebP(PRESET.w, PRESET.h, frames, PRESET.duration);
        fetch('/log', { method: 'POST', body: 'Webp built, size: ' + animWebP.length });
        await fetch('/save?name=' + PRESET.id, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: animWebP
        });
        fetch('/log', { method: 'POST', body: 'Saved successfully!' });
    } catch (err) {
        fetch('/log', { method: 'POST', body: 'generate() error: ' + (err.stack || err.message) });
    }
}

generate();
</script>
</body>
</html>`);
});

server.listen(45681, '127.0.0.1', () => {
    console.log('[Motion Builder] Server listening on http://127.0.0.1:45681');
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const tmpProfile = 'C:\\Users\\sisun\\AppData\\Local\\Temp\\chrome_motion_tmp';
    exec(`"${chromePath}" --headless=new --disable-gpu --no-sandbox --virtual-time-budget=10000 --user-data-dir="${tmpProfile}" http://127.0.0.1:45681`, (err) => {
        if (err) console.error('[Motion Builder] Chrome exec error:', err);
    });
});
