document.addEventListener("DOMContentLoaded", () => {
  // Target the questionnaire form
  const questionnaireForm = document.getElementById("questionnaire-form")

  if (questionnaireForm) {
    questionnaireForm.addEventListener("submit", function (e) {
      // Don't prevent default - let the form submit normally to FormSubmit

      // Create form data for LeadPerfection
      const formData = new FormData(this)
      const leadPerfectionData = new URLSearchParams() // Use URLSearchParams for URL-encoded format

      // Map form fields to LeadPerfection parameters
      // Personal information
      leadPerfectionData.append("firstname", formData.get("firstname") || "")
      leadPerfectionData.append("lastname", formData.get("lastname") || "")
      leadPerfectionData.append("address1", formData.get("street_address") || "")
      leadPerfectionData.append("city", formData.get("city") || "")
      leadPerfectionData.append("state", formData.get("state") || "")
      leadPerfectionData.append("zip", formData.get("zip_code") || "")
      leadPerfectionData.append("phone1", formData.get("phone") || "")
      leadPerfectionData.append("email", formData.get("email") || "")

      // Add the specific product ID for roofing
      leadPerfectionData.append("productid", "Roof")
      leadPerfectionData.append("proddescr", "Roofing")

      // Combine various form fields into notes
      let notes = "Project Details:\n"
      notes += `Reason: ${formData.get("reason") || "N/A"}\n`
      notes += `Roof Age: ${formData.get("roof_age") || "N/A"}\n`
      notes += `Square Footage: ${formData.get("square_footage") || "N/A"}\n`
      notes += `Current Material: ${formData.get("current_material") || "N/A"}\n`
      notes += `Desired Material: ${formData.get("desired_material") || "N/A"}\n`
      notes += `Roof Type: ${formData.get("roof_type") || "N/A"}\n`

      // Handle checkbox arrays
      const issues = formData.getAll("issues[]")
      if (issues.length > 0) {
        notes += `Issues: ${issues.join(", ")}\n`
      }

      const features = formData.getAll("features[]")
      if (features.length > 0) {
        notes += `Desired Features: ${features.join(", ")}\n`
      }

      notes += `Timeframe: ${formData.get("timeframe") || "N/A"}\n`
      notes += `Budget: ${formData.get("budget") || "N/A"}\n`
      notes += `Comments: ${formData.get("comments") || "N/A"}`

      leadPerfectionData.append("notes", notes)

      // Add the required fields with exact values provided by LeadPerfection
      leadPerfectionData.append("sender", "Instantroofingprices.com")
      leadPerfectionData.append("srs_id", "1669")

      // Use a separate asynchronous request that won't block form submission
      setTimeout(() => {
        const leadPerfectionUrl = "https://th97.leadperfection.com/batch/addleads.asp"

        // Create a new XMLHttpRequest
        const xhr = new XMLHttpRequest()
        xhr.open("POST", leadPerfectionUrl, true)
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log("Lead data sent to LeadPerfection successfully")
          } else {
            console.error("Error sending to LeadPerfection:", xhr.statusText)
          }
        }

        xhr.onerror = () => {
          console.error("Network error when sending to LeadPerfection")
        }

        xhr.send(leadPerfectionData.toString())
      }, 100)

      // Continue with normal form submission
      return true
    })
  }

  // Also handle the contact form if needed
  const contactForm = document.getElementById("contact-form")

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      // Don't prevent default - let the form submit normally to FormSubmit

      // Create form data for LeadPerfection
      const formData = new FormData(this)
      const leadPerfectionData = new URLSearchParams()

      // Map contact form fields to LeadPerfection parameters
      leadPerfectionData.append("firstname", formData.get("firstname") || "")
      leadPerfectionData.append("lastname", formData.get("lastname") || "")
      leadPerfectionData.append("phone1", formData.get("phone") || "")
      leadPerfectionData.append("email", formData.get("email") || "")

      // Add the specific product ID for roofing
      leadPerfectionData.append("productid", "Roof")
      leadPerfectionData.append("proddescr", "Roofing")

      // Add message to notes
      leadPerfectionData.append(
        "notes",
        `Subject: ${formData.get("subject") || "N/A"}\nMessage: ${formData.get("message") || "N/A"}`,
      )

      // Add the required fields with exact values provided by LeadPerfection
      leadPerfectionData.append("sender", "Instantroofingprices.com")
      leadPerfectionData.append("srs_id", "1669")

      // Use a separate asynchronous request that won't block form submission
      setTimeout(() => {
        const leadPerfectionUrl = "https://th97.leadperfection.com/batch/addleads.asp"

        // Create a new XMLHttpRequest
        const xhr = new XMLHttpRequest()
        xhr.open("POST", leadPerfectionUrl, true)
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log("Lead data sent to LeadPerfection successfully")
          } else {
            console.error("Error sending to LeadPerfection:", xhr.statusText)
          }
        }

        xhr.onerror = () => {
          console.error("Network error when sending to LeadPerfection")
        }

        xhr.send(leadPerfectionData.toString())
      }, 100)

      // Continue with normal form submission
      return true
    })
  }
})

