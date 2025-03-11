document.addEventListener("DOMContentLoaded", () => {
  // Target the questionnaire form
  const questionnaireForm = document.getElementById("questionnaire-form")

  if (questionnaireForm) {
    // Create a hidden iframe for the form submission
    const hiddenIframe = document.createElement("iframe")
    hiddenIframe.name = "hidden-form-iframe"
    hiddenIframe.style.display = "none"
    document.body.appendChild(hiddenIframe)

    // Set the form target to the hidden iframe
    questionnaireForm.target = "hidden-form-iframe"

    // Add a submit event listener
    questionnaireForm.addEventListener("submit", function (e) {
      // Don't prevent default - let the form submit to the iframe

      // Store form data for LeadPerfection
      const formData = new FormData(this)

      // Save form data to localStorage to be sent after redirect
      const leadPerfectionData = {
        firstname: formData.get("firstname") || "",
        lastname: formData.get("lastname") || "",
        address1: formData.get("street_address") || "",
        city: formData.get("city") || "",
        state: formData.get("state") || "",
        zip: formData.get("zip") || "",
        phone1: formData.get("phone") || "",
        email: formData.get("email") || "",
        productid: "Roof",
        proddescr: "Roofing",
        sender: "Instantroofingprices.com",
        srs_id: "1669",
        notes: buildNotesFromForm(formData),
      }

      // Store in localStorage for retrieval on thank-you page
      localStorage.setItem("leadPerfectionData", JSON.stringify(leadPerfectionData))

      // Track conversion with Facebook Pixel if available
      if (typeof fbq === "function") {
        fbq("track", "Lead", {
          content_name: "Roofing Quote",
          content_category: "Roofing",
        })
      }

      // Continue with normal form submission
      return true
    })
  }

  // Helper function to build notes from form data
  function buildNotesFromForm(formData) {
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

    return notes
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

      // Use the Navigator.sendBeacon API for more reliable delivery during page unload
      const leadPerfectionUrl = "https://th97.leadperfection.com/batch/addleads.asp"

      if (navigator.sendBeacon) {
        navigator.sendBeacon(leadPerfectionUrl, leadPerfectionData)
      } else {
        // Fallback to fetch if sendBeacon is not available
        fetch(leadPerfectionUrl, {
          method: "POST",
          body: leadPerfectionData,
          keepalive: true,
        }).catch((error) => {
          console.error("Error sending contact form to LeadPerfection:", error)
        })
      }

      // Continue with normal form submission
      return true
    })
  }
})

