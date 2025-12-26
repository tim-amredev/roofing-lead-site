/**
 * UrLeads Integration for InstantRoofingPrices.com
 * 
 * This module handles form submission to the UrLeads API endpoint.
 * It replaces the previous LeadConduit integration with a cleaner,
 * more robust implementation.
 * 
 * @version 1.0.1
 * @author UrLeads Integration
 */

(function() {
    'use strict';

    // =========================================================================
    // CONFIGURATION
    // =========================================================================
    
    /**
     * UrLeads API Configuration
     */
    const URLEADS_CONFIG = {
        // API endpoint URL
        apiUrl: 'https://urleads.com/wp-json/urleads/v1/lead',
        
        // API key for authentication
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
    // UTILITY FUNCTIONS
    // =========================================================================

    /**
     * Log debug messages if debug mode is enabled
     * @param {string} message - Message to log
     * @param {*} data - Optional data to log
     */
    function debugLog(message, data = null) {
        if (URLEADS_CONFIG.debug) {
            console.log(`[UrLeads] ${message}`, data || '');
        }
    }

    /**
     * Log error messages
     * @param {string} message - Error message
     * @param {*} error - Error object or data
     */
    function logError(message, error = null) {
        console.error(`[UrLeads] ERROR: ${message}`, error || '');
    }

    /**
     * Generate a unique submission ID for idempotency
     * @param {Object} formData - Form data object
     * @returns {string} Unique submission ID
     */
    function generateSubmissionId(formData) {
        const data = [
            formData.email || '',
            formData.phone || '',
            formData.street_address || '',
            new Date().toISOString().slice(0, 13) // Hour precision
        ].join('|');
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return 'lead_' + Math.abs(hash).toString(16).padStart(16, '0');
    }

    /**
     * Format phone number to digits only (10 digits)
     * @param {string} phone - Phone number
     * @returns {string} Formatted phone number
     */
    function formatPhone(phone) {
        if (!phone) return '';
        return phone.replace(/\D/g, '').slice(0, 10);
    }

    /**
     * Show loading state on submit button
     * @param {HTMLElement} button - Submit button element
     * @param {boolean} loading - Loading state
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
     * @param {string} message - Error message
     * @param {HTMLElement} form - Form element
     */
    function showErrorMessage(message, form) {
        // Remove any existing error messages
        const existingError = form.querySelector('.urleads-error-message');
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

        // Insert at the top of the form
        form.insertBefore(errorDiv, form.firstChild);

        // Scroll to error message
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // =========================================================================
    // FORM DATA COLLECTION
    // =========================================================================

    /**
     * Collect all checked values for a checkbox group
     * @param {HTMLFormElement} form - Form element
     * @param {string} name - Checkbox group name
     * @returns {Array} Array of checked values
     */
    function getCheckedValues(form, name) {
        const checkboxes = form.querySelectorAll(`input[name="${name}"]:checked, input[name="${name}[]"]:checked`);
        return Array.from(checkboxes).map(cb => cb.value);
    }

    /**
     * Get selected radio value
     * @param {HTMLFormElement} form - Form element
     * @param {string} name - Radio group name
     * @returns {string} Selected value or empty string
     */
    function getRadioValue(form, name) {
        const selected = form.querySelector(`input[name="${name}"]:checked`);
        return selected ? selected.value : '';
    }

    /**
     * Collect and format form data for API submission
     * Matches the exact API documentation format
     * @param {HTMLFormElement} form - Form element
     * @returns {Object} Formatted form data matching API spec
     */
    function collectFormData(form) {
        // Get form field values - matching API required fields exactly
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
            reason: getRadioValue(form, 'reason'),
            roof_age: getRadioValue(form, 'roof_age'),
            square_footage: getRadioValue(form, 'square_footage'),
            current_material: getRadioValue(form, 'current_material'),
            desired_material: form.querySelector('#desired_material')?.value || getRadioValue(form, 'desired_material'),
            roof_type: form.querySelector('#roof_type')?.value || getRadioValue(form, 'roof_type'),
            issues: getCheckedValues(form, 'issues'),
            features: getCheckedValues(form, 'features'),
            timeframe: getRadioValue(form, 'timeframe'),
            budget: getRadioValue(form, 'budget'),
            referral: getRadioValue(form, 'referral'),
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
     * @param {Object} leadData - Lead data to submit
     * @returns {Promise<Object>} API response
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
                // Handle API error response
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

    /**
     * Main form submission handler
     * @param {Event} event - Form submit event
     */
    async function handleFormSubmission(event) {
        // Prevent default form submission
        event.preventDefault();

        const form = event.target;
        const submitButton = form.querySelector('#submit-btn');

        debugLog('Form submission started');

        // Show loading state
        setButtonLoading(submitButton, true);

        // Remove any existing error messages
        const existingError = form.querySelector('.urleads-error-message');
        if (existingError) {
            existingError.remove();
        }

        try {
            // Collect form data
            const leadData = collectFormData(form);

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
            logError('Form submission failed:', error);

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
                window.location.href = '/thank-you';
                return;
            } else if (error.message) {
                userMessage = error.message;
            }

            showErrorMessage(userMessage, form);

        } finally {
            // Reset button state
            setButtonLoading(submitButton, false);
        }
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    /**
     * Initialize the UrLeads integration
     */
    function init() {
        debugLog('Initializing UrLeads integration...');

        // Find the questionnaire form
        const form = document.getElementById('questionnaire-form');
        
        if (!form) {
            debugLog('Questionnaire form not found on this page');
            return;
        }

        // Remove the old onsubmit handler if present
        form.removeAttribute('onsubmit');

        // Update form action to prevent fallback submission
        form.setAttribute('action', '#');
        form.setAttribute('method', 'POST');

        // Add our submission handler
        form.addEventListener('submit', handleFormSubmission);

        debugLog('UrLeads integration initialized successfully');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose configuration for external updates if needed
    window.UrLeadsConfig = URLEADS_CONFIG;

})();
