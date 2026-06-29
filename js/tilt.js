/**
 * Vanilla JS 3D Tilt Effect
 * Adds a premium 3D hover tracking effect to elements with the `.tilt-card` class.
 */
(function () {
  'use strict';

  function initTilt() {
    const tiltElements = document.querySelectorAll('.tilt-card');
    
    tiltElements.forEach(el => {
      // Create glare element
      const glare = document.createElement('div');
      glare.classList.add('tilt-glare');
      el.appendChild(glare);

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element
        const y = e.clientY - rect.top;  // y position within the element
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate rotation based on mouse position (max 10 degrees)
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // Update glare position
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.1) 0%, transparent 50%)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        glare.style.background = 'transparent';
      });
    });
  }

  // Hook into global scope so loader can re-init it
  window.initTiltEffect = initTilt;
  
  // Run on load
  initTilt();

})();
