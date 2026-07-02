/**
 * SPA Transitions — AEGIS-X / D-mechatroniX
 * Handles smooth switching between Company View and AegisX Product View.
 */
(function () {
  'use strict';

  function initTransitions() {
    const btnEnterAegisX = document.getElementById('btn-enter-aegisx');
    const btnEnterAegisXMobile = document.getElementById('btn-enter-aegisx-mobile');
    const btnBackCompany = document.getElementById('btn-back-company');
    
    const viewCompany = document.getElementById('view-company');
    const viewAegisX = document.getElementById('view-aegisx');

    if (!viewCompany || !viewAegisX) return;

    function showAegisX(e) {
      if(e) e.preventDefault();
      
      // Animate out company view
      viewCompany.classList.remove('view--active');
      viewCompany.classList.add('view--hidden');
      
      // Wait for out animation to finish before hiding and showing next
      setTimeout(() => {
        viewCompany.style.display = 'none';
        
        viewAegisX.style.display = 'block';
        // Force reflow
        void viewAegisX.offsetWidth;
        
        viewAegisX.classList.remove('view--hidden');
        viewAegisX.classList.add('view--active');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300); // Wait half of the CSS transition duration
    }

    function showCompany(e) {
      if(e) e.preventDefault();
      
      // Animate out aegisx view
      viewAegisX.classList.remove('view--active');
      viewAegisX.classList.add('view--hidden');
      
      setTimeout(() => {
        viewAegisX.style.display = 'none';
        
        viewCompany.style.display = 'block';
        // Force reflow
        void viewCompany.offsetWidth;
        
        viewCompany.classList.remove('view--hidden');
        viewCompany.classList.add('view--active');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }

    if (btnEnterAegisX) btnEnterAegisX.addEventListener('click', showAegisX);
    if (btnEnterAegisXMobile) btnEnterAegisXMobile.addEventListener('click', showAegisX);
    if (btnBackCompany) btnBackCompany.addEventListener('click', showCompany);
    
    const btnEnterAegisXImg = document.getElementById('btn-enter-aegisx-img');
    if (btnEnterAegisXImg) btnEnterAegisXImg.addEventListener('click', showAegisX);
  }

  // If DOM is already loaded (because it's injected by component-loader), run now
  initTransitions();

  // Also expose globally just in case component-loader re-runs it
  window.initSpaTransitions = initTransitions;

})();
