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

  // ── Section Active/In-View Observer for Infinite Animations ──
  const activeObserverOptions = {
    root: null,
    rootMargin: '100px 0px 100px 0px', // start slightly early and end slightly late
    threshold: 0.01
  };

  const activeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, activeObserverOptions);

  const sections = document.querySelectorAll('section, header, footer, .global-bg, .hero, .project-video');
  sections.forEach(function (section) {
    activeObserver.observe(section);
  });
})();
