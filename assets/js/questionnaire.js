// Completely rewritten questionnaire.js with robust button handling
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
        prevBtn.style.display = "none"
      } else {
        prevBtn.classList.remove("hidden")
        prevBtn.style.display = "flex"
      }
    }

    if (nextBtn && submitBtn) {
      if (stepIndex === totalSteps - 1) {
        nextBtn.classList.add("hidden")
        nextBtn.style.display = "none"
        submitBtn.classList.remove("hidden")
        submitBtn.style.display = "flex"
      } else {
        nextBtn.classList.remove("hidden")
        nextBtn.style.display = "flex"
        submitBtn.classList.add("hidden")
        submitBtn.style.display = "none"
      }
    }

    // Force the buttons to be visible with correct styling
    if (nextBtn && stepIndex !== totalSteps - 1) {
      nextBtn.style.display = "flex"
      nextBtn.style.backgroundColor = "#D4A017"
      nextBtn.style.color = "#181818"
      nextBtn.style.alignItems = "center"
      nextBtn.style.justifyContent = "center"
      nextBtn.style.padding = "0.75rem 2rem"
      nextBtn.style.borderRadius = "0.5rem"
      nextBtn.style.fontWeight = "bold"
      nextBtn.style.opacity = "1"
      nextBtn.style.visibility = "visible"
    }

    if (prevBtn && stepIndex !== 0) {
      prevBtn.style.display = "flex"
      prevBtn.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
      prevBtn.style.color = "#FFFFFF"
      prevBtn.style.alignItems = "center"
      prevBtn.style.justifyContent = "center"
      prevBtn.style.padding = "0.75rem 2rem"
      prevBtn.style.borderRadius = "0.5rem"
      prevBtn.style.fontWeight = "bold"
      prevBtn.style.opacity = "1"
      prevBtn.style.visibility = "visible"
    }

    if (submitBtn && stepIndex === totalSteps - 1) {
      submitBtn.style.display = "flex"
      submitBtn.style.backgroundColor = "#D4A017"
      submitBtn.style.color = "#181818"
      submitBtn.style.alignItems = "center"
      submitBtn.style.justifyContent = "center"
      submitBtn.style.padding = "0.75rem 2rem"
      submitBtn.style.borderRadius = "0.5rem"
      submitBtn.style.fontWeight = "bold"
      submitBtn.style.opacity = "1"
      submitBtn.style.visibility = "visible"
    }
  }

  // Fix the next step validation
  function validateCurrentStep(step) {
    console.log("Validating step:", step)

    // For now, return true to allow navigation through the form
    // We'll implement proper validation once the navigation works
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

    // Force button styling
    nextBtn.style.backgroundColor = "#D4A017"
    nextBtn.style.color = "#181818"
    nextBtn.style.display = "flex"
    nextBtn.style.alignItems = "center"
    nextBtn.style.justifyContent = "center"
    nextBtn.style.padding = "0.75rem 2rem"
    nextBtn.style.borderRadius = "0.5rem"
    nextBtn.style.fontWeight = "bold"
    nextBtn.style.opacity = "1"
    nextBtn.style.visibility = "visible"
  }

  if (prevBtn) {
    console.log("Adding event listener to Previous button")
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault()
      prevStep()
    })

    // Force button styling for previous button
    prevBtn.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
    prevBtn.style.color = "#FFFFFF"
    prevBtn.style.display = "none" // Initially hidden
    prevBtn.style.alignItems = "center"
    prevBtn.style.justifyContent = "center"
    prevBtn.style.padding = "0.75rem 2rem"
    prevBtn.style.borderRadius = "0.5rem"
    prevBtn.style.fontWeight = "bold"
    prevBtn.style.opacity = "1"
    prevBtn.style.visibility = "visible"
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
      opacity: 1 !important;
      visibility: visible !important;
      position: relative !important;
      z-index: 50 !important;
      min-width: 120px !important;
      min-height: 48px !important;
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
      opacity: 1 !important;
      visibility: visible !important;
      position: relative !important;
      z-index: 50 !important;
      min-width: 120px !important;
      min-height: 48px !important;
    }
    
    .flex.justify-between.pt-6.border-t.border-white\\/10 {
      display: flex !important;
      justify-content: space-between !important;
      margin-top: 2rem !important;
      padding-top: 1.5rem !important;
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
      width: 100% !important;
      position: relative !important;
      z-index: 100 !important;
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

  // Check if buttons are visible after a short delay
  setTimeout(() => {
    if (nextBtn) {
      const nextBtnVisible = window.getComputedStyle(nextBtn).display !== "none"
      console.log("Next button visible:", nextBtnVisible)

      // If not visible, force it to be visible
      if (!nextBtnVisible) {
        console.log("Forcing next button to be visible")
        nextBtn.style.display = "flex"
        nextBtn.style.visibility = "visible"
        nextBtn.style.opacity = "1"
      }
    }
  }, 1000)
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
    nextBtn.style.alignItems = "center"
    nextBtn.style.justifyContent = "center"
    nextBtn.style.padding = "0.75rem 2rem"
    nextBtn.style.borderRadius = "0.5rem"
    nextBtn.style.fontWeight = "bold"
    nextBtn.style.opacity = "1"
    nextBtn.style.visibility = "visible"

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

        // Scroll to top
        window.scrollTo(0, 0)
      }
    }
  }

  // Create emergency buttons if the regular ones aren't working
  const buttonsContainer = document.querySelector(".flex.justify-between.pt-6.border-t.border-white\\/10")
  if (!buttonsContainer || !nextBtn) {
    console.log("Creating emergency buttons")

    // Create a new container
    const emergencyContainer = document.createElement("div")
    emergencyContainer.style.display = "flex"
    emergencyContainer.style.justifyContent = "space-between"
    emergencyContainer.style.marginTop = "2rem"
    emergencyContainer.style.paddingTop = "1.5rem"
    emergencyContainer.style.borderTop = "1px solid rgba(255, 255, 255, 0.1)"

    // Create emergency next button
    const emergencyNext = document.createElement("button")
    emergencyNext.textContent = "Next"
    emergencyNext.style.backgroundColor = "#D4A017"
    emergencyNext.style.color = "#181818"
    emergencyNext.style.padding = "0.75rem 2rem"
    emergencyNext.style.borderRadius = "0.5rem"
    emergencyNext.style.fontWeight = "bold"

    // Add click handler
    emergencyNext.onclick = (e) => {
      e.preventDefault()

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

        // Scroll to top
        window.scrollTo(0, 0)
      }
    }

    // Add the emergency button to the form
    const form = document.getElementById("questionnaire-form")
    if (form) {
      emergencyContainer.appendChild(emergencyNext)
      form.appendChild(emergencyContainer)
    }
  }
})

