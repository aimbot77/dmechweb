/**
 * Vanilla JS Parallax Effect
 * Adds profound depth to the global background by moving layers at different speeds.
 */
(function () {
  'use strict';

  function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (parallaxElements.length === 0) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          
          parallaxElements.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
          });
          
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Hook into global scope
  window.initParallax = initParallax;
  
  // Run on load
  initParallax();

})();
