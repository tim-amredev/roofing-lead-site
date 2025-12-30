/**
 * Questionnaire Form Handler with UrLeads Integration
 * * This script handles the multi-step form navigation and submits
 * lead data to the UrLeads API endpoint.
 * * SECURITY: No API keys are exposed in this file. Authentication is
 * handled server-side via domain validation (Origin/Referer headers).
 * * @version 3.2.0
 * @author UrLeads Integration
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // URLEADS API CONFIGURATION
  // =========================================================================
  
  const URLEADS_CONFIG = {
    // API endpoint URL
    apiUrl: 'https://urleads.com/wp-json/urleads/v1/lead',
    
    // Source site identifier (used for tracking/categorization)
    sourceSite: 'InstantRoofingPrices.com',
    
    // Lead category
    category: 'roofing',
    
    // Request timeout in milliseconds
    timeout: 30000,
    
    // Enable debug logging (set to false in production)
    debug: true
  };

  // =========================================================================
  // PRICING DATA (matches thank-you-quote.js)
  // =========================================================================
  
  const PRICING = {
    materials: {
      asphalt: { low: 4.5, high: 7.5, name: "Asphalt Shingles" },
      premium: { low: 6.5, high: 11.0, name: "Premium Shingles" },
      metal: { low: 9.0, high: 17.0, name: "Metal Roofing" },
      wood: { low: 8.0, high: 15.0, name: "Wood Shingles" },
      tile: { low: 13.0, high: 27.0, name: "Clay/Concrete Tile" },
      slate: { low: 20.0, high: 45.0, name: "Slate" },
      other: { low: 5.0, high: 10.0, name: "Other" }
    },
    roofSizes: {
      "less-1000": { min: 800, max: 1000 },
      "1000-1500": { min: 1000, max: 1500 },
      "1501-2000": { min: 1501, max: 2000 },
      "2001-2500": { min: 2001, max: 2500 },
      "2500+": { min: 2500, max: 3500 },
      "unknown": { min: 1500, max: 2000 }
    },
    pitchMultipliers: {
      flat: 1.0,
      gabled: 1.2,
      hip: 1.3,
      mansard: 1.4,
      gambrel: 1.35,
      other: 1.2
    }
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
    errorDiv.className = 'urleads-error-message';
    errorDiv.style.cssText = `
      background-color: #fee2e2;
      border: 1px solid #ef4444;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
    
    errorDiv.innerHTML = `
      <span><strong>Submission Error</strong> ${message}</span>
      <button type="button" onclick="this.parentElement.remove()" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:18px;">&times;</button>
    `;

    // Insert at the top of the current step
    const currentStepElement = steps[currentStep];
    if (currentStepElement) {
      currentStepElement.insertBefore(errorDiv, currentStepElement.firstChild);
    }

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorDiv.parentElement) {
        errorDiv.remove();
      }
    }, 10000);
  }

  /**
   * Get value of selected radio button
   */
  function getRadioValue(name) {
    const selected = form.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : '';
  }

  /**
   * Get array of checked checkbox values
   */
  function getCheckedValues(name) {
    const checked = form.querySelectorAll(`input[name="${name}[]"]:checked, input[name="${name}"]:checked`);
    return Array.from(checked).map(cb => cb.value);
  }

  // =========================================================================
  // PRICE CALCULATION
  // =========================================================================

  /**
   * Calculate estimated price based on form data
   * Returns an object with low, high, and average estimates
   */
  function calculatePrice(formData) {
    // Get material pricing
    const material = formData.desired_material || formData.current_material || 'asphalt';
    const materialInfo = PRICING.materials[material] || PRICING.materials.asphalt;

    // Get roof size range
    const sizeKey = formData.square_footage || '1501-2000';
    const sizeRange = PRICING.roofSizes[sizeKey] || PRICING.roofSizes['1501-2000'];
    
    // Use midpoint of size range for consistent pricing
    const area = Math.floor((sizeRange.min + sizeRange.max) / 2);

    // Get pitch multiplier based on roof type
    const roofType = formData.roof_type || 'gabled';
    const pitchMultiplier = PRICING.pitchMultipliers[roofType] || PRICING.pitchMultipliers.gabled;

    // Calculate base cost
    let lowBase = area * materialInfo.low * pitchMultiplier;
    let highBase = area * materialInfo.high * pitchMultiplier;

    // Add complexity factor based on issues
    const issues = Array.isArray(formData.issues) ? formData.issues : [formData.issues].filter(Boolean);
    if (issues.includes('leaks') || issues.includes('sagging')) {
      lowBase *= 1.15;
      highBase *= 1.15;
    }

    // Add features cost
    const features = Array.isArray(formData.features) ? formData.features : [formData.features].filter(Boolean);
    if (features.length > 0 && !features.includes('none')) {
      const featureMultiplier = 1 + Math.min(features.length, 4) * 0.05;
      lowBase *= featureMultiplier;
      highBase *= featureMultiplier;
    }

    // Ensure minimum project cost
    const minCost = 5000;
    lowBase = Math.max(lowBase, minCost);
    highBase = Math.max(highBase, minCost * 1.2);

    // Round to whole numbers
    const lowEstimate = Math.round(lowBase);
    const highEstimate = Math.round(highBase);
    const averageEstimate = Math.round((lowBase + highBase) / 2);

    return {
      low: lowEstimate,
      high: highEstimate,
      average: averageEstimate,
      area: area,
      material: materialInfo.name,
      formatted: {
        low: lowEstimate.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
        high: highEstimate.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
        average: averageEstimate.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
      }
    };
  }

  // =========================================================================
  // FORM NAVIGATION
  // =========================================================================

  /**
   * Show a specific step
   */
  function showStep(stepIndex) {
    steps.forEach((step, index) => {
      step.classList.toggle("hidden", index !== stepIndex);
    });

    // Update progress bar
    const progress = ((stepIndex + 1) / totalSteps) * 100;
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    if (progressText) {
      progressText.textContent = `${Math.round(progress)}%`;
    }
    if (currentStepText) {
      currentStepText.textContent = `Step ${stepIndex + 1} of ${totalSteps}`;
    }

    // Update button visibility
    if (prevBtn) {
      prevBtn.classList.toggle("hidden", stepIndex === 0);
    }
    if (nextBtn) {
      nextBtn.classList.toggle("hidden", stepIndex === totalSteps - 1);
    }
    if (submitBtn) {
      submitBtn.classList.toggle("hidden", stepIndex !== totalSteps - 1);
    }

    debugLog(`Showing step ${stepIndex + 1} of ${totalSteps}`);
  }

  /**
   * Validate current step before proceeding
   */
  function validateCurrentStep() {
    const currentStepElement = steps[currentStep];
    const requiredInputs = currentStepElement.querySelectorAll('[required]');
    
    for (const input of requiredInputs) {
      if (!input.value.trim()) {
        input.focus();
        return false;
      }
    }
    
    // Check for radio button groups
    const radioGroups = currentStepElement.querySelectorAll('input[type="radio"][required]');
    const groupNames = new Set();
    radioGroups.forEach(radio => groupNames.add(radio.name));
    
    for (const name of groupNames) {
      if (!form.querySelector(`input[name="${name}"]:checked`)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Move to next step
   */
  function nextStep() {
    if (currentStep < totalSteps - 1) {
      if (validateCurrentStep()) {
        currentStep++;
        showStep(currentStep);
        window.scrollTo(0, 0);
      }
    }
  }

  /**
   * Move to previous step
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
  // IMAGE CARD SELECTION HANDLERS
  // =========================================================================

  // Track selected values
  let selectedDesiredMaterial = '';
  let selectedRoofType = '';

  /**
   * Handle material card selection (Question 5)
   */
  const materialCards = document.querySelectorAll('.material-card');
  
  materialCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Remove selected state from all cards
      materialCards.forEach(c => {
        const innerDiv = c.querySelector('div');
        if (innerDiv) {
          // Remove selection styles
          innerDiv.style.borderColor = '';
          innerDiv.style.borderWidth = '';
          innerDiv.style.backgroundColor = '';
          innerDiv.style.transform = '';
          innerDiv.style.boxShadow = '';
        }
      });
      
      // Add selected state to clicked card
      const innerDiv = card.querySelector('div');
      if (innerDiv) {
        // Apply prominent selection styles
        innerDiv.style.borderColor = '#3b82f6';
        innerDiv.style.borderWidth = '3px';
        innerDiv.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
        innerDiv.style.transform = 'scale(1.02)';
        innerDiv.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.5)';
      }
      
      // Store the selected value
      selectedDesiredMaterial = card.dataset.value || '';
      
      // Also update hidden input if it exists
      const hiddenInput = document.getElementById('desired_material');
      if (hiddenInput) {
        hiddenInput.value = selectedDesiredMaterial;
      }
      
      debugLog('Material selected:', selectedDesiredMaterial);
    });
  });

  /**
   * Handle roof type card selection (Question 6)
   */
  const roofTypeCards = document.querySelectorAll('.roof-type-card');
  
  roofTypeCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Remove selected state from all cards
      roofTypeCards.forEach(c => {
        const innerDiv = c.querySelector('div');
        if (innerDiv) {
          // Remove selection styles
          innerDiv.style.borderColor = '';
          innerDiv.style.borderWidth = '';
          innerDiv.style.backgroundColor = '';
          innerDiv.style.transform = '';
          innerDiv.style.boxShadow = '';
        }
      });
      
      // Add selected state to clicked card
      const innerDiv = card.querySelector('div');
      if (innerDiv) {
        // Apply prominent selection styles
        innerDiv.style.borderColor = '#3b82f6';
        innerDiv.style.borderWidth = '3px';
        innerDiv.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
        innerDiv.style.transform = 'scale(1.02)';
        innerDiv.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.5)';
      }
      
      // Store the selected value
      selectedRoofType = card.dataset.value || '';
      
      // Also update hidden input if it exists
      const hiddenInput = document.getElementById('roof_type');
      if (hiddenInput) {
        hiddenInput.value = selectedRoofType;
      }
      
      debugLog('Roof type selected:', selectedRoofType);
    });
  });

  // =========================================================================
  // FORM DATA COLLECTION
  // =========================================================================

  /**
   * Collect and format form data for API submission
   */
  function collectFormData() {
    // Get desired_material and roof_type from multiple sources
    const desiredMaterial = selectedDesiredMaterial || 
                            document.getElementById('desired_material')?.value || 
                            getRadioValue('desired_material') || 
                            '';
    
    const roofType = selectedRoofType || 
                     document.getElementById('roof_type')?.value || 
                     getRadioValue('roof_type') || 
                     '';

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
      desired_material: desiredMaterial,
      roof_type: roofType,
      issues: getCheckedValues('issues'),
      features: getCheckedValues('features'),
      timeframe: getRadioValue('timeframe'),
      budget: getRadioValue('budget'),
      referral: getRadioValue('referral'),
      comments: form.querySelector('#comments')?.value?.trim() || '',
      
      // Consent fields (boolean)
      sms_consent: form.querySelector('input[name="sms_consent"]')?.checked || false,
      terms_accepted: form.querySelector('input[name="terms"]')?.checked || false,
      
      // Honeypot field - should always be empty for real users
      website_url: form.querySelector('input[name="website_url"]')?.value || '',
      
      // Source information
      source_site: URLEADS_CONFIG.sourceSite,
      category: URLEADS_CONFIG.category
    };

    // Calculate and add price estimate
    const priceEstimate = calculatePrice(data);
    data.estimated_price_low = priceEstimate.low;
    data.estimated_price_high = priceEstimate.high;
    data.estimated_price_average = priceEstimate.average;
    data.estimated_area = priceEstimate.area;

    debugLog('Collected form data:', data);
    debugLog('Price estimate:', priceEstimate);
    
    return data;
  }

  // =========================================================================
  // FORM VALIDATION
  // =========================================================================

  /**
   * Validate all required fields before submission
   */
  function validateFormData(data) {
    const requiredFields = [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email Address' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'street_address', label: 'Street Address' },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State' },
      { key: 'zip_code', label: 'Zip Code' }
    ];

    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!data[field.key] || data[field.key].trim() === '') {
        missingFields.push(field.label);
      }
    }

    // Validate email format
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }

    // Validate phone (10 digits)
    if (data.phone && data.phone.length !== 10) {
      return { valid: false, message: 'Please enter a valid 10-digit phone number.' };
    }

    // Validate zip code (5 digits)
    if (data.zip_code && !/^\d{5}$/.test(data.zip_code)) {
      return { valid: false, message: 'Please enter a valid 5-digit zip code.' };
    }

    if (missingFields.length > 0) {
      return { 
        valid: false, 
        message: `Please fill in all required fields: ${missingFields.join(', ')}` 
      };
    }

    return { valid: true };
  }

  // =========================================================================
  // API SUBMISSION
  // =========================================================================

  /**
   * Submit lead data to UrLeads API
   * No API key required - authentication is done via domain validation
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
      
      debugLog('Form submission initiated');

      // Collect form data
      const leadData = collectFormData();

      // Validate form data
      const validation = validateFormData(leadData);
      if (!validation.valid) {
        showErrorMessage(validation.message);
        return;
      }

      // Show loading state
      setButtonLoading(submitBtn, true);

      try {
        // Store form data in localStorage for thank-you page
        const formDataForThankYou = {
          name: `${leadData.first_name} ${leadData.last_name}`.trim(),
          desired_material: leadData.desired_material,
          roof_type: leadData.roof_type,
          square_footage: leadData.square_footage,
          issues: leadData.issues,
          features: leadData.features
        };
        localStorage.setItem('roofingFormData', JSON.stringify(formDataForThankYou));

        // Submit to UrLeads API
        const response = await submitToUrLeads(leadData);

        debugLog('Submission successful:', response);

        // Redirect to thank you page
        window.location.href = '/thank-you';

      } catch (error) {
        debugLog('Submission error:', error);

        // Show user-friendly error message
        let errorMessage = 'An error occurred while submitting your request. Please try again.';
        
        if (error.message) {
          errorMessage = error.message;
        }

        showErrorMessage(errorMessage);

      } finally {
        // Reset button state
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // =========================================================================
  // KEYBOARD NAVIGATION
  // =========================================================================

  // Allow Enter key to proceed to next step (except on textareas)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      const isLastStep = currentStep === totalSteps - 1;
      
      if (!isLastStep && !e.target.closest('button')) {
        e.preventDefault();
        nextStep();
      }
    }
  });

  debugLog('Questionnaire initialized', { 
    totalSteps, 
    apiUrl: URLEADS_CONFIG.apiUrl,
    materialCards: materialCards.length,
    roofTypeCards: roofTypeCards.length
  });
});
