/* ============================================================
   Scroll Reveal Animations — AEGIS-X
   ============================================================ */

(function () {
  'use strict';

  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // only animate once
      }
    });
  }, observerOptions);

  revealElements.forEach(function (el) {
    observer.observe(el);
  });

  // ── Stat Counter Animation ── 
  const statValues = document.querySelectorAll('[data-count-to]');

  if (statValues.length > 0) {
    const statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statValues.forEach(function (el) {
      statObserver.observe(el);
    });
  }

  function animateCounter(el) {
    const target = el.getAttribute('data-count-to');
    const prefix = el.getAttribute('data-count-prefix') || '';
    const suffix = el.getAttribute('data-count-suffix') || '';
    const isFloat = target.includes('.');
    const targetNum = parseFloat(target);
    const duration = 1200;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * targetNum;

      if (isFloat) {
        el.textContent = prefix + current.toFixed(1) + suffix;
      } else {
        el.textContent = prefix + Math.round(current) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }

    requestAnimationFrame(update);
  }
})();
