document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("questionnaire-form")
  const steps = document.querySelectorAll(".questionnaire-step")
  const progressBar = document.getElementById("progress-bar")
  const progressText = document.getElementById("progress-text")
  const currentStepText = document.getElementById("current-step")
  const prevBtn = document.getElementById("prev-btn")
  const nextBtn = document.getElementById("next-btn")
  const submitBtn = document.getElementById("submit-btn")
  const thankYouModal = document.getElementById("thank-you-modal")
  const closeModalBtn = document.getElementById("close-modal")

  let currentStep = 0
  const totalSteps = steps.length

  // Initialize material cards
  const materialCards = document.querySelectorAll(".material-card")
  materialCards.forEach((card) => {
    card.addEventListener("click", function () {
      // Remove selected class from all cards
      materialCards.forEach((c) => c.classList.remove("selected"))

      // Add selected class to clicked card
      this.classList.add("selected")

      // Update hidden input
      document.getElementById("desired_material").value = this.dataset.value
    })
  })

  // Initialize roof type cards
  const roofTypeCards = document.querySelectorAll(".roof-type-card")
  roofTypeCards.forEach((card) => {
    card.addEventListener("click", function () {
      // Remove selected class from all cards
      roofTypeCards.forEach((c) => c.classList.remove("selected"))

      // Add selected class to clicked card
      this.classList.add("selected")

      // Update hidden input
      document.getElementById("roof_type").value = this.dataset.value
    })
  })

  // Show the current step
  function showStep(stepIndex) {
    steps.forEach((step, index) => {
      if (index === stepIndex) {
        step.classList.remove("hidden")
        step.classList.add("fade-in")
      } else {
        step.classList.add("hidden")
        step.classList.remove("fade-in")
      }
    })

    // Update progress
    const progress = ((stepIndex + 1) / totalSteps) * 100
    progressBar.style.width = `${progress}%`
    progressText.textContent = `Step ${stepIndex + 1} of ${totalSteps}`
    currentStepText.textContent = stepIndex + 1

    // Show/hide buttons
    if (stepIndex === 0) {
      prevBtn.classList.add("hidden")
    } else {
      prevBtn.classList.remove("hidden")
    }

    if (stepIndex === totalSteps - 1) {
      nextBtn.classList.add("hidden")
      submitBtn.classList.remove("hidden")
    } else {
      nextBtn.classList.remove("hidden")
      submitBtn.classList.add("hidden")
    }
  }

  // Go to next step
  function nextStep() {
    if (currentStep < totalSteps - 1) {
      currentStep++
      showStep(currentStep)
      window.scrollTo(0, 0)
    }
  }

  // Go to previous step
  function prevStep() {
    if (currentStep > 0) {
      currentStep--
      showStep(currentStep)
      window.scrollTo(0, 0)
    }
  }

  // Event listeners
  if (nextBtn) {
    nextBtn.addEventListener("click", nextStep)
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", prevStep)
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      // Don't prevent default - let the form submit to FormSubmit.co

      // Format the form data as text for the email
      const formData = new FormData(form);
      let textData = "ROOFING QUOTE REQUEST\n";
      textData += "====================\n\n";

      // Add timestamp
      textData += `Submission Date: ${new Date().toLocaleString()}\n\n`;

      // Basic Information
      textData += "BASIC INFORMATION\n";
      textData += "-----------------\n";
      const reasons = formData.getAll('reason');
      textData += `Primary Reason: ${reasons.join(', ')}\n`;
      textData += `Roof Age: ${formData.get('roof_age')}\n`;
      textData += `Square Footage: ${formData.get('square_footage')}\n\n`;

      // Roof Details
      textData += "ROOF DETAILS\n";
      textData += "------------\n";
      textData += `Current Material: ${formData.get('current_material')}\n`;
      textData += `Desired Material: ${formData.get('desired_material')}\n`;
      textData += `Roof Type: ${formData.get('roof_type')}\n\n`;

      // Project Specifics
      textData += "PROJECT SPECIFICS\n";
      textData += "----------------\n";
      const issues = formData.getAll('issues');
      textData += `Current Issues: ${issues.join(', ')}\n`;
      const features = formData.getAll('features');
      textData += `Additional Features: ${features.join(', ')}\n`;
      textData += `Timeframe: ${formData.get('timeframe')}\n\n`;

      // Budget and Preferences
      textData += "BUDGET AND PREFERENCES\n";
      textData += "----------------------\n";
      textData += `Budget: ${formData.get('budget')}\n`;
      textData += `Importance - Cost: ${formData.get('importance_cost')}/5\n`;
      textData += `Importance - Durability: ${formData.get('importance_durability')}/5\n`;
      textData += `Importance - Appearance: ${formData.get('importance_appearance')}/5\n`;
      textData += `Importance - Energy Efficiency: ${formData.get('importance_energy')}/5\n`;
      textData += `Importance - Warranty: ${formData.get('importance_warranty')}/5\n`;
      textData += `Referral Source: ${formData.get('referral')}\n\n`;

      // Contact Information
      textData += "CONTACT INFORMATION\n";
      textData += "-------------------\n";
      textData += `Name: ${formData.get('name')}\n`;
      textData += `Email: ${formData.get('email')}\n`;
      textData += `Phone: ${formData.get('phone')}\n`;
      textData += `Zip Code: ${formData.get('zip')}\n`;
      textData += `Preferred Contact Method: ${formData.get('contact_method')}\n`;
      textData += `Additional Comments: ${formData.get('comments')}\n`;

      // Create a hidden field to store the formatted text data
      const textDataInput = document.createElement('input');
      textDataInput.type = 'hidden';
      textDataInput.name = 'formatted_data';
      textDataInput.value = textData;
      form.appendChild(textDataInput);

      // Show the thank you modal if the form is submitted locally (for testing)
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        e.preventDefault();
        if (thankYouModal) {
          thankYouModal.classList.remove("hidden");
        }
        form.reset();
      }
    });
  }

  if (closeModalBtn && thankYouModal) {
    closeModalBtn.addEventListener("click", () => {
      thankYouModal.classList.add("hidden")
      // Reset form and go back to first step
      form.reset()
      currentStep = 0
      showStep(currentStep)
    })
  }

  // Initialize the first step
  showStep(currentStep)
})
