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
    const url  = COMPONENT_DIR + name + '.html?v=' + Date.now();

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
  }

  function loadScript(src) {
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    document.body.appendChild(s);
  }
})();
