document.addEventListener("DOMContentLoaded", () => {
  const quoteSection = document.getElementById("quote-section")
  if (!quoteSection) return

  // Add a manual send button to the page
  const sendSection = document.createElement("div")
  sendSection.className = "mt-8 text-center"
  sendSection.innerHTML = `
    <div id="lead-status" class="mb-4 hidden">
      <p class="text-green-500 font-medium">✓ Lead data sent successfully!</p>
    </div>
    <button id="send-to-lp-btn" class="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
      <span id="btn-text">Send Data to LeadPerfection</span>
      <span id="btn-spinner" class="ml-2 hidden">
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </span>
    </button>
  `
  quoteSection.after(sendSection)

  // Try to get URL parameters first (for direct access)
  const urlParams = new URLSearchParams(window.location.search)

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

      // Clear localStorage after retrieving data
      localStorage.removeItem("roofingFormData")
    } else {
      console.log("No form data found in localStorage")
    }
  } catch (error) {
    console.error("Error retrieving form data:", error)
  }

  // Add click handler for the send button
  const sendButton = document.getElementById("send-to-lp-btn")
  const btnText = document.getElementById("btn-text")
  const btnSpinner = document.getElementById("btn-spinner")
  const leadStatus = document.getElementById("lead-status")

  if (sendButton) {
    sendButton.addEventListener("click", () => {
      // Show spinner
      btnText.textContent = "Sending..."
      btnSpinner.classList.remove("hidden")

      // Prepare data for LeadPerfection
      const leadPerfectionData = new URLSearchParams()

      // Map form fields to LeadPerfection parameters
      leadPerfectionData.append("firstname", formData.firstname || "")
      leadPerfectionData.append("lastname", formData.lastname || "")
      leadPerfectionData.append("address1", formData.street_address || "")
      leadPerfectionData.append("city", formData.city || "")
      leadPerfectionData.append("state", formData.state || "")
      leadPerfectionData.append("zip", formData.zip_code || formData.zip || "")
      leadPerfectionData.append("phone1", formData.phone || "")
      leadPerfectionData.append("email", formData.email || "")

      // Add the specific product ID for roofing
      leadPerfectionData.append("productid", "Roof")
      leadPerfectionData.append("proddescr", "Roofing")

      // Build notes from form data
      let notes = "Project Details:\n"
      notes += `Reason: ${formData.reason || "N/A"}\n`
      notes += `Roof Age: ${formData.roof_age || "N/A"}\n`
      notes += `Square Footage: ${formData.square_footage || "N/A"}\n`
      notes += `Current Material: ${formData.current_material || "N/A"}\n`
      notes += `Desired Material: ${formData.desired_material || "N/A"}\n`
      notes += `Roof Type: ${formData.roof_type || "N/A"}\n`

      // Handle issues array
      if (formData.issues) {
        const issues = Array.isArray(formData.issues) ? formData.issues : [formData.issues]
        notes += `Issues: ${issues.join(", ")}\n`
      }

      // Handle features array
      if (formData.features) {
        const features = Array.isArray(formData.features) ? formData.features : [formData.features]
        notes += `Desired Features: ${features.join(", ")}\n`
      }

      notes += `Timeframe: ${formData.timeframe || "N/A"}\n`
      notes += `Budget: ${formData.budget || "N/A"}\n`
      notes += `Comments: ${formData.comments || "N/A"}`

      leadPerfectionData.append("notes", notes)

      // Add the required fields with exact values provided by LeadPerfection
      leadPerfectionData.append("sender", "Instantroofingprices.com")
      leadPerfectionData.append("srs_id", "1669")

      // Send to LeadPerfection
      const leadPerfectionUrl = "https://th97.leadperfection.com/batch/addleads.asp"

      fetch(leadPerfectionUrl, {
        method: "POST",
        body: leadPerfectionData,
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
        .then(() => {
          console.log("Data sent to LeadPerfection successfully")
          // Hide spinner, show success
          btnText.textContent = "Data Sent Successfully!"
          btnSpinner.classList.add("hidden")
          sendButton.disabled = true
          sendButton.classList.add("bg-green-600")
          sendButton.classList.remove("bg-blue-600", "hover:bg-blue-700")

          // Show status message
          leadStatus.classList.remove("hidden")

          // Clear localStorage after successful send
          localStorage.removeItem("roofingFormData")
        })
        .catch((error) => {
          console.error("Error sending to LeadPerfection:", error)
          // Hide spinner, show error
          btnText.textContent = "Error - Try Again"
          btnSpinner.classList.add("hidden")
        })
    })
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

  // Track conversion with Facebook Pixel if available
  const fbq = window.fbq // Assign the fbq function to a local variable.
  if (typeof fbq === "function") {
    fbq("track", "Lead", {
      content_name: "Roofing Quote",
      content_category: "Roofing",
    })
  }
})

