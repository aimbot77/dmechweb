/* ============================================================
   Contact Form Validation — AEGIS-X
   ============================================================ */

(function () {
  'use strict';

  const form = document.getElementById('briefing-form');
  if (!form) return;

  const fields = {
    name: { el: form.querySelector('#field-name'), required: true },
    org: { el: form.querySelector('#field-org'), required: true },
    designation: { el: form.querySelector('#field-designation'), required: true },
    email: { el: form.querySelector('#field-email'), required: true, type: 'email' },
    phone: { el: form.querySelector('#field-phone'), required: true, type: 'tel' },
    message: { el: form.querySelector('#field-message'), required: false },
  };

  const submitBtn = form.querySelector('.form__submit');
  const formContainer = form.closest('.contact__form');
  const successEl = document.querySelector('.contact__success');

  // Email and Phone validation patterns
  const emailPattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  const phonePattern = /^\+?[0-9\s\-()]{7,15}$/;

  // ── Validate single field ── 
  function validateField(key) {
    const field = fields[key];
    if (!field.el) return true;

    const value = field.el.value.trim();
    const errorEl = field.el.parentElement.querySelector('.form__error');
    let valid = true;

    // Required check
    if (field.required && !value) {
      valid = false;
      if (errorEl) {
        errorEl.textContent = 'This field is required.';
        errorEl.classList.add('form__error--visible');
      }
      field.el.classList.add('form__input--error');
    }
    // Email format check
    else if (field.type === 'email' && value && !emailPattern.test(value)) {
      valid = false;
      if (errorEl) {
        errorEl.textContent = 'Enter a valid official email address.';
        errorEl.classList.add('form__error--visible');
      }
      field.el.classList.add('form__input--error');
    }
    // Phone format check
    else if (field.type === 'tel' && value && !phonePattern.test(value)) {
      valid = false;
      if (errorEl) {
        errorEl.textContent = 'Enter a valid phone number.';
        errorEl.classList.add('form__error--visible');
      }
      field.el.classList.add('form__input--error');
    }
    // Clear errors
    else {
      if (errorEl) {
        errorEl.classList.remove('form__error--visible');
      }
      field.el.classList.remove('form__input--error');
    }

    return valid;
  }

  // ── Real-time validation on blur ── 
  Object.keys(fields).forEach(function (key) {
    if (fields[key].el) {
      fields[key].el.addEventListener('blur', function () {
        validateField(key);
      });

      // Clear error on input
      fields[key].el.addEventListener('input', function () {
        const errorEl = this.parentElement.querySelector('.form__error');
        if (errorEl) errorEl.classList.remove('form__error--visible');
        this.classList.remove('form__input--error');
      });
    }
  });

  // ── Submit ── 
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let allValid = true;
    Object.keys(fields).forEach(function (key) {
      if (!validateField(key)) allValid = false;
    });

    if (!allValid) return;

    // Check hCaptcha
    const hCaptchaResponse = form.querySelector('textarea[name="h-captcha-response"]');
    if (hCaptchaResponse && !hCaptchaResponse.value) {
      alert("Please complete the CAPTCHA challenge.");
      return;
    }

    submitBtn.textContent = 'SUBMITTING...';
    submitBtn.disabled = true;

    const formData = new FormData(form);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
    .then(async (response) => {
      if (response.status == 200) {
        if (formContainer) formContainer.style.display = 'none';
        if (successEl) successEl.classList.add('contact__success--visible');
      } else {
        let json = await response.json();
        console.log(response, json);
        submitBtn.textContent = 'Submit Request';
        submitBtn.disabled = false;
        alert('Something went wrong. Please try again.');
      }
    })
    .catch(error => {
      console.log(error);
      submitBtn.textContent = 'Submit Request';
      submitBtn.disabled = false;
      alert('Something went wrong. Please try again.');
    });
  });
})();
