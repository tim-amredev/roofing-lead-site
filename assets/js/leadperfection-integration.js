document.addEventListener("DOMContentLoaded", () => {
  // Target the questionnaire form
  const questionnaireForm = document.getElementById("questionnaire-form")

  if (questionnaireForm) {
    // Add a submit event listener that only stores data but doesn't interfere with submission
    questionnaireForm.addEventListener("submit", function (e) {
      // Don't prevent default - let the form submit normally to FormSubmit

      try {
        // Store form data for LeadPerfection
        const formData = new FormData(this)

        // Create a simple object with the form data
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

        // Store in localStorage for retrieval on thank-you page
        localStorage.setItem("roofingFormData", JSON.stringify(formDataObj))
        console.log("Form data saved to localStorage")
      } catch (error) {
        console.error("Error saving form data:", error)
      }

      // Continue with normal form submission without any interference
      return true
    })
  }

  // Also handle the contact form if needed
  const contactForm = document.getElementById("contact-form")

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      // Don't prevent default - let the form submit normally to FormSubmit
      // Don't do anything else that might interfere with the form submission
    })
  }
})

