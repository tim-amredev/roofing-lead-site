// Direct JS fix for questionnaire navigation
document.addEventListener("DOMContentLoaded", () => {
  console.log("Direct fix script loaded")

  // Find all questionnaire elements
  const nextBtn = document.getElementById("next-btn")
  const prevBtn = document.getElementById("prev-btn")
  const submitBtn = document.getElementById("submit-btn")
  const steps = document.querySelectorAll(".questionnaire-step")
  const progressBar = document.getElementById("progress-bar")
  const progressText = document.getElementById("progress-text")
  const currentStepText = document.getElementById("current-step")

  console.log({ nextBtn, prevBtn, submitBtn, stepsCount: steps.length, progressBar })

  let currentStep = 0
  const totalSteps = steps.length

  // Function to show a specific step
  function showStep(stepIndex) {
    console.log("Showing step", stepIndex)

    // Hide all steps
    steps.forEach((step, index) => {
      if (index === stepIndex) {
        step.classList.remove("hidden")
      } else {
        step.classList.add("hidden")
      }
    })

    // Update progress bar and text
    if (progressBar) {
      const progress = ((stepIndex + 1) / totalSteps) * 100
      progressBar.style.width = `${progress}%`
    }

    if (progressText) {
      progressText.textContent = `Step ${stepIndex + 1} of ${totalSteps}`
    }

    if (currentStepText) {
      currentStepText.textContent = stepIndex + 1
    }

    // Show/hide buttons based on step
    if (prevBtn) {
      prevBtn.style.display = stepIndex === 0 ? "none" : "flex"
    }

    if (nextBtn && submitBtn) {
      if (stepIndex === totalSteps - 1) {
        nextBtn.style.display = "none"
        submitBtn.style.display = "flex"
      } else {
        nextBtn.style.display = "flex"
        submitBtn.style.display = "none"
      }
    }
  }

  // Add click handlers directly to buttons
  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault()
      console.log("Next button clicked")

      if (currentStep < totalSteps - 1) {
        currentStep++
        showStep(currentStep)
        window.scrollTo(0, 0)
      }
    })

    // Ensure button is visible with correct styling
    nextBtn.style.backgroundColor = "#D4A017"
    nextBtn.style.color = "#181818"
    nextBtn.style.display = "flex"
    nextBtn.style.alignItems = "center"
    nextBtn.style.justifyContent = "center"
    nextBtn.style.padding = "0.75rem 2rem"
    nextBtn.style.borderRadius = "0.5rem"
    nextBtn.style.fontWeight = "bold"
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault()
      console.log("Previous button clicked")

      if (currentStep > 0) {
        currentStep--
        showStep(currentStep)
        window.scrollTo(0, 0)
      }
    })

    // Ensure button is visible with correct styling
    prevBtn.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
    prevBtn.style.color = "#FFFFFF"
    prevBtn.style.display = currentStep === 0 ? "none" : "flex"
    prevBtn.style.alignItems = "center"
    prevBtn.style.justifyContent = "center"
    prevBtn.style.padding = "0.75rem 2rem"
    prevBtn.style.borderRadius = "0.5rem"
    prevBtn.style.fontWeight = "bold"
  }

  // Initialize the first step
  showStep(0)

  // Apply dark theme to the page
  document.body.style.backgroundColor = "#181818"
  document.documentElement.style.backgroundColor = "#181818"

  // Apply dark theme to sections
  const sections = document.querySelectorAll("section")
  sections.forEach((section) => {
    section.style.backgroundColor = "#181818"
  })

  // Initialize material and roof type cards
  const materialCards = document.querySelectorAll(".material-card")
  materialCards.forEach((card) => {
    card.addEventListener("click", function () {
      materialCards.forEach((c) => c.classList.remove("selected"))
      this.classList.add("selected")
      document.getElementById("desired_material").value = this.dataset.value
    })
  })

  const roofTypeCards = document.querySelectorAll(".roof-type-card")
  roofTypeCards.forEach((card) => {
    card.addEventListener("click", function () {
      roofTypeCards.forEach((c) => c.classList.remove("selected"))
      this.classList.add("selected")
      document.getElementById("roof_type").value = this.dataset.value
    })
  })

  console.log("Direct fix script initialization complete")
})

