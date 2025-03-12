// Completely new approach to fix the questionnaire form progression
document.addEventListener("DOMContentLoaded", () => {
  console.log("Form fix script loaded")

  // Get all necessary elements
  const form = document.getElementById("questionnaire-form")
  const steps = document.querySelectorAll(".questionnaire-step")
  const nextBtn = document.getElementById("next-btn")
  const prevBtn = document.getElementById("prev-btn")
  const submitBtn = document.getElementById("submit-btn")
  const progressBar = document.getElementById("progress-bar")
  const currentStepText = document.getElementById("current-step")

  if (!form || !steps.length) {
    console.error("Form or steps not found")
    return
  }

  console.log(`Found ${steps.length} steps`)

  // Current step tracker
  let currentStep = 0
  const totalSteps = steps.length

  // Function to show a specific step
  function showStep(stepIndex) {
    console.log(`Showing step ${stepIndex + 1}`)

    // Hide all steps
    for (let i = 0; i < steps.length; i++) {
      steps[i].style.display = "none"
    }

    // Show the current step
    steps[stepIndex].style.display = "block"

    // Update progress bar
    if (progressBar) {
      const progress = ((stepIndex + 1) / totalSteps) * 100
      progressBar.style.width = `${progress}%`
    }

    // Update step text
    if (currentStepText) {
      currentStepText.textContent = stepIndex + 1
    }

    // Update button visibility
    if (prevBtn) {
      if (stepIndex === 0) {
        prevBtn.style.display = "none"
      } else {
        prevBtn.style.display = "flex"
      }
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

    // Scroll to top
    window.scrollTo(0, 0)
  }

  // Set up next button
  if (nextBtn) {
    // Remove any existing event listeners
    const newNextBtn = nextBtn.cloneNode(true)
    if (nextBtn.parentNode) {
      nextBtn.parentNode.replaceChild(newNextBtn, nextBtn)
    }

    // Add new event listener
    newNextBtn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      console.log("Next button clicked")

      if (currentStep < totalSteps - 1) {
        currentStep++
        showStep(currentStep)
      }

      return false
    })
  }

  // Set up previous button
  if (prevBtn) {
    // Remove any existing event listeners
    const newPrevBtn = prevBtn.cloneNode(true)
    if (prevBtn.parentNode) {
      prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn)
    }

    // Add new event listener
    newPrevBtn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      console.log("Previous button clicked")

      if (currentStep > 0) {
        currentStep--
        showStep(currentStep)
      }

      return false
    })
  }

  // Prevent form submission on Enter key
  if (form) {
    form.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()

        // If on last step, allow submission
        if (currentStep === totalSteps - 1) {
          return true
        }

        // Otherwise, go to next step
        if (currentStep < totalSteps - 1) {
          currentStep++
          showStep(currentStep)
        }

        return false
      }
    })
  }

  // Initialize the first step
  showStep(0)

  console.log("Form progression initialized")

  // Initialize material cards
  function initializeCards() {
    console.log("Initializing material and roof type cards")

    // Material cards
    const materialCards = document.querySelectorAll(".material-card")
    materialCards.forEach((card) => {
      card.addEventListener("click", function () {
        console.log("Material card clicked:", this.dataset.value)
        materialCards.forEach((c) => c.classList.remove("selected"))
        this.classList.add("selected")

        // Update hidden input
        const hiddenInput = document.getElementById("desired_material")
        if (hiddenInput) {
          hiddenInput.value = this.dataset.value
        }
      })
    })

    // Roof type cards
    const roofTypeCards = document.querySelectorAll(".roof-type-card")
    roofTypeCards.forEach((card) => {
      card.addEventListener("click", function () {
        console.log("Roof type card clicked:", this.dataset.value)
        roofTypeCards.forEach((c) => c.classList.remove("selected"))
        this.classList.add("selected")

        // Update hidden input
        const hiddenInput = document.getElementById("roof_type")
        if (hiddenInput) {
          hiddenInput.value = this.dataset.value
        }
      })
    })

    // Select the first card of each type by default
    if (materialCards.length > 0) {
      materialCards[0].classList.add("selected")
    }

    if (roofTypeCards.length > 0) {
      roofTypeCards[0].classList.add("selected")
    }
  }

  // Initialize cards after showing the first step
  initializeCards()
})

