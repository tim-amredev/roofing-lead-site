document.addEventListener("DOMContentLoaded", () => {
  // Target the questionnaire form
  const questionnaireForm = document.getElementById("questionnaire-form")

  if (questionnaireForm) {
    questionnaireForm.addEventListener("submit", function (e) {
      // Don't prevent default - let the form submit normally to FormSubmit

      // Store the form data in localStorage to process after redirect
      const formData = new FormData(this)
      const leadPerfectionData = {}

      // Map form fields to LeadPerfection parameters
      // Personal information
      leadPerfectionData.firstname = formData.get("firstname") || ""
      leadPerfectionData.lastname = formData.get("lastname") || ""
      leadPerfectionData.address1 = formData.get("street_address") || ""
      leadPerfectionData.city = formData.get("city") || ""
      leadPerfectionData.state = formData.get("state") || ""
      leadPerfectionData.zip = formData.get("zip_code") || ""
      leadPerfectionData.phone1 = formData.get("phone") || ""
      leadPerfectionData.email = formData.get("email") || ""

      // Add the specific product ID for roofing
      leadPerfectionData.productid = "Roof"
      leadPerfectionData.proddescr = "Roofing"

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

      leadPerfectionData.notes = notes

      // Add the required fields with exact values provided by LeadPerfection
      leadPerfectionData.sender = "Instantroofingprices.com"
      leadPerfectionData.srs_id = "1669"

      // Store the data in localStorage to be processed after redirect
      localStorage.setItem("leadPerfectionData", JSON.stringify(leadPerfectionData))

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
      const leadPerfectionData = {}

      // Map contact form fields to LeadPerfection parameters
      leadPerfectionData.firstname = formData.get("firstname") || ""
      leadPerfectionData.lastname = formData.get("lastname") || ""
      leadPerfectionData.phone1 = formData.get("phone") || ""
      leadPerfectionData.email = formData.get("email") || ""

      // Add the specific product ID for roofing
      leadPerfectionData.productid = "Roof"
      leadPerfectionData.proddescr = "Roofing"

      // Add message to notes
      leadPerfectionData.notes = `Subject: ${formData.get("subject") || "N/A"}\nMessage: ${formData.get("message") || "N/A"}`

      // Add the required fields with exact values provided by LeadPerfection
      leadPerfectionData.sender = "Instantroofingprices.com"
      leadPerfectionData.srs_id = "1669"

      // Store the data in localStorage to be processed after redirect
      localStorage.setItem("contactLeadPerfectionData", JSON.stringify(leadPerfectionData))

      // Continue with normal form submission
      return true
    })
  }
})

