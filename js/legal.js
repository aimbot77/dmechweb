(function() {
  'use strict';

  const privacyLink = document.getElementById('link-privacy');
  const termsLink = document.getElementById('link-terms');
  const modal = document.getElementById('legal-modal');
  const closeBtn = document.getElementById('legal-close');
  const backdrop = document.getElementById('legal-backdrop');
  const titleEl = document.getElementById('legal-title');
  const bodyEl = document.getElementById('legal-body');

  if (!modal) return;

  function openModal(title, content) {
    titleEl.textContent = title;
    bodyEl.innerHTML = content;
    modal.classList.add('legal-modal--active');
  }

  function closeModal() {
    modal.classList.remove('legal-modal--active');
  }

  if (privacyLink) {
    privacyLink.addEventListener('click', function(e) {
      e.preventDefault();
      openModal('Privacy Policy', '<p>Without permission using any information is prohibited.</p>');
    });
  }

  if (termsLink) {
    termsLink.addEventListener('click', function(e) {
      e.preventDefault();
      openModal('Terms of Use', '<p>By accessing or using the AEGIS-X platform, you agree to be bound by these terms. This system is for authorized defense personnel only. Unauthorized access, reverse engineering, or distribution of any materials found on this site is strictly prohibited.</p>');
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
})();
