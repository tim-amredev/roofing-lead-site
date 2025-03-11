document.addEventListener("DOMContentLoaded", () => {
  // Target the questionnaire form
  const questionnaireForm = document.getElementById("questionnaire-form")

  if (questionnaireForm) {
    // Add a submit event listener that only stores data
    questionnaireForm.addEventListener("submit", function (e) {
      try {
        // Create a simple object to store form data
        const formDataObj = {}

        // Get all input, select, and textarea elements
        const formElements = this.querySelectorAll("input, select, textarea")

        // Process each element
        formElements.forEach((element) => {
          // Skip hidden FormSubmit fields
          if (element.name && element.name.startsWith("_")) return

          // Handle different input types
          if (element.type === "checkbox" || element.type === "radio") {
            // Only include checked checkboxes and radios
            if (element.checked) {
              // Handle checkbox arrays
              if (element.name.endsWith("[]")) {
                const cleanName = element.name.replace("[]", "")
                if (!formDataObj[cleanName]) {
                  formDataObj[cleanName] = []
                }
                formDataObj[cleanName].push(element.value)
              } else {
                formDataObj[element.name] = element.value
              }
            }
          } else if (element.name) {
            // Handle regular inputs, selects, and textareas
            formDataObj[element.name] = element.value
          }
        })

        // Store in localStorage
        localStorage.setItem("roofingFormData", JSON.stringify(formDataObj))
        console.log("Form data saved to localStorage")
      } catch (error) {
        console.error("Error saving form data:", error)
      }

      // Don't interfere with the form submission
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

