/* ============================================================
   Radar Canvas Background — AEGIS-X Hero
   Lightweight canvas-rendered radar sweep with range rings,
   blinking blips, and a rotating sweep line.
   
   Performance optimizations:
   - Throttled to ~30fps (sweep is slow, 60fps is wasteful)
   - Static elements (grid, rings, crosshairs, labels) cached
     to an offscreen canvas and drawn via drawImage()
   - Reduced sweep segments from 20 → 8
   - Reduced blip count from 18 → 12
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('radar-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, cx, cy, radius;
  let angle = 0;
  let blips = [];
  let animationId;

  // Offscreen canvas for static elements
  let staticCanvas = null;
  let staticCtx = null;
  let staticDirty = true;

  // Frame throttle (~30fps)
  const FRAME_INTERVAL = 1000 / 30;
  let lastFrameTime = 0;

  // ── Configuration ── 
  const CONFIG = {
    sweepSpeed: 0.008,        // radians per frame
    ringCount: 5,
    ringColor: 'rgba(107, 124, 94, 0.12)',
    sweepColor: 'rgba(0, 200, 83, 0.15)',
    sweepTrailLength: 0.6,    // radians
    sweepSegments: 8,         // reduced from 20
    blipCount: 12,            // reduced from 18
    blipColor: 'rgba(0, 200, 83, 0.7)',
    blipFadeColor: 'rgba(0, 200, 83, 0.15)',
    gridColor: 'rgba(255, 255, 255, 0.025)',
    crosshairColor: 'rgba(107, 124, 94, 0.15)',
    bgColor: 'rgba(10, 12, 16, 0)',
  };

  // ── Resize ── 
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    cx = width / 2;
    cy = height / 2;
    radius = Math.min(width, height) * 0.38;

    // Rebuild the offscreen static canvas
    staticCanvas = document.createElement('canvas');
    staticCanvas.width = canvas.width;
    staticCanvas.height = canvas.height;
    staticCtx = staticCanvas.getContext('2d');
    staticCtx.scale(dpr, dpr);
    staticDirty = true;
  }

  // ── Generate Blips ── 
  function generateBlips() {
    blips = [];
    for (let i = 0; i < CONFIG.blipCount; i++) {
      const dist = 0.15 + Math.random() * 0.8;
      const a = Math.random() * Math.PI * 2;
      blips.push({
        angle: a,
        dist: dist,
        size: 1.5 + Math.random() * 2.5,
        brightness: 0,
        lastSweep: -10,
        speed: (Math.random() - 0.5) * 0.001,
        drift: (Math.random() - 0.5) * 0.0003,
      });
    }
  }

  // ── Render static elements to offscreen canvas ── 
  function renderStaticLayer() {
    if (!staticDirty || !staticCtx) return;

    staticCtx.clearRect(0, 0, width, height);

    // Grid lines
    staticCtx.strokeStyle = CONFIG.gridColor;
    staticCtx.lineWidth = 0.5;
    staticCtx.beginPath();
    staticCtx.moveTo(cx, cy - radius - 20);
    staticCtx.lineTo(cx, cy + radius + 20);
    staticCtx.stroke();
    staticCtx.beginPath();
    staticCtx.moveTo(cx - radius - 20, cy);
    staticCtx.lineTo(cx + radius + 20, cy);
    staticCtx.stroke();

    // Crosshairs
    staticCtx.strokeStyle = CONFIG.crosshairColor;
    staticCtx.lineWidth = 0.5;
    staticCtx.setLineDash([4, 8]);
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 4) + (i * Math.PI / 2);
      staticCtx.beginPath();
      staticCtx.moveTo(cx, cy);
      staticCtx.lineTo(cx + Math.cos(a) * (radius + 10), cy + Math.sin(a) * (radius + 10));
      staticCtx.stroke();
    }
    staticCtx.setLineDash([]);

    // Range rings
    for (let i = 1; i <= CONFIG.ringCount; i++) {
      const r = (radius / CONFIG.ringCount) * i;
      staticCtx.beginPath();
      staticCtx.arc(cx, cy, r, 0, Math.PI * 2);
      staticCtx.strokeStyle = CONFIG.ringColor;
      staticCtx.lineWidth = i === CONFIG.ringCount ? 1.5 : 0.5;
      staticCtx.stroke();
    }

    // Range labels
    staticCtx.font = '10px "JetBrains Mono", monospace';
    staticCtx.fillStyle = 'rgba(107, 124, 94, 0.3)';
    staticCtx.textAlign = 'left';
    for (let i = 1; i <= CONFIG.ringCount; i++) {
      const r = (radius / CONFIG.ringCount) * i;
      const label = (i * 100) + 'm';
      staticCtx.fillText(label, cx + r + 4, cy - 4);
    }

    // Status text
    staticCtx.font = '10px "JetBrains Mono", monospace';
    staticCtx.textAlign = 'left';
    staticCtx.fillStyle = 'rgba(107, 124, 94, 0.25)';
    var statusLines = [
      'MODE: OPERATIONAL',
      'TRACKS: ' + CONFIG.blipCount,
      'SWEEP: ACTIVE',
      'LATENCY: <10ms',
    ];
    statusLines.forEach(function (line, i) {
      staticCtx.fillText(line, cx - radius - 10, cy - radius + 20 + i * 16);
    });

    // Compass labels
    staticCtx.textAlign = 'center';
    staticCtx.fillStyle = 'rgba(107, 124, 94, 0.2)';
    staticCtx.font = '11px "JetBrains Mono", monospace';
    staticCtx.fillText('N', cx, cy - radius - 8);
    staticCtx.fillText('S', cx, cy + radius + 16);
    staticCtx.textAlign = 'left';
    staticCtx.fillText('E', cx + radius + 8, cy + 4);
    staticCtx.textAlign = 'right';
    staticCtx.fillText('W', cx - radius - 8, cy + 4);

    staticDirty = false;
  }

  // ── Draw Sweep ── 
  function drawSweep() {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Sweep trail (reduced segments for performance)
    var segments = CONFIG.sweepSegments;
    for (let i = 0; i < segments; i++) {
      const startAngle = -CONFIG.sweepTrailLength * (i / segments);
      const endAngle = -CONFIG.sweepTrailLength * ((i + 1) / segments);
      const alpha = 0.15 * (1 - i / segments);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle, true);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 200, 83, ' + alpha + ')';
      ctx.fill();
    }

    // Sweep line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.strokeStyle = 'rgba(0, 200, 83, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  // ── Draw Blips ── 
  function drawBlips() {
    for (let blip of blips) {
      // Update blip position (slow drift)
      blip.angle += blip.speed;
      blip.dist += blip.drift;
      if (blip.dist > 0.95 || blip.dist < 0.1) blip.drift *= -1;

      // Check if sweep just passed over this blip
      let angleDiff = angle - blip.angle;
      // Normalize to 0..2π
      angleDiff = ((angleDiff % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

      if (angleDiff < 0.15) {
        blip.brightness = 1;
        blip.lastSweep = angle;
      }

      // Fade after sweep passes
      const fadeAngle = ((angle - blip.lastSweep) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      blip.brightness = Math.max(0.1, 1 - fadeAngle / (Math.PI * 1.5));

      // Draw
      const x = cx + Math.cos(blip.angle) * blip.dist * radius;
      const y = cy + Math.sin(blip.angle) * blip.dist * radius;

      // Glow
      ctx.beginPath();
      ctx.arc(x, y, blip.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 200, 83, ' + (blip.brightness * 0.15) + ')';
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(x, y, blip.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 200, 83, ' + (blip.brightness * 0.8) + ')';
      ctx.fill();
    }
  }

  let isVisible = false;

  function startLoop() {
    if (isVisible && !document.hidden && !animationId) {
      lastFrameTime = performance.now();
      draw(lastFrameTime);
    }
  }

  function stopLoop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // ── Main Draw Loop (throttled to ~30fps) ── 
  function draw(now) {
    animationId = requestAnimationFrame(draw);

    // Throttle: skip frame if not enough time has passed
    var delta = now - lastFrameTime;
    if (delta < FRAME_INTERVAL) return;
    lastFrameTime = now - (delta % FRAME_INTERVAL);

    ctx.clearRect(0, 0, width, height);

    // Draw cached static layer
    renderStaticLayer();
    if (staticCanvas) {
      ctx.drawImage(staticCanvas, 0, 0, width, height);
    }

    // Draw dynamic elements
    drawSweep();
    drawBlips();

    angle += CONFIG.sweepSpeed;
    if (angle > Math.PI * 2) angle -= Math.PI * 2;
  }

  // ── Init ── 
  function init() {
    resize();
    generateBlips();

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            startLoop();
          } else {
            stopLoop();
          }
        });
      }, { threshold: 0 });
      observer.observe(canvas);
    } else {
      isVisible = true;
      startLoop();
    }
  }

  // Handle resize
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
    }, 150);
  });

  // Pause when not visible
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopLoop();
    } else {
      startLoop();
    }
  });

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
