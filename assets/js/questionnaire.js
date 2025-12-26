/**
 * Questionnaire Form Handler with UrLeads Integration
 * 
 * This script handles the multi-step form navigation and submits
 * lead data to the UrLeads API endpoint.
 * 
 * @version 2.0.0
 * @author UrLeads Integration
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // URLEADS API CONFIGURATION
  // =========================================================================
  
  const URLEADS_CONFIG = {
    // API endpoint URL
    apiUrl: 'https://urleads.com/wp-json/urleads/v1/lead',
    
    // API key for authentication (sent via X-API-Key header)
    apiKey: 'B6OEDSNOko33XGW4I3KIC46Jsr7vn1uH',
    
    // Source site identifier
    sourceSite: 'InstantRoofingPrices.com',
    
    // Lead category
    category: 'roofing',
    
    // Request timeout in milliseconds
    timeout: 30000,
    
    // Enable debug logging (set to false in production)
    debug: false
  };

  // =========================================================================
  // DOM ELEMENTS
  // =========================================================================
  
  const form = document.getElementById("questionnaire-form");
  const steps = document.querySelectorAll(".questionnaire-step");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const currentStepText = document.getElementById("current-step");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const submitBtn = document.getElementById("submit-btn");

  let currentStep = 0;
  const totalSteps = steps.length;

  // =========================================================================
  // UTILITY FUNCTIONS
  // =========================================================================

  /**
   * Log debug messages if debug mode is enabled
   */
  function debugLog(message, data = null) {
    if (URLEADS_CONFIG.debug) {
      console.log(`[UrLeads] ${message}`, data || '');
    }
  }

  /**
   * Format phone number to digits only (10 digits)
   */
  function formatPhone(phone) {
    if (!phone) return '';
    return phone.replace(/\D/g, '').slice(0, 10);
  }

  /**
   * Show loading state on submit button
   */
  function setButtonLoading(button, loading) {
    if (!button) return;
    
    if (loading) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = `
        <svg class="animate-spin h-5 w-5 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Submitting...
      `;
    } else {
      button.disabled = false;
      if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
      }
    }
  }

  /**
   * Show error message to user
   */
  function showErrorMessage(message) {
    // Remove any existing error messages
    const existingError = document.querySelector('.urleads-error-message');
    if (existingError) {
      existingError.remove();
    }

    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'urleads-error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.innerHTML = `
      <strong class="font-bold">Submission Error</strong>
      <span class="block sm:inline">${message}</span>
      <button type="button" class="absolute top-0 bottom-0 right-0 px-4 py-3" onclick="this.parentElement.remove()">
        <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <title>Close</title>
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
        </svg>
      </button>
    `;

    // Insert at the top of the current step
    const currentStepElement = steps[currentStep];
    if (currentStepElement) {
      currentStepElement.insertBefore(errorDiv, currentStepElement.firstChild);
    } else if (form) {
      form.insertBefore(errorDiv, form.firstChild);
    }

    // Scroll to error message
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * Get selected radio value
   */
  function getRadioValue(name) {
    const selected = form.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : '';
  }

  /**
   * Get all checked checkbox values
   */
  function getCheckedValues(name) {
    const checkboxes = form.querySelectorAll(`input[name="${name}"]:checked, input[name="${name}[]"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
  }

  // =========================================================================
  // MATERIAL AND ROOF TYPE CARD INITIALIZATION
  // =========================================================================

  // Initialize material cards
  const materialCards = document.querySelectorAll(".material-card");
  materialCards.forEach((card) => {
    card.addEventListener("click", function () {
      materialCards.forEach((c) => c.classList.remove("selected"));
      this.classList.add("selected");
      const hiddenInput = document.getElementById("desired_material");
      if (hiddenInput) {
        hiddenInput.value = this.dataset.value;
      }
    });
  });

  // Initialize roof type cards
  const roofTypeCards = document.querySelectorAll(".roof-type-card");
  roofTypeCards.forEach((card) => {
    card.addEventListener("click", function () {
      roofTypeCards.forEach((c) => c.classList.remove("selected"));
      this.classList.add("selected");
      const hiddenInput = document.getElementById("roof_type");
      if (hiddenInput) {
        hiddenInput.value = this.dataset.value;
      }
    });
  });

  // =========================================================================
  // STEP NAVIGATION
  // =========================================================================

  /**
   * Show the current step
   */
  function showStep(stepIndex) {
    steps.forEach((step, index) => {
      if (index === stepIndex) {
        step.classList.remove("hidden");
        step.classList.add("fade-in");
      } else {
        step.classList.add("hidden");
        step.classList.remove("fade-in");
      }
    });

    // Update progress
    const progress = ((stepIndex + 1) / totalSteps) * 100;
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `Step ${stepIndex + 1} of ${totalSteps}`;
    if (currentStepText) currentStepText.textContent = stepIndex + 1;

    // Show/hide buttons
    if (prevBtn) {
      if (stepIndex === 0) {
        prevBtn.classList.add("hidden");
      } else {
        prevBtn.classList.remove("hidden");
      }
    }

    if (nextBtn && submitBtn) {
      if (stepIndex === totalSteps - 1) {
        nextBtn.classList.add("hidden");
        submitBtn.classList.remove("hidden");
      } else {
        nextBtn.classList.remove("hidden");
        submitBtn.classList.add("hidden");
      }
    }
  }

  /**
   * Go to next step
   */
  function nextStep() {
    if (currentStep < totalSteps - 1) {
      currentStep++;
      showStep(currentStep);
      window.scrollTo(0, 0);
    }
  }

  /**
   * Go to previous step
   */
  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
      window.scrollTo(0, 0);
    }
  }

  // Event listeners for navigation
  if (nextBtn) {
    nextBtn.addEventListener("click", nextStep);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", prevStep);
  }

  // Initialize the first step
  showStep(currentStep);

  // =========================================================================
  // FORM DATA COLLECTION
  // =========================================================================

  /**
   * Collect and format form data for API submission
   */
  function collectFormData() {
    const data = {
      // Required fields
      first_name: form.querySelector('#first_name')?.value?.trim() || '',
      last_name: form.querySelector('#last_name')?.value?.trim() || '',
      email: form.querySelector('#email')?.value?.trim() || '',
      phone: formatPhone(form.querySelector('#phone')?.value || ''),
      street_address: form.querySelector('#street_address')?.value?.trim() || '',
      city: form.querySelector('#city')?.value?.trim() || '',
      state: form.querySelector('#state')?.value?.trim() || '',
      zip_code: form.querySelector('#zip_code')?.value?.trim() || '',
      
      // Optional questionnaire fields
      reason: getRadioValue('reason'),
      roof_age: getRadioValue('roof_age'),
      square_footage: getRadioValue('square_footage'),
      current_material: getRadioValue('current_material'),
      desired_material: form.querySelector('#desired_material')?.value || getRadioValue('desired_material'),
      roof_type: form.querySelector('#roof_type')?.value || getRadioValue('roof_type'),
      issues: getCheckedValues('issues'),
      features: getCheckedValues('features'),
      timeframe: getRadioValue('timeframe'),
      budget: getRadioValue('budget'),
      referral: getRadioValue('referral'),
      comments: form.querySelector('#comments')?.value?.trim() || '',
      
      // Consent fields (boolean)
      sms_consent: form.querySelector('input[name="sms_consent"]')?.checked || false,
      terms_accepted: form.querySelector('input[name="terms"]')?.checked || false,
      
      // Source information
      source_site: URLEADS_CONFIG.sourceSite,
      category: URLEADS_CONFIG.category
    };

    debugLog('Collected form data:', data);
    return data;
  }

  // =========================================================================
  // API SUBMISSION
  // =========================================================================

  /**
   * Submit lead data to UrLeads API
   */
  async function submitToUrLeads(leadData) {
    debugLog('Submitting to UrLeads API...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), URLEADS_CONFIG.timeout);

    try {
      const response = await fetch(URLEADS_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': URLEADS_CONFIG.apiKey,
          'Accept': 'application/json'
        },
        body: JSON.stringify(leadData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      debugLog('API Response:', responseData);
      return responseData;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }

      throw error;
    }
  }

  // =========================================================================
  // FORM SUBMISSION HANDLER
  // =========================================================================

  if (form) {
    form.addEventListener("submit", async (e) => {
      // Prevent default form submission
      e.preventDefault();

      debugLog('Form submission started');

      // Show loading state
      setButtonLoading(submitBtn, true);

      // Remove any existing error messages
      const existingError = document.querySelector('.urleads-error-message');
      if (existingError) {
        existingError.remove();
      }

      try {
        // Collect form data
        const leadData = collectFormData();

        // Validate required fields
        const requiredFields = [
          { key: 'first_name', label: 'First Name' },
          { key: 'last_name', label: 'Last Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'street_address', label: 'Street Address' },
          { key: 'city', label: 'City' },
          { key: 'state', label: 'State' },
          { key: 'zip_code', label: 'Zip Code' }
        ];
        
        const missingFields = requiredFields.filter(field => !leadData[field.key]);
        
        if (missingFields.length > 0) {
          throw new Error(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(leadData.email)) {
          throw new Error('Please enter a valid email address.');
        }

        // Validate phone (10 digits)
        if (leadData.phone.length !== 10) {
          throw new Error('Please enter a valid 10-digit phone number.');
        }

        // Validate zip code (5 digits)
        if (!/^\d{5}$/.test(leadData.zip_code)) {
          throw new Error('Please enter a valid 5-digit zip code.');
        }

        // Store form data in localStorage for thank-you page
        localStorage.setItem('roofingFormData', JSON.stringify(leadData));

        // Submit to UrLeads API
        const response = await submitToUrLeads(leadData);

        if (response.success) {
          debugLog('Lead submitted successfully:', response);

          // Store submission confirmation
          localStorage.setItem('leadSubmissionId', response.submission_id || '');
          localStorage.setItem('leadId', response.lead_id || '');

          // Redirect to thank-you page
          window.location.href = '/thank-you';
        } else {
          throw new Error(response.message || 'Submission failed. Please try again.');
        }

      } catch (error) {
        console.error('[UrLeads] Form submission failed:', error);

        // Show user-friendly error message
        let userMessage = 'We encountered an issue submitting your request. Please try again.';
        
        if (error.message.includes('API key') || error.message.includes('Unauthorized')) {
          userMessage = 'Configuration error. Please contact support.';
        } else if (error.message.includes('timed out')) {
          userMessage = 'The request timed out. Please check your connection and try again.';
        } else if (error.message.includes('required fields') || error.message.includes('valid')) {
          userMessage = error.message;
        } else if (error.message.includes('duplicate') || error.message.includes('already been submitted')) {
          userMessage = 'This request has already been submitted. We will contact you shortly.';
          // Still redirect to thank you page for duplicates
          setTimeout(() => {
            window.location.href = '/thank-you';
          }, 2000);
        } else if (error.message) {
          userMessage = error.message;
        }

        showErrorMessage(userMessage);

      } finally {
        // Reset button state
        setButtonLoading(submitBtn, false);
      }
    });
  }

  debugLog('Questionnaire form initialized with UrLeads integration');
});
