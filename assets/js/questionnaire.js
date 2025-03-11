document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("questionnaire-form")
  const steps = document.querySelectorAll(".questionnaire-step")
  const progressBar = document.getElementById("progress-bar")
  const progressText = document.getElementById("progress-text")
  const currentStepText = document.getElementById("current-step")
  const prevBtn = document.getElementById("prev-btn")
  const nextBtn = document.getElementById("next-btn")
  const submitBtn = document.getElementById("submit-btn")

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

  // Fix the step navigation functionality
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

  // Fix the next step validation
  function validateCurrentStep(step) {
    // Step 1 validation
    if (step === 0) {
      const reason = document.querySelector('input[name="reason"]:checked')
      const roofAge = document.querySelector('input[name="roof_age"]:checked')
      const squareFootage = document.querySelector('input[name="square_footage"]:checked')

      if (!reason || !roofAge || !squareFootage) {
        alert("Please answer all questions before proceeding.")
        return false
      }
    }

    // Step 2 validation
    else if (step === 1) {
      const currentMaterial = document.querySelector('input[name="current_material"]:checked')
      const desiredMaterial = document.getElementById("desired_material").value
      const roofType = document.getElementById("roof_type").value

      if (!currentMaterial || !desiredMaterial || !roofType) {
        alert("Please select your current material, desired material, and roof type.")
        return false
      }
    }

    // Step 3 validation
    else if (step === 2) {
      // At least one issue should be selected
      const issues = document.querySelectorAll('input[name="issues[]"]:checked')
      const timeframe = document.querySelector('input[name="timeframe"]:checked')

      if (issues.length === 0 || !timeframe) {
        alert("Please select at least one issue and your project timeframe.")
        return false
      }
    }

    return true
  }

  function nextStep() {
    if (validateCurrentStep(currentStep)) {
      if (currentStep < totalSteps - 1) {
        currentStep++
        showStep(currentStep)
        window.scrollTo(0, 0)
      }
    }
  }

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

  // Initialize the first step
  showStep(currentStep)

  // Handle form submission
  if (form) {
    form.addEventListener("submit", (e) => {
      // Validate the current step before submission
      if (!validateCurrentStep(currentStep)) {
        e.preventDefault()
        return
      }

      // Store form data in localStorage before submission
      const formData = new FormData(form)
      const formDataObj = {}

      // Special handling for checkbox arrays
      const checkboxArrays = {
        "issues[]": [],
        "features[]": [],
      }

      formData.forEach((value, key) => {
        // Skip FormSubmit's internal fields
        if (key.startsWith("_")) return

        // Handle checkbox arrays
        if (key === "issues[]" || key === "features[]") {
          checkboxArrays[key].push(value)
        } else {
          formDataObj[key] = value
        }
      })

      // Add the checkbox arrays to the form data object
      for (const [key, values] of Object.entries(checkboxArrays)) {
        if (values.length > 0) {
          // Store without the [] suffix
          const cleanKey = key.replace("[]", "")
          formDataObj[cleanKey] = values
        }
      }

      // Save to localStorage
      localStorage.setItem("roofingFormData", JSON.stringify(formDataObj))
    })
  }

  // Apply dark theme to the page
  document.body.style.backgroundColor = "#181818"
  document.documentElement.style.backgroundColor = "#181818"

  // Force dark theme on all sections
  const sections = document.querySelectorAll("section")
  sections.forEach((section) => {
    section.style.backgroundColor = "#181818"
  })
})

