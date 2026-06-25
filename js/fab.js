(function() {
  'use strict';

  const fabBtn = document.getElementById('fab-open-btn');
  const fabModal = document.getElementById('fab-modal');
  const fabCloseBtn = document.getElementById('fab-close-btn');
  const fabBackdrop = document.getElementById('fab-backdrop');
  const fabForm = document.getElementById('fab-briefing-form');
  const fabSuccess = document.getElementById('fab-success-msg');

  if (!fabBtn || !fabModal) return;

  function openModal() {
    fabModal.classList.add('fab-modal--active');
  }

  function closeModal() {
    fabModal.classList.remove('fab-modal--active');
    // Reset form after a delay so the user doesn't see it reset before closing
    setTimeout(() => {
      if(fabForm) fabForm.style.display = 'block';
      if(fabSuccess) fabSuccess.style.display = 'none';
      if(fabForm) fabForm.reset();
    }, 400);
  }

  fabBtn.addEventListener('click', openModal);
  if (fabCloseBtn) fabCloseBtn.addEventListener('click', closeModal);
  if (fabBackdrop) fabBackdrop.addEventListener('click', closeModal);

  if (fabForm) {
    fabForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // Basic validation is handled by HTML5 required attribute
      const submitBtn = fabForm.querySelector('.form__submit');
      if (submitBtn) {
        submitBtn.textContent = 'SUBMITTING...';
        submitBtn.disabled = true;
      }
      const formData = new FormData(fabForm);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
      .then(async (response) => {
        if (response.status == 200) {
          // Show success
          fabForm.style.display = 'none';
          if(fabSuccess) fabSuccess.style.display = 'block';

          // Auto close after 3 seconds
          setTimeout(closeModal, 3000);
        } else {
          let json = await response.json();
          console.log(response, json);
          if (submitBtn) {
            submitBtn.textContent = 'Submit Request';
            submitBtn.disabled = false;
          }
          alert('Something went wrong. Please try again.');
        }
      })
      .catch(error => {
        console.log(error);
        if (submitBtn) {
          submitBtn.textContent = 'Submit Request';
          submitBtn.disabled = false;
        }
        alert('Something went wrong. Please try again.');
      });
    });
  }
})();
