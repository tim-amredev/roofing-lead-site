document.addEventListener("DOMContentLoaded", () => {
  console.log("LeadPerfection integration script loaded")

  // Target the questionnaire form
  const questionnaireForm = document.getElementById("questionnaire-form")

  if (questionnaireForm) {
    console.log("Questionnaire form found, setting up data storage")

    // Add a submit event listener that only stores data
    questionnaireForm.addEventListener("submit", function (e) {
      try {
        console.log("Form submitted, processing data for LeadPerfection")

        // Create a simple object to store form data
        const formDataObj = {}

        // Get all input, select, and textarea elements
        const formElements = this.querySelectorAll("input, select, textarea")

        console.log(`Processing ${formElements.length} form elements`)

        // Process each element
        formElements.forEach((element) => {
          // Skip hidden FormSubmit fields
          if (element.name && element.name.startsWith("_")) {
            console.log(`Skipping FormSubmit field: ${element.name}`)
            return
          }

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
                console.log(`Added array value: ${cleanName}[] = ${element.value}`)
              } else {
                formDataObj[element.name] = element.value
                console.log(`Added checked value: ${element.name} = ${element.value}`)
              }
            }
          } else if (element.name) {
            // Handle regular inputs, selects, and textareas
            formDataObj[element.name] = element.value

            // Log important fields for debugging
            if (["firstname", "lastname", "email", "phone", "zip"].includes(element.name)) {
              console.log(`Added key field: ${element.name} = ${element.value}`)
            }
          }
        })

        // Validate required fields for LeadPerfection
        if (!formDataObj.zip) {
          console.warn("Warning: ZIP code is missing, which is required for LeadPerfection")
        }

        if (!formDataObj.phone) {
          console.warn("Warning: Phone number is missing, which is required for LeadPerfection")
        }

        // Store in localStorage
        localStorage.setItem("roofingFormData", JSON.stringify(formDataObj))
        console.log("Form data saved to localStorage for LeadPerfection integration")

        // Create a hidden iframe for the thank-you page
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.name = 'thank-you-frame';
        document.body.appendChild(iframe);

        // Set the form target to the iframe
        // This allows FormSubmit to process the form while we handle the redirect
        this.target = 'thank-you-frame';

        // Let the form submission continue
        setTimeout(() => {
          // Redirect to thank-you page after a short delay
          window.location.href = '/thank-you';
        }, 1000);
      } catch (error) {
        console.error("Error saving form data:", error)
      }
    })
  } else {
    console.warn("Questionnaire form not found - LeadPerfection integration may not work")
  }
})
