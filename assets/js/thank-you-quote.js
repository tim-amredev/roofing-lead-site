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

      // Create manual submission button for LeadPerfection
      createManualSubmissionButton(formData)
    } else {
      console.log("No form data found in localStorage")
    }
  } catch (error) {
    console.error("Error retrieving form data:", error)
  }

  // Function to create a manual submission button
  function createManualSubmissionButton(data) {
    try {
      // Create a container for the manual submission
      const manualContainer = document.createElement("div")
      manualContainer.className = "mt-8 p-4 bg-blue-900 bg-opacity-30 rounded-lg max-w-3xl mx-auto text-center"
      manualContainer.style.backgroundColor = "rgba(30, 58, 138, 0.3)"

      // Create heading
      const heading = document.createElement("h3")
      heading.className = "text-xl font-bold text-white mb-4"
      heading.textContent = "Complete Your Submission"
      manualContainer.appendChild(heading)

      // Create description
      const description = document.createElement("p")
      description.className = "text-gray-300 mb-4"
      description.textContent = "Click the button below to send your information to our roofing specialists."
      manualContainer.appendChild(description)

      // Create the button
      const button = document.createElement("button")
      button.type = "button"
      button.className =
        "inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        Complete Submission
      `

      // Add click event to the button
      button.addEventListener("click", function () {
        // Disable the button to prevent multiple clicks
        this.disabled = true
        this.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sending...
        `

        // Create the form data for submission
        const formData = new FormData()

        // Add required fields
        formData.append("zip", data.zip || "")
        formData.append("phone1", formatPhoneNumber(data.phone || ""))
        formData.append("sender", "Instantroofingprices.com")
        formData.append("srs_id", "1669")

        // Add optional fields
        formData.append("firstname", truncate(data.firstname || "", 25))
        formData.append("lastname", truncate(data.lastname || "", 25))
        formData.append("address1", truncate(data.street_address || "", 35))
        formData.append("city", truncate(data.city || "", 35))
        formData.append("state", truncate(data.state || "", 2))
        formData.append("email", truncate(data.email || "", 100))
        formData.append("productid", "Roof")
        formData.append("proddescr", "Roofing")

        // Build notes
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

        formData.append("notes", truncate(notes, 2000))

        // Create a status element
        const statusElement = document.createElement("div")
        statusElement.className = "mt-4 p-3 rounded"
        manualContainer.appendChild(statusElement)

        // Use XMLHttpRequest for the submission
        const xhr = new XMLHttpRequest()
        xhr.open("POST", "https://th97.leadperfection.com/batch/addleads.asp", true)

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              // Success
              statusElement.className = "mt-4 p-3 bg-green-800 bg-opacity-50 text-white rounded"
              statusElement.innerHTML = `
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Submission successful! Our team will contact you soon.</span>
                </div>
              `

              // Clear localStorage
              localStorage.removeItem("roofingFormData")

              // Update button
              button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Submission Complete
              `
              button.disabled = true
              button.className =
                "inline-flex items-center justify-center px-6 py-3 bg-green-700 text-white font-medium rounded-lg cursor-not-allowed"
            } else {
              // Error
              statusElement.className = "mt-4 p-3 bg-red-800 bg-opacity-50 text-white rounded"
              statusElement.innerHTML = `
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <span>There was an error with your submission. Please try again or contact us directly.</span>
                </div>
                <div class="mt-2 text-sm">Error: ${xhr.status} ${xhr.statusText}</div>
                <div class="mt-2 text-sm">Response: ${xhr.responseText}</div>
              `

              // Update button
              button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                </svg>
                Try Again
              `
              button.disabled = false
            }
          }
        }

        // Send the request
        xhr.send(formData)
      })

      manualContainer.appendChild(button)

      // Add the container to the page
      document.querySelector(".container").appendChild(manualContainer)

      // Add debug info
      const debugInfo = document.getElementById("debug-info")
      if (debugInfo) {
        debugInfo.style.display = "block"
        debugInfo.innerHTML = "<strong>Form Data Ready for Submission:</strong><br>"
        debugInfo.innerHTML += `Zip: ${data.zip || "Not provided"}<br>`
        debugInfo.innerHTML += `Phone: ${data.phone || "Not provided"}<br>`
        debugInfo.innerHTML += `Name: ${data.firstname || ""} ${data.lastname || ""}<br>`
        debugInfo.innerHTML += `Email: ${data.email || "Not provided"}<br>`
      }
    } catch (error) {
      console.error("Error creating manual submission button:", error)
    }
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

  // Track conversion with Facebook Pixel if available
  try {
    if (typeof window.fbq === "function") {
      console.log("Tracking conversion with Facebook Pixel")
      window.fbq("track", "Lead", {
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
    if (typeof window.gtag === "function") {
      console.log("Tracking conversion with Google Analytics")
      window.gtag("event", "generate_lead", {
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

