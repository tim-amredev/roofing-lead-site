document.addEventListener("DOMContentLoaded", () => {
  const quoteSection = document.getElementById("quote-section")
  if (!quoteSection) return

  // Default form data
  let formData = {
    reason: "replace",
    roof_age: "11-15",
    square_footage: "1501-2000",
    current_material: "asphalt",
    desired_material: "asphalt",
    roof_type: "gabled",
    issues: "age",
    features: "none",
    timeframe: "few-months",
    budget: "10k-15k",
    name: "",
  }

  // Try to get stored form data from localStorage
  try {
    const storedData = localStorage.getItem("roofingFormData")
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      // Merge with default data
      formData = { ...formData, ...parsedData }
      console.log("Retrieved form data from localStorage:", formData)

      // Send data to LeadPerfection using URL-encoded form submission
      sendToLeadPerfection(formData)
    } else {
      console.log("No form data found in localStorage")
    }
  } catch (error) {
    console.error("Error retrieving form data:", error)
  }

  // Function to send data to LeadPerfection using URL-encoded form submission
  function sendToLeadPerfection(data) {
    try {
      console.log("Preparing to send data to LeadPerfection...")

      // Create a form element
      const form = document.createElement("form")
      form.method = "POST"
      form.action = "https://th97.leadperfection.com/batch/addleads.asp"
      form.style.display = "none"
      form.enctype = "application/x-www-form-urlencoded" // Explicitly set encoding type

      // Check if we have the required fields
      if (!data.zip || !data.phone) {
        console.error("Missing required fields for LeadPerfection submission")
        const debugInfo = document.getElementById("debug-info")
        if (debugInfo) {
          debugInfo.style.display = "block"
          debugInfo.innerHTML += `<br><strong>Error:</strong> Missing required fields (zip and phone are required)`
          if (!data.zip) debugInfo.innerHTML += `<br>- Missing zip code`
          if (!data.phone) debugInfo.innerHTML += `<br>- Missing phone number`
        }
        return // Don't proceed with submission
      }

      // Add required fields first (according to documentation)
      // Required: zip, phone1, sender, srs_id
      addFormField(form, "zip", data.zip || "")
      addFormField(form, "phone1", formatPhoneNumber(data.phone || ""))
      addFormField(form, "sender", "Instantroofingprices.com")
      addFormField(form, "srs_id", "1669")

      // Add optional contact fields (with size limits per documentation)
      addFormField(form, "firstname", truncate(data.firstname || "", 25))
      addFormField(form, "lastname", truncate(data.lastname || "", 25))
      addFormField(form, "address1", truncate(data.street_address || "", 35))
      addFormField(form, "city", truncate(data.city || "", 35))
      addFormField(form, "state", truncate(data.state || "", 2))
      addFormField(form, "email", truncate(data.email || "", 100))

      // Add product information
      addFormField(form, "productid", "Roof")
      addFormField(form, "proddescr", "Roofing")

      // Build notes from form data (max 2000 chars per documentation)
      let notes = "Project Details:\n"
      notes += `Reason: ${data.reason || "N/A"}\n`
      notes += `Roof Age: ${data.roof_age || "N/A"}\n`
      notes += `Square Footage: ${data.square_footage || "N/A"}\n`
      notes += `Current Material: ${data.current_material || "N/A"}\n`
      notes += `Desired Material: ${data.desired_material || "N/A"}\n`
      notes += `Roof Type: ${data.roof_type || "N/A"}\n`

      // Handle issues array
      if (data.issues) {
        const issues = Array.isArray(data.issues) ? data.issues : [data.issues]
        notes += `Issues: ${issues.join(", ")}\n`
      }

      // Handle features array
      if (data.features) {
        const features = Array.isArray(data.features) ? data.features : [data.features]
        notes += `Desired Features: ${features.join(", ")}\n`
      }

      notes += `Timeframe: ${data.timeframe || "N/A"}\n`
      notes += `Budget: ${data.budget || "N/A"}\n`

      addFormField(form, "notes", truncate(notes, 2000))

      // Add the form to the document
      document.body.appendChild(form)

      // Log the form data for debugging
      console.log("Form data being sent to LeadPerfection:", {
        zip: data.zip || "",
        phone1: formatPhoneNumber(data.phone || ""),
        sender: "Instantroofingprices.com",
        srs_id: "1669",
        firstname: truncate(data.firstname || "", 25),
        lastname: truncate(data.lastname || "", 25),
        address1: truncate(data.street_address || "", 35),
        city: truncate(data.city || "", 35),
        state: truncate(data.state || "", 2),
        email: truncate(data.email || "", 100),
        productid: "Roof",
        proddescr: "Roofing",
        notes: truncate(notes, 2000),
      })

      // Create a hidden iframe to capture the response
      const responseFrame = document.createElement("iframe")
      responseFrame.name = "lp_response_frame"
      responseFrame.style.display = "none"
      document.body.appendChild(responseFrame)

      // Set the form target to the iframe
      form.target = "lp_response_frame"

      // Add event listener to capture the response
      responseFrame.onload = () => {
        try {
          const frameContent = responseFrame.contentDocument || responseFrame.contentWindow.document
          const responseText = frameContent.body.textContent || frameContent.body.innerText

          console.log("LeadPerfection Response:", responseText)

          // Show response in debug div
          const debugInfo = document.getElementById("debug-info")
          if (debugInfo) {
            debugInfo.style.display = "block"
            debugInfo.innerHTML += `<br><strong>LeadPerfection Response:</strong> ${responseText}`

            // Check if response is [OK]
            if (responseText.trim() === "[OK]") {
              debugInfo.innerHTML += `<br><span style="color: green;">✓ Success! Lead sent to LeadPerfection.</span>`
            } else {
              debugInfo.innerHTML += `<br><span style="color: red;">✗ Error: Unexpected response from LeadPerfection.</span>`
            }
          }

          // Clear localStorage after successful submission
          if (responseText.trim() === "[OK]") {
            setTimeout(() => {
              localStorage.removeItem("roofingFormData")
              console.log("Form data cleared from localStorage")
            }, 2000)
          }
        } catch (error) {
          console.error("Error reading response:", error)

          // Show error in debug div
          const debugInfo = document.getElementById("debug-info")
          if (debugInfo) {
            debugInfo.style.display = "block"
            debugInfo.innerHTML += `<br><strong>Error Reading Response:</strong> ${error.message}`
          }
        }
      }

      // Submit the form
      console.log("Submitting form to LeadPerfection...")
      form.submit()

      // Show submission status in debug div
      const debugInfo = document.getElementById("debug-info")
      if (debugInfo) {
        debugInfo.style.display = "block"
        debugInfo.innerHTML += "<br><strong>LeadPerfection Submission:</strong> Form submitted"
      }
    } catch (error) {
      console.error("Error sending data to LeadPerfection:", error)

      // Show error in debug div
      const debugInfo = document.getElementById("debug-info")
      if (debugInfo) {
        debugInfo.style.display = "block"
        debugInfo.innerHTML += `<br><strong>LeadPerfection Error:</strong> ${error.message}`
      }
    }
  }

  // Helper function to add a field to the form
  function addFormField(form, name, value) {
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = name
    input.value = value
    form.appendChild(input)
  }

  // Helper function to truncate strings to specified length
  function truncate(str, maxLength) {
    return str.length > maxLength ? str.substring(0, maxLength) : str
  }

  // Helper function to format phone number (remove all non-numeric characters)
  function formatPhoneNumber(phone) {
    return phone.replace(/[^\d]/g, "")
  }

  // Pricing data (simplified version of the calculator pricing)
  const pricing = {
    materials: {
      asphalt: { low: 4.5, high: 7.5, name: "Asphalt Shingles" },
      premium: { low: 6.5, high: 11.0, name: "Premium Shingles" },
      metal: { low: 9.0, high: 17.0, name: "Metal Roofing" },
      wood: { low: 8.0, high: 15.0, name: "Wood Shingles" },
      tile: { low: 13.0, high: 27.0, name: "Clay/Concrete Tile" },
      slate: { low: 20.0, high: 45.0, name: "Slate" },
    },
    roofSizes: {
      "less-1000": { min: 800, max: 1000 },
      "1000-1500": { min: 1000, max: 1500 },
      "1501-2000": { min: 1501, max: 2000 },
      "2001-2500": { min: 2001, max: 2500 },
      "2500+": { min: 2500, max: 3500 },
    },
    pitchMultipliers: {
      flat: 1.0,
      gabled: 1.2,
      hip: 1.3,
      mansard: 1.4,
      gambrel: 1.35,
    },
  }

  // Generate a quote based on form data
  function generateQuote() {
    // Determine material
    const material = formData.desired_material || "asphalt"
    const materialInfo = pricing.materials[material] || pricing.materials.asphalt

    // Determine roof size
    const sizeRange = pricing.roofSizes[formData.square_footage] || pricing.roofSizes["1501-2000"]
    const area = Math.floor(Math.random() * (sizeRange.max - sizeRange.min + 1)) + sizeRange.min

    // Determine pitch multiplier
    const pitchMultiplier = pricing.pitchMultipliers[formData.roof_type] || pricing.pitchMultipliers.gabled

    // Calculate base cost
    let lowBase = area * materialInfo.low * pitchMultiplier
    let highBase = area * materialInfo.high * pitchMultiplier

    // Add complexity factor based on issues (now handling array)
    const issues = Array.isArray(formData.issues) ? formData.issues : [formData.issues]
    if (issues.includes("leaks") || issues.includes("sagging")) {
      lowBase *= 1.15
      highBase *= 1.15
    }

    // Add features cost (now handling array)
    const features = Array.isArray(formData.features) ? formData.features : [formData.features]
    if (features.length > 0 && !features.includes("none")) {
      // Add 5% per feature (up to 20%)
      const featureMultiplier = 1 + Math.min(features.length, 4) * 0.05
      lowBase *= featureMultiplier
      highBase *= featureMultiplier
    }

    // Ensure minimum project cost
    const minCost = 5000
    lowBase = Math.max(lowBase, minCost)
    highBase = Math.max(highBase, minCost * 1.2)

    // Format costs
    const lowEstimate = Math.round(lowBase).toLocaleString("en-US", { style: "currency", currency: "USD" })
    const highEstimate = Math.round(highBase).toLocaleString("en-US", { style: "currency", currency: "USD" })
    const averageEstimate = Math.round((lowBase + highBase) / 2).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })

    // Update the quote section
    document.getElementById("quote-material").textContent = materialInfo.name
    document.getElementById("quote-area").textContent = `${area.toLocaleString()} sq ft`
    document.getElementById("quote-low").textContent = lowEstimate
    document.getElementById("quote-high").textContent = highEstimate
    document.getElementById("quote-average").textContent = averageEstimate

    // Personalize greeting if name is available
    const nameElement = document.getElementById("customer-name")
    if (nameElement && formData.firstname) {
      nameElement.textContent = formData.firstname + (formData.lastname ? " " + formData.lastname : "")
      nameElement.parentElement.classList.remove("hidden")
    }

    console.log("Generated quote:", {
      material: materialInfo.name,
      area: area,
      lowEstimate: lowEstimate,
      highEstimate: highEstimate,
      averageEstimate: averageEstimate,
    })
  }

  // Generate the quote
  generateQuote()

  // Declare fbq and gtag as functions to avoid errors if they are not defined
  const fbq =
    window.fbq ||
    (() => {
      console.warn("Facebook Pixel not available")
    })

  const gtag =
    window.gtag ||
    (() => {
      console.warn("Google Analytics not available")
    })

  // Track conversion with Facebook Pixel if available
  try {
    if (typeof fbq === "function") {
      console.log("Tracking conversion with Facebook Pixel")
      fbq("track", "Lead", {
        content_name: "Roofing Quote",
        content_category: "Roofing",
      })
    } else {
      console.log("Facebook Pixel not available")
    }
  } catch (error) {
    console.error("Error tracking Facebook Pixel conversion:", error)
  }

  // Add Google Analytics event tracking if it exists
  try {
    if (typeof gtag === "function") {
      console.log("Tracking conversion with Google Analytics")
      gtag("event", "generate_lead", {
        event_category: "conversion",
        event_label: "roofing_quote",
      })
    } else {
      console.log("Google Analytics not available")
    }
  } catch (error) {
    console.error("Error tracking Google Analytics conversion:", error)
  }
})

