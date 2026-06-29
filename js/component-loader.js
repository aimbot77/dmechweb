/**
 * Component Loader — AEGIS-X
 * Loads HTML partials from /components/ into the page shell.
 * Each <div data-component="name"> is replaced with the contents
 * of components/name.html. Scripts are re-initialized after load.
 */
(function () {
  'use strict';

  const COMPONENT_DIR = 'components/';

  // Ordered list matches the data-component attributes in index.html
  const slots = document.querySelectorAll('[data-component]');
  let loaded = 0;

  slots.forEach(function (slot) {
    const name = slot.getAttribute('data-component');
    const url  = COMPONENT_DIR + name + '.html?v=7';

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error(name + ' → ' + res.status);
        return res.text();
      })
      .then(function (html) {
        slot.innerHTML = html;
        loaded++;
        if (loaded === slots.length) onAllLoaded();
      })
      .catch(function (err) {
        console.error('[ComponentLoader]', err);
        slot.innerHTML = '<!-- failed to load ' + name + ' -->';
        loaded++;
        if (loaded === slots.length) onAllLoaded();
      });
  });

  /** Called once every component partial has been injected */
  function onAllLoaded() {
    // Re-run scripts that depend on DOM content
    loadScript('js/radar-canvas.js');
    loadScript('js/nav.js');
    loadScript('js/scroll-animations.js');
    loadScript('js/form.js');
    loadScript('js/team.js');
    loadScript('js/fab.js');
    loadScript('js/legal.js');

    // Initialize architecture video click-to-play
    setupArchitectureDemoVideo();

    // Initialize lazy video playback for hero video
    setupLazyHeroVideo();

    // Load Web3Forms captcha script
    loadScript('https://web3forms.com/client/script.js');
  }

  function setupArchitectureDemoVideo() {
    const demoVideoArea = document.getElementById('demo-video-area');
    const demoVideo = document.getElementById('architecture-demo-video');
    const demoOverlay = document.getElementById('demo-video-overlay');

    if (demoVideoArea && demoVideo && demoOverlay) {
      demoVideoArea.addEventListener('click', function () {
        demoOverlay.style.display = 'none';
        demoVideoArea.classList.add('video-active');
        demoVideo.controls = true;
        demoVideo.play().catch(function (err) {
          console.error("Video play failed:", err);
        });
      }, { once: true });
    }
  }

  /** Play the hero video only when it's visible in the viewport */
  function setupLazyHeroVideo() {
    var heroVideo = document.getElementById('project-hero-video');
    if (!heroVideo) return;

    if ('IntersectionObserver' in window) {
      var videoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            heroVideo.play().catch(function () {});
          } else {
            heroVideo.pause();
          }
        });
      }, { threshold: 0.1 });
      videoObserver.observe(heroVideo);
    } else {
      // Fallback: just play it
      heroVideo.play().catch(function () {});
    }
  }

  function loadScript(src) {
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    document.body.appendChild(s);
  }
})();
