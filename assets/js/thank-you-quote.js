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

      // Send data to LeadPerfection automatically
      sendToLeadPerfection(formData)
    } else {
      console.log("No form data found in localStorage")
    }
  } catch (error) {
    console.error("Error retrieving form data:", error)
  }

  // Function to send data to LeadPerfection
  function sendToLeadPerfection(data) {
    // Prepare data for LeadPerfection
    const leadPerfectionData = new URLSearchParams()

    // Map form fields to LeadPerfection parameters
    leadPerfectionData.append("firstname", data.firstname || "")
    leadPerfectionData.append("lastname", data.lastname || "")
    leadPerfectionData.append("address1", data.street_address || "")
    leadPerfectionData.append("city", data.city || "")
    leadPerfectionData.append("state", data.state || "")
    leadPerfectionData.append("zip", data.zip || "")
    leadPerfectionData.append("phone1", data.phone || "")
    leadPerfectionData.append("email", data.email || "")

    // Add the specific product ID for roofing
    leadPerfectionData.append("productid", "Roof")
    leadPerfectionData.append("proddescr", "Roofing")

    // Build notes from form data
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
    notes += `Comments: ${data.comments || "N/A"}`

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
        // Clear localStorage after successful send
        localStorage.removeItem("roofingFormData")
      })
      .catch((error) => {
        console.error("Error sending to LeadPerfection:", error)
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

