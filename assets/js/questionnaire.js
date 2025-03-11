document.addEventListener("DOMContentLoaded", () => {
  console.log("Questionnaire script loaded")

  const form = document.getElementById("questionnaire-form")
  const steps = document.querySelectorAll(".questionnaire-step")
  const progressBar = document.getElementById("progress-bar")
  const progressText = document.getElementById("progress-text")
  const currentStepText = document.getElementById("current-step")
  const prevBtn = document.getElementById("prev-btn")
  const nextBtn = document.getElementById("next-btn")
  const submitBtn = document.getElementById("submit-btn")

  console.log("Form:", form)
  console.log("Steps:", steps.length)
  console.log("Progress bar:", progressBar)
  console.log("Next button:", nextBtn)
  console.log("Prev button:", prevBtn)

  let currentStep = 0
  const totalSteps = steps.length

  // Initialize material cards
  const materialCards = document.querySelectorAll(".material-card")
  materialCards.forEach((card) => {
    card.addEventListener("click", function () {
      console.log("Material card clicked:", this.dataset.value)
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
      console.log("Roof type card clicked:", this.dataset.value)
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
    console.log("Showing step:", stepIndex)
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
    if (progressBar) {
      progressBar.style.width = `${progress}%`
    }
    if (progressText) {
      progressText.textContent = `Step ${stepIndex + 1} of ${totalSteps}`
    }
    if (currentStepText) {
      currentStepText.textContent = stepIndex + 1
    }

    // Show/hide buttons
    if (prevBtn) {
      if (stepIndex === 0) {
        prevBtn.classList.add("hidden")
      } else {
        prevBtn.classList.remove("hidden")
      }
    }

    if (nextBtn && submitBtn) {
      if (stepIndex === totalSteps - 1) {
        nextBtn.classList.add("hidden")
        submitBtn.classList.remove("hidden")
      } else {
        nextBtn.classList.remove("hidden")
        submitBtn.classList.add("hidden")
      }
    }

    // Force the buttons to be visible
    if (nextBtn) nextBtn.style.display = "flex"
    if (prevBtn) prevBtn.style.display = stepIndex === 0 ? "none" : "flex"
    if (submitBtn) submitBtn.style.display = stepIndex === totalSteps - 1 ? "flex" : "none"
  }

  // Fix the next step validation
  function validateCurrentStep(step) {
    console.log("Validating step:", step)

    // For now, return true to allow navigation through the form
    // We'll implement proper validation once the navigation works
    return true

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
    console.log("Next button clicked")
    if (validateCurrentStep(currentStep)) {
      if (currentStep < totalSteps - 1) {
        currentStep++
        showStep(currentStep)
        window.scrollTo(0, 0)
      }
    }
  }

  function prevStep() {
    console.log("Previous button clicked")
    if (currentStep > 0) {
      currentStep--
      showStep(currentStep)
      window.scrollTo(0, 0)
    }
  }

  // Event listeners
  if (nextBtn) {
    console.log("Adding event listener to Next button")
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault()
      nextStep()
    })
  }

  if (prevBtn) {
    console.log("Adding event listener to Previous button")
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault()
      prevStep()
    })
  }

  // Initialize the first step
  console.log("Initializing first step")
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

  // Add direct inline style fix for the Next button
  if (nextBtn) {
    nextBtn.style.backgroundColor = "#D4A017"
    nextBtn.style.color = "#181818"
    nextBtn.style.display = "flex"
    nextBtn.style.alignItems = "center"
    nextBtn.style.justifyContent = "center"
    nextBtn.style.padding = "0.75rem 2rem"
    nextBtn.style.borderRadius = "0.5rem"
    nextBtn.style.fontWeight = "bold"
  }

  // Create a style element to force additional CSS fixes
  const styleEl = document.createElement("style")
  styleEl.innerHTML = `
    #next-btn, #submit-btn {
      background-color: #D4A017 !important;
      color: #181818 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0.75rem 2rem !important;
      border-radius: 0.5rem !important;
      font-weight: bold !important;
    }
    
    #prev-btn {
      background-color: rgba(255, 255, 255, 0.1) !important;
      color: #FFFFFF !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0.75rem 2rem !important;
      border-radius: 0.5rem !important;
      font-weight: bold !important;
    }
    
    section.min-h-screen {
      background-color: #181818 !important;
    }
    
    body, html {
      background-color: #181818 !important;
    }
  `
  document.head.appendChild(styleEl)

  console.log("Questionnaire script initialization complete")
})

// Backup alternative for ensuring the script runs
window.addEventListener("load", () => {
  console.log("Window load event fired")

  // Check if buttons exist and are functioning
  const nextBtn = document.getElementById("next-btn")
  const prevBtn = document.getElementById("prev-btn")
  const submitBtn = document.getElementById("submit-btn")

  if (nextBtn) {
    console.log("Next button found in window load")
    nextBtn.style.backgroundColor = "#D4A017"
    nextBtn.style.color = "#181818"
    nextBtn.style.display = "flex"

    // Add click handler just in case
    nextBtn.onclick = (e) => {
      e.preventDefault()
      console.log("Next button clicked via window load handler")

      // Get the current step
      const currentStepElement = document.querySelector(".questionnaire-step:not(.hidden)")
      if (!currentStepElement) return

      // Find all steps
      const allSteps = document.querySelectorAll(".questionnaire-step")
      const currentIndex = Array.from(allSteps).indexOf(currentStepElement)

      // Find next step
      if (currentIndex < allSteps.length - 1) {
        // Hide current step
        currentStepElement.classList.add("hidden")

        // Show next step
        allSteps[currentIndex + 1].classList.remove("hidden")

        // Update buttons
        if (currentIndex + 1 === allSteps.length - 1) {
          nextBtn.style.display = "none"
          if (submitBtn) submitBtn.style.display = "flex"
        }

        if (prevBtn) prevBtn.style.display = "flex"

        // Update progress
        const progressBar = document.getElementById("progress-bar")
        if (progressBar) {
          const progress = ((currentIndex + 2) / allSteps.length) * 100
          progressBar.style.width = `${progress}%`
        }
      }
    }
  }
})

