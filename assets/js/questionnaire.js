document.addEventListener("DOMContentLoaded", () => {
  console.log("Questionnaire script loaded")

  const form = document.getElementById("questionnaire-form")
  const steps = document.querySelectorAll(".questionnaire-step")
  const progressBar = document.getElementById("progress-bar")
  const progressText = document.getElementById("progress-text")
  const currentStepText = document.getElementById("current-step")

  // Get all prev and next buttons by their step-specific IDs
  const prevButtons = [
    document.getElementById("prev-btn-1"),
    document.getElementById("prev-btn-2"),
    document.getElementById("prev-btn-3"),
    document.getElementById("prev-btn-4"),
    document.getElementById("prev-btn-5"),
  ]

  const nextButtons = [
    document.getElementById("next-btn-1"),
    document.getElementById("next-btn-2"),
    document.getElementById("next-btn-3"),
    document.getElementById("next-btn-4"),
  ]

  const submitBtn = document.getElementById("submit-btn")

  let currentStep = 0
  // Update the total steps count
  const totalSteps = 4 // Changed from 5 to 4

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
      console.log("Material selected:", this.dataset.value)

      // Add visual feedback
      const allCardDivs = document.querySelectorAll(".material-card > div")
      allCardDivs.forEach((div) => {
        div.style.borderColor = "rgba(255, 255, 255, 0.1)"
        div.style.boxShadow = "none"
      })

      const selectedDiv = this.querySelector("div")
      if (selectedDiv) {
        selectedDiv.style.borderColor = "#D4A017"
        selectedDiv.style.boxShadow = "0 0 0 2px #D4A017"
      }
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
      console.log("Roof type selected:", this.dataset.value)

      // Add visual feedback
      const allCardDivs = document.querySelectorAll(".roof-type-card > div")
      allCardDivs.forEach((div) => {
        div.style.borderColor = "rgba(255, 255, 255, 0.1)"
        div.style.boxShadow = "none"
      })

      const selectedDiv = this.querySelector("div")
      if (selectedDiv) {
        selectedDiv.style.borderColor = "#D4A017"
        selectedDiv.style.boxShadow = "0 0 0 2px #D4A017"
      }
    })
  })

  // Update button logic to make step 4 the final step
  function showStep(stepIndex) {
    console.log("Showing step:", stepIndex)

    // Hide all steps
    steps.forEach((step, index) => {
      if (index === stepIndex) {
        step.classList.remove("hidden")
      } else {
        step.classList.add("hidden")
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
      currentStepText.textContent = (stepIndex + 1).toString()
    }

    // Show/hide previous buttons based on current step
    prevButtons.forEach((btn, index) => {
      if (btn) {
        // Only show the previous button for the current step, and only if we're not on the first step
        btn.style.display = index === stepIndex && stepIndex > 0 ? "flex" : "none"
      }
    })

    // Show/hide next buttons based on current step
    // Show next buttons for all steps except the last one (step 4)
    nextButtons.forEach((btn, index) => {
      if (btn) {
        // Only show the next button for the current step and not the last step
        btn.style.display = index === stepIndex && stepIndex < totalSteps - 1 ? "flex" : "none"
      }
    })

    // Show submit button only on the last step (step 4)
    if (submitBtn) {
      submitBtn.style.display = stepIndex === totalSteps - 1 ? "flex" : "none"
    }
  }

  // Handle next button clicks
  nextButtons.forEach((btn, index) => {
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault()
        console.log(`Next button ${index + 1} clicked`)
        if (currentStep < totalSteps - 1) {
          currentStep++
          showStep(currentStep)
          window.scrollTo(0, 0)
        }
      })
    }
  })

  // Handle previous button clicks
  prevButtons.forEach((btn, index) => {
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault()
        console.log(`Previous button ${index + 1} clicked`)
        if (currentStep > 0) {
          currentStep--
          showStep(currentStep)
          window.scrollTo(0, 0)
        }
      })
    }
  })

  // Initialize the first step
  showStep(currentStep)

  // Handle form submission
  if (form) {
    form.addEventListener("submit", (e) => {
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

      // Add name for personalization on thank you page
      if (formDataObj.firstname) {
        formDataObj.name = formDataObj.firstname + (formDataObj.lastname ? " " + formDataObj.lastname : "")
      }

      // Save to localStorage
      console.log("Saving form data to localStorage:", formDataObj)
      localStorage.setItem("roofingFormData", JSON.stringify(formDataObj))
    })
  }
})

