/**
 * Team Section Interactive Modal Logic
 */

function initTeamModal() {
  const teamGrid = document.querySelector('.team__grid');
  if (!teamGrid) return; // Prevent errors if section isn't loaded yet

  const modal = document.querySelector('.team__modal');
  if (!modal) return;

  const modalClose = modal.querySelector('.team__modal-close');
  const modalBackdrop = modal.querySelector('.team__modal-backdrop');
  
  // Modal content elements
  const mName = modal.querySelector('.team__modal-name');
  const mRole = modal.querySelector('.team__modal-role');
  const mBio = modal.querySelector('.team__modal-bio');
  const mSocials = modal.querySelector('.team__modal-socials');

  // Add click listeners to all portraits
  const portraits = document.querySelectorAll('.team__portrait');
  
  portraits.forEach(portrait => {
    portrait.addEventListener('click', () => {
      const data = portrait.dataset;
      
      // Populate text content
      if (mName) mName.textContent = data.name || '';
      if (mRole) mRole.textContent = data.role || '';
      if (mBio) mBio.textContent = data.bio || '';
      
      // Populate socials
      if (mSocials) {
        mSocials.innerHTML = ''; // Clear previous
        
        // Helper to create an SVG icon link
        const addSocial = (url, svgPath) => {
          if (!url) return;
          const a = document.createElement('a');
          a.href = url;
          a.className = 'team__modal-social-link';
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>`;
          mSocials.appendChild(a);
        };

        // GitHub SVG
        addSocial(data.github, '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>');
        // LinkedIn SVG
        addSocial(data.linkedin, '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle>');
        // Instagram SVG
        addSocial(data.instagram, '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>');
      }

      // Show modal
      modal.classList.add('team__modal--active');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });
  });

  // Close logic
  const closeModal = () => {
    modal.classList.remove('team__modal--active');
    document.body.style.overflow = '';
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('team__modal--active')) {
      closeModal();
    }
  });
}

// Since components are loaded dynamically, this might be called from component-loader.js
// But just in case, we also try to init it on standard DOM content loaded.
document.addEventListener('DOMContentLoaded', initTeamModal);
