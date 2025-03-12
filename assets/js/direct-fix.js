// This script will be added directly to the page to fix any JavaScript issues
document.addEventListener("DOMContentLoaded", () => {
  console.log("Direct fix script loaded")

  // Force re-attach event listeners to navigation buttons
  const nextBtn = document.getElementById("next-btn")
  const prevBtn = document.getElementById("prev-btn")
  const submitBtn = document.getElementById("submit-btn")
  const steps = document.querySelectorAll(".questionnaire-step")

  if (!steps || steps.length === 0) {
    console.error("No steps found!")
    return
  }

  let currentStep = 0
  const totalSteps = steps.length

  console.log(`Found ${totalSteps} steps`)

  function showStep(stepIndex) {
    console.log(`Showing step ${stepIndex}`)
    steps.forEach((step, index) => {
      if (index === stepIndex) {
        step.style.display = "block"
      } else {
        step.style.display = "none"
      }
    })

    // Update progress bar
    const progressBar = document.getElementById("progress-bar")
    if (progressBar) {
      const progress = ((stepIndex + 1) / totalSteps) * 100
      progressBar.style.width = `${progress}%`
    }

    // Update step counter
    const currentStepText = document.getElementById("current-step")
    if (currentStepText) {
      currentStepText.textContent = stepIndex + 1
    }

    // Show/hide buttons
    if (stepIndex === 0) {
      if (prevBtn) prevBtn.style.display = "none"
    } else {
      if (prevBtn) prevBtn.style.display = "flex"
    }

    if (stepIndex === totalSteps - 1) {
      if (nextBtn) nextBtn.style.display = "none"
      if (submitBtn) submitBtn.style.display = "flex"
    } else {
      if (nextBtn) nextBtn.style.display = "flex"
      if (submitBtn) submitBtn.style.display = "none"
    }
  }

  // Direct event handlers
  if (nextBtn) {
    console.log("Attaching direct event handler to next button")
    nextBtn.onclick = () => {
      console.log("Next button clicked")
      if (currentStep < totalSteps - 1) {
        currentStep++
        showStep(currentStep)
        window.scrollTo(0, 0)
      }
    }
  }

  if (prevBtn) {
    console.log("Attaching direct event handler to previous button")
    prevBtn.onclick = () => {
      console.log("Previous button clicked")
      if (currentStep > 0) {
        currentStep--
        showStep(currentStep)
        window.scrollTo(0, 0)
      }
    }
  }

  // Initialize the first step
  showStep(currentStep)

  // Initialize material cards
  const materialCards = document.querySelectorAll(".material-card")
  materialCards.forEach((card) => {
    card.addEventListener("click", function () {
      materialCards.forEach((c) => c.classList.remove("selected"))
      this.classList.add("selected")
      const hiddenInput = document.getElementById("desired_material")
      if (hiddenInput) {
        hiddenInput.value = this.dataset.value
      }
    })
  })

  // Initialize roof type cards
  const roofTypeCards = document.querySelectorAll(".roof-type-card")
  roofTypeCards.forEach((card) => {
    card.addEventListener("click", function () {
      roofTypeCards.forEach((c) => c.classList.remove("selected"))
      this.classList.add("selected")
      const hiddenInput = document.getElementById("roof_type")
      if (hiddenInput) {
        hiddenInput.value = this.dataset.value
      }
    })
  })
})

