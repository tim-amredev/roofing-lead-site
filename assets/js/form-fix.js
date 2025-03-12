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
})

