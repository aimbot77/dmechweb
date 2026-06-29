/**
 * Interactive Particle Network (Mechatronics Node Grid)
 * A visually stunning particle background for the DmechatroniX company view.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('mecha-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let width, height;
  let particles = [];
  let mouse = { x: -1000, y: -1000, active: false };
  let animationId;
  const PARTICLE_COUNT = 80; // Enough for a rich effect but performant
  const CONNECTION_DISTANCE = 150;
  const MOUSE_RADIUS = 200;

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.baseRadius = Math.random() * 2 + 1;
      this.radius = this.baseRadius;
      this.color = Math.random() > 0.8 ? '#00c853' : 'rgba(255,255,255,0.4)'; // Mix of green and white
    }

    update() {
      // Movement
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off walls
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interaction
      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < MOUSE_RADIUS) {
          const forceDirectionX = dx / dist;
          const forceDirectionY = dy / dist;
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          
          this.x -= forceDirectionX * force * 2;
          this.y -= forceDirectionY * force * 2;
          
          this.radius = this.baseRadius + (force * 3);
        } else {
          this.radius = this.baseRadius;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const opacity = 1 - (dist / CONNECTION_DISTANCE);
          ctx.strokeStyle = `rgba(107, 124, 94, ${opacity * 0.3})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
      
      // Connect to mouse
      if (mouse.active) {
        const dx = particles[a].x - mouse.x;
        const dy = particles[a].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const opacity = 1 - (dist / MOUSE_RADIUS);
          ctx.strokeStyle = `rgba(0, 200, 83, ${opacity * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    // Only animate if canvas is visible (Company view active)
    const viewCompany = document.getElementById('view-company');
    if (viewCompany && viewCompany.style.display === 'none') {
      animationId = requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    
    connectParticles();
    animationId = requestAnimationFrame(animate);
  }

  // Events
  window.addEventListener('resize', () => {
    resize();
    init(); // Reinit on resize to redistribute
  });

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  document.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Start
  init();
  animate();

})();
