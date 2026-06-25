/* ============================================================
   Navigation Behavior — AEGIS-X
   ============================================================ */

(function () {
  'use strict';

  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('.nav__mobile-menu');
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('[data-nav-section]');

  if (!nav) return;

  // ── Scroll: transparent → solid ── 
  let lastScroll = 0;
  function handleScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 80) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // initial check

  // ── Mobile toggle ── 
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('nav__toggle--active');
      mobileMenu.classList.toggle('nav__mobile-menu--open');
      document.body.style.overflow = mobileMenu.classList.contains('nav__mobile-menu--open')
        ? 'hidden'
        : '';
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('nav__toggle--active');
        mobileMenu.classList.remove('nav__mobile-menu--open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Active link tracking via IntersectionObserver ── 
  if (sections.length > 0 && navLinks.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-nav-section');
          navLinks.forEach(function (link) {
            link.classList.remove('nav__link--active');
            if (link.getAttribute('href') === '#' + sectionId) {
              link.classList.add('nav__link--active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // ── Smooth scroll for anchor links ── 
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = nav.offsetHeight + 3; // nav height + tricolor
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
})();
