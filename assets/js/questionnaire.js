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
      materialCards.forEach((c) => c.classList.remove("selected"))
      this.classList.add("selected")
      document.getElementById("desired_material").value = this.dataset.value
    })
  })

  // Initialize roof type cards
  const roofTypeCards = document.querySelectorAll(".roof-type-card")
  roofTypeCards.forEach((card) => {
    card.addEventListener("click", function () {
      roofTypeCards.forEach((c) => c.classList.remove("selected"))
      this.classList.add("selected")
      document.getElementById("roof_type").value = this.dataset.value
    })
  })

  function validateStep(stepIndex) {
    const step = steps[stepIndex]
    let isValid = true

    // Step 1 validation
    if (stepIndex === 0) {
      const reason = step.querySelector('input[name="reason"]:checked')
      const roofAge = step.querySelector('input[name="roof_age"]:checked')
      const squareFootage = step.querySelector('input[name="square_footage"]:checked')

      if (!reason || !roofAge || !squareFootage) {
        alert("Please answer all questions before proceeding.")
        isValid = false
      }
    }

    // Step 2 validation
    else if (stepIndex === 1) {
      const currentMaterial = step.querySelector('input[name="current_material"]:checked')
      const desiredMaterial = document.getElementById("desired_material").value
      const roofType = document.getElementById("roof_type").value

      if (!currentMaterial || !desiredMaterial || !roofType) {
        alert("Please select your current material, desired material, and roof type.")
        isValid = false
      }
    }

    // Step 3 validation
    else if (stepIndex === 2) {
      const issues = step.querySelectorAll('input[name="issues[]"]:checked')
      const timeframe = step.querySelector('input[name="timeframe"]:checked')

      if (issues.length === 0 || !timeframe) {
        alert("Please select at least one issue and your project timeframe.")
        isValid = false
      }
    }

    return isValid
  }

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
    prevBtn.style.display = stepIndex === 0 ? "none" : "flex"
    nextBtn.style.display = stepIndex === totalSteps - 1 ? "none" : "flex"
    submitBtn.style.display = stepIndex === totalSteps - 1 ? "flex" : "none"

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function nextStep() {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps - 1) {
        currentStep++
        showStep(currentStep)
      }
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--
      showStep(currentStep)
    }
  }

  // Event listeners
  if (nextBtn) {
    nextBtn.addEventListener("click", nextStep)
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", prevStep)
  }

  // Initialize form
  if (form) {
    showStep(0)

    form.addEventListener("submit", (e) => {
      if (!validateStep(currentStep)) {
        e.preventDefault()
        return
      }

      // Store form data in localStorage
      const formData = new FormData(form)
      const formDataObj = {}

      // Special handling for checkbox arrays
      const checkboxArrays = {
        "issues[]": [],
        "features[]": [],
      }

      formData.forEach((value, key) => {
        if (key.startsWith("_")) return

        if (key === "issues[]" || key === "features[]") {
          checkboxArrays[key].push(value)
        } else {
          formDataObj[key] = value
        }
      })

      // Add checkbox arrays to form data
      for (const [key, values] of Object.entries(checkboxArrays)) {
        if (values.length > 0) {
          const cleanKey = key.replace("[]", "")
          formDataObj[cleanKey] = values
        }
      }

      localStorage.setItem("roofingFormData", JSON.stringify(formDataObj))
    })
  }
})

