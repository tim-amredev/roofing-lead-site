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
      e.preventDefault()

      // Simulate form submission
      setTimeout(() => {
        if (thankYouModal) {
          thankYouModal.classList.remove("hidden")
        }
      }, 1000)
    })
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

