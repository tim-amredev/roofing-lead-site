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
  const form = document.querySelector("form") // Declare the form variable

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
    nextBtn.style.opacity = "1"
    nextBtn.style.visibility = "visible"
    nextBtn.style.position = "relative"
    nextBtn.style.zIndex = "50"
    nextBtn.style.minWidth = "120px"
    nextBtn.style.minHeight = "48px"
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
    prevBtn.style.opacity = "1"
    prevBtn.style.visibility = "visible"
    prevBtn.style.position = "relative"
    prevBtn.style.zIndex = "50"
    prevBtn.style.minWidth = "120px"
    prevBtn.style.minHeight = "48px"
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

  // Create emergency buttons if the regular ones aren't working
  setTimeout(() => {
    const nextBtnVisible = nextBtn && window.getComputedStyle(nextBtn).display !== "none"
    console.log("Next button visible:", nextBtnVisible)

    if (!nextBtnVisible && steps.length > 0) {
      console.log("Creating emergency buttons")

      // Create container for emergency buttons
      const emergencyContainer = document.createElement("div")
      emergencyContainer.id = "emergency-nav-buttons"
      emergencyContainer.style.position = "fixed"
      emergencyContainer.style.bottom = "20px"
      emergencyContainer.style.left = "0"
      emergencyContainer.style.right = "0"
      emergencyContainer.style.display = "flex"
      emergencyContainer.style.justifyContent = "center"
      emergencyContainer.style.gap = "20px"
      emergencyContainer.style.zIndex = "9999"
      emergencyContainer.style.padding = "10px"
      emergencyContainer.style.backgroundColor = "rgba(0,0,0,0.7)"

      // Create emergency next button
      const emergencyNext = document.createElement("button")
      emergencyNext.textContent = "Next"
      emergencyNext.style.backgroundColor = "#D4A017"
      emergencyNext.style.color = "#181818"
      emergencyNext.style.padding = "10px 20px"
      emergencyNext.style.borderRadius = "8px"
      emergencyNext.style.fontWeight = "bold"
      emergencyNext.style.cursor = "pointer"
      emergencyNext.style.border = "none"

      // Create emergency prev button
      const emergencyPrev = document.createElement("button")
      emergencyPrev.textContent = "Previous"
      emergencyPrev.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
      emergencyPrev.style.color = "white"
      emergencyPrev.style.padding = "10px 20px"
      emergencyPrev.style.borderRadius = "8px"
      emergencyPrev.style.fontWeight = "bold"
      emergencyPrev.style.cursor = "pointer"
      emergencyPrev.style.border = "none"
      emergencyPrev.style.display = "none" // Initially hidden

      // Add click handlers
      emergencyNext.addEventListener("click", () => {
        if (currentStep < totalSteps - 1) {
          currentStep++
          showStep(currentStep)
          window.scrollTo(0, 0)

          // Show/hide emergency buttons
          if (currentStep > 0) {
            emergencyPrev.style.display = "block"
          }

          if (currentStep === totalSteps - 1) {
            emergencyNext.textContent = "Submit"
            emergencyNext.addEventListener(
              "click",
              () => {
                // Submit the form
                if (form) {
                  console.log("Emergency submit button clicked, submitting form")

                  // Store form data for LeadPerfection before submitting
                  try {
                    const formData = new FormData(form)
                    const formDataObj = {}

                    formData.forEach((value, key) => {
                      // Skip FormSubmit's internal fields
                      if (key.startsWith("_")) return

                      // Handle checkbox arrays
                      if (key.endsWith("[]")) {
                        const cleanKey = key.replace("[]", "")
                        if (!formDataObj[cleanKey]) {
                          formDataObj[cleanKey] = []
                        }
                        formDataObj[cleanKey].push(value)
                      } else {
                        formDataObj[key] = value
                      }
                    })

                    localStorage.setItem("roofingFormData", JSON.stringify(formDataObj))
                    console.log("Form data saved to localStorage from emergency button")
                  } catch (error) {
                    console.error("Error saving form data from emergency button:", error)
                  }

                  form.submit()
                }
              },
              { once: true },
            )
          }
        }
      })

      emergencyPrev.addEventListener("click", () => {
        if (currentStep > 0) {
          currentStep--
          showStep(currentStep)
          window.scrollTo(0, 0)

          // Show/hide emergency buttons
          if (currentStep === 0) {
            emergencyPrev.style.display = "none"
          }

          if (currentStep < totalSteps - 1) {
            emergencyNext.textContent = "Next"
          }
        }
      })

      // Add buttons to container
      emergencyContainer.appendChild(emergencyPrev)
      emergencyContainer.appendChild(emergencyNext)

      // Add container to body
      document.body.appendChild(emergencyContainer)
    }
  }, 2000)

  console.log("Direct fix script initialization complete")
})

