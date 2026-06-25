/* ============================================================
   Radar Canvas Background — AEGIS-X Hero
   Lightweight canvas-rendered radar sweep with range rings,
   blinking blips, and a rotating sweep line.
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

  // ── Configuration ── 
  const CONFIG = {
    sweepSpeed: 0.008,        // radians per frame
    ringCount: 5,
    ringColor: 'rgba(107, 124, 94, 0.12)',
    sweepColor: 'rgba(0, 200, 83, 0.15)',
    sweepTrailLength: 0.6,    // radians
    blipCount: 18,
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

  // ── Draw Grid ── 
  function drawGrid() {
    ctx.strokeStyle = CONFIG.gridColor;
    ctx.lineWidth = 0.5;

    // Vertical center line
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius - 20);
    ctx.lineTo(cx, cy + radius + 20);
    ctx.stroke();

    // Horizontal center line
    ctx.beginPath();
    ctx.moveTo(cx - radius - 20, cy);
    ctx.lineTo(cx + radius + 20, cy);
    ctx.stroke();
  }

  // ── Draw Crosshairs ── 
  function drawCrosshairs() {
    ctx.strokeStyle = CONFIG.crosshairColor;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 8]);

    // Diagonal lines
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 4) + (i * Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * (radius + 10), cy + Math.sin(a) * (radius + 10));
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }

  // ── Draw Range Rings ── 
  function drawRings() {
    for (let i = 1; i <= CONFIG.ringCount; i++) {
      const r = (radius / CONFIG.ringCount) * i;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = CONFIG.ringColor;
      ctx.lineWidth = i === CONFIG.ringCount ? 1.5 : 0.5;
      ctx.stroke();
    }

    // Range labels
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(107, 124, 94, 0.3)';
    ctx.textAlign = 'left';
    for (let i = 1; i <= CONFIG.ringCount; i++) {
      const r = (radius / CONFIG.ringCount) * i;
      const label = (i * 100) + 'm';
      ctx.fillText(label, cx + r + 4, cy - 4);
    }
  }

  // ── Draw Sweep ── 
  function drawSweep() {
    // Sweep gradient trail
    const gradient = ctx.createConicalGradient
      ? null 
      : null;

    // Draw as a filled arc with gradient
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Sweep trail (using multiple arcs with decreasing opacity)
    const segments = 20;
    for (let i = 0; i < segments; i++) {
      const startAngle = -CONFIG.sweepTrailLength * (i / segments);
      const endAngle = -CONFIG.sweepTrailLength * ((i + 1) / segments);
      const alpha = 0.15 * (1 - i / segments);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle, true);
      ctx.closePath();
      ctx.fillStyle = `rgba(0, 200, 83, ${alpha})`;
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
      ctx.fillStyle = `rgba(0, 200, 83, ${blip.brightness * 0.15})`;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(x, y, blip.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 200, 83, ${blip.brightness * 0.8})`;
      ctx.fill();
    }
  }

  // ── Draw Status Text ── 
  function drawStatus() {
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(107, 124, 94, 0.25)';

    const statusLines = [
      'MODE: OPERATIONAL',
      'TRACKS: ' + CONFIG.blipCount,
      'SWEEP: ACTIVE',
      'LATENCY: <10ms',
    ];

    statusLines.forEach((line, i) => {
      ctx.fillText(line, cx - radius - 10, cy - radius + 20 + i * 16);
    });

    // Compass labels
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(107, 124, 94, 0.2)';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('N', cx, cy - radius - 8);
    ctx.fillText('S', cx, cy + radius + 16);
    ctx.textAlign = 'left';
    ctx.fillText('E', cx + radius + 8, cy + 4);
    ctx.textAlign = 'right';
    ctx.fillText('W', cx - radius - 8, cy + 4);
  }

  // ── Main Draw Loop ── 
  function draw() {
    ctx.clearRect(0, 0, width, height);

    drawGrid();
    drawCrosshairs();
    drawRings();
    drawSweep();
    drawBlips();
    drawStatus();

    angle += CONFIG.sweepSpeed;
    if (angle > Math.PI * 2) angle -= Math.PI * 2;

    animationId = requestAnimationFrame(draw);
  }

  // ── Init ── 
  function init() {
    resize();
    generateBlips();
    draw();
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
      cancelAnimationFrame(animationId);
    } else {
      draw();
    }
  });

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
