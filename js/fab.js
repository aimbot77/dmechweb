(function() {
  'use strict';

  const fabBtn = document.getElementById('fab-open-btn');

  if (!fabBtn) return;

  fabBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
})();
