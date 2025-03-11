document.addEventListener("DOMContentLoaded", () => {
  // Target the questionnaire form
  const questionnaireForm = document.getElementById("questionnaire-form")

  if (questionnaireForm) {
    // Add a submit event listener
    questionnaireForm.addEventListener("submit", function (e) {
      // Don't prevent default - let the form submit normally to FormSubmit

      try {
        // Collect form data
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

        // Store in localStorage as backup
        localStorage.setItem("roofingFormData", JSON.stringify(formDataObj))

        // Prepare data for LeadPerfection
        const leadPerfectionData = new URLSearchParams()

        // Map form fields to LeadPerfection parameters
        leadPerfectionData.append("firstname", formDataObj.firstname || "")
        leadPerfectionData.append("lastname", formDataObj.lastname || "")
        leadPerfectionData.append("address1", formDataObj.street_address || "")
        leadPerfectionData.append("city", formDataObj.city || "")
        leadPerfectionData.append("state", formDataObj.state || "")
        leadPerfectionData.append("zip", formDataObj.zip || "")
        leadPerfectionData.append("phone1", formDataObj.phone || "")
        leadPerfectionData.append("email", formDataObj.email || "")

        // Add the specific product ID for roofing
        leadPerfectionData.append("productid", "Roof")
        leadPerfectionData.append("proddescr", "Roofing")

        // Build notes from form data
        let notes = "Project Details:\n"
        notes += `Reason: ${formDataObj.reason || "N/A"}\n`
        notes += `Roof Age: ${formDataObj.roof_age || "N/A"}\n`
        notes += `Square Footage: ${formDataObj.square_footage || "N/A"}\n`
        notes += `Current Material: ${formDataObj.current_material || "N/A"}\n`
        notes += `Desired Material: ${formDataObj.desired_material || "N/A"}\n`
        notes += `Roof Type: ${formDataObj.roof_type || "N/A"}\n`

        // Handle issues array
        if (formDataObj.issues) {
          const issues = Array.isArray(formDataObj.issues) ? formDataObj.issues : [formDataObj.issues]
          notes += `Issues: ${issues.join(", ")}\n`
        }

        // Handle features array
        if (formDataObj.features) {
          const features = Array.isArray(formDataObj.features) ? formDataObj.features : [formDataObj.features]
          notes += `Desired Features: ${features.join(", ")}\n`
        }

        notes += `Timeframe: ${formDataObj.timeframe || "N/A"}\n`
        notes += `Budget: ${formDataObj.budget || "N/A"}\n`
        notes += `Comments: ${formDataObj.comments || "N/A"}`

        leadPerfectionData.append("notes", notes)

        // Add the required fields with exact values provided by LeadPerfection
        leadPerfectionData.append("sender", "Instantroofingprices.com")
        leadPerfectionData.append("srs_id", "1669")

        // Send to LeadPerfection in the background
        const leadPerfectionUrl = "https://th97.leadperfection.com/batch/addleads.asp"

        // Use the Navigator.sendBeacon API for reliable background sending
        if (navigator.sendBeacon) {
          navigator.sendBeacon(leadPerfectionUrl, leadPerfectionData)
          console.log("Data sent to LeadPerfection via sendBeacon")
        } else {
          // Fallback to fetch with keepalive
          fetch(leadPerfectionUrl, {
            method: "POST",
            body: leadPerfectionData,
            mode: "no-cors",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            keepalive: true,
          })
            .then(() => console.log("Data sent to LeadPerfection via fetch"))
            .catch((error) => console.error("Error sending to LeadPerfection:", error))
        }
      } catch (error) {
        console.error("Error processing form data:", error)
      }

      // Continue with normal form submission to FormSubmit
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

