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

  // Function to show a specific step
  function showStep(stepIndex) {
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

    // Show/hide buttons
    if (prevBtn) {
      prevBtn.style.display = stepIndex === 0 ? "none" : "block"
    }

    if (nextBtn && submitBtn) {
      if (stepIndex === totalSteps - 1) {
        nextBtn.style.display = "none"
        submitBtn.style.display = "block"
      } else {
        nextBtn.style.display = "block"
        submitBtn.style.display = "none"
      }
    }
  }

  // Handle next button click
  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault()
      if (currentStep < totalSteps - 1) {
        currentStep++
        showStep(currentStep)
        window.scrollTo(0, 0)
      }
    })
  }

  // Handle previous button click
  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault()
      if (currentStep > 0) {
        currentStep--
        showStep(currentStep)
        window.scrollTo(0, 0)
      }
    })
  }

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

      // Save to localStorage
      localStorage.setItem("roofingFormData", JSON.stringify(formDataObj))
    })
  }
})

