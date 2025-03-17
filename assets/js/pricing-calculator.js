document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calculator-form")
  const resultsSection = document.getElementById("results-section")
  const recalculateBtn = document.getElementById("recalculate-btn")
  const additionsList = document.getElementById("additions-list")
  const resultAdditions = document.getElementById("result-additions")

  // Add event listeners for pitch selection buttons
  const pitchButtons = document.querySelectorAll(".pitch-option")
  pitchButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove selected class from all buttons
      pitchButtons.forEach((btn) => btn.classList.remove("selected"))
      // Add selected class to clicked button
      this.classList.add("selected")
      // Update hidden input value
      document.getElementById("roof-pitch").value = this.dataset.pitch
    })
  })

  // Add event listeners for material selection
  const materialOptions = document.querySelectorAll('.material-option input[type="radio"]')
  materialOptions.forEach((option) => {
    option.addEventListener("change", function () {
      // Update visual selection if needed
      const label = document.querySelector(`label[for="${this.id}"]`)
      if (label) {
        const allLabels = document.querySelectorAll(".material-option label")
        allLabels.forEach((l) => l.parentElement.classList.remove("selected"))
        label.parentElement.classList.add("selected")
      }
    })
  })

  form.addEventListener("submit", (e) => {
    e.preventDefault()

    // Validate contact information fields
    const firstName = document.getElementById("first-name").value.trim()
    const lastName = document.getElementById("last-name").value.trim()
    const email = document.getElementById("email").value.trim()
    const phone = document.getElementById("phone").value.trim()
    const streetAddress = document.getElementById("street-address").value.trim()
    const zipCode = document.getElementById("zip-code").value.trim()
    const state = document.getElementById("state").value.trim()

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !streetAddress || !zipCode || !state) {
      alert("Please fill in all contact information fields to get your estimate.")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.")
      return
    }

    // Calculate the estimate and collect the results
    const estimateData = calculateEstimate()

    // If calculation was successful, send the data
    if (estimateData) {
      // Collect contact information
      const contactInfo = {
        firstName,
        lastName,
        email,
        phone,
        streetAddress,
        zipCode,
        state,
      }

      // Send the data to the email
      sendFormData(contactInfo, estimateData)
    }
  })

  recalculateBtn.addEventListener("click", () => {
    resultsSection.classList.add("hidden")
    // Don't reset the form completely to preserve contact info
    // Just scroll back to the form
    form.scrollIntoView({ behavior: "smooth" })
  })

  function calculateEstimate() {
    const area = Number.parseFloat(document.getElementById("roof-area").value)
    const pitch = document.getElementById("roof-pitch").value || "medium" // Default to medium if not selected
    const material = document.querySelector('input[name="material"]:checked')?.value || "asphalt" // Default to asphalt if not selected
    const region = "midwest" // Default region if not specified in the UI
    const additions = {
      removal: document.getElementById("option-removal").checked,
      underlayment: document.getElementById("option-underlayment").checked,
      ventilation: document.getElementById("option-ventilation").checked,
      gutters: document.getElementById("option-gutters").checked,
      insulation: document.getElementById("option-insulation").checked,
    }

    // Input validation
    if (isNaN(area) || area < 100 || area > 10000) {
      alert("Please enter a valid roof area between 100 and 10,000 sq ft.")
      return null
    }

    // Pricing data (hypothetical, based on 2025 industry averages)
    const pricing = {
      materials: {
        asphalt: { low: 4.5, high: 7.5 },
        premium: { low: 6.5, high: 11.0 },
        metal: { low: 9.0, high: 17.0 },
        wood: { low: 8.0, high: 15.0 },
        tile: { low: 13.0, high: 27.0 },
        slate: { low: 20.0, high: 45.0 },
      },
      pitchMultipliers: {
        flat: 1.0,
        low: 1.1,
        medium: 1.2,
        steep: 1.4,
        "very-steep": 1.6,
      },
      regionMultipliers: {
        northeast: 1.25,
        midwest: 1.0,
        south: 0.95,
        west: 1.2,
        northwest: 1.15,
        southwest: 1.1,
      },
      additions: {
        removal: { low: 1.5, high: 2.5 }, // per sq ft
        underlayment: { flat: 500, high: 1000 }, // flat fee
        ventilation: { flat: 600, high: 1200 }, // flat fee
        gutters: { low: 4.0, high: 8.0 }, // per sq ft
        insulation: { low: 2.0, high: 4.0 }, // per sq ft
      },
    }

    // Calculate base cost
    let lowBase =
      area * pricing.materials[material].low * pricing.pitchMultipliers[pitch] * pricing.regionMultipliers[region]
    let highBase =
      area * pricing.materials[material].high * pricing.pitchMultipliers[pitch] * pricing.regionMultipliers[region]

    // Add additional costs
    if (additions.removal) {
      lowBase += area * pricing.additions.removal.low
      highBase += area * pricing.additions.removal.high
    }
    if (additions.underlayment) {
      lowBase += pricing.additions.underlayment.flat
      highBase += pricing.additions.underlayment.high
    }
    if (additions.ventilation) {
      lowBase += pricing.additions.ventilation.flat
      highBase += pricing.additions.ventilation.high
    }
    if (additions.gutters) {
      lowBase += area * pricing.additions.gutters.low
      highBase += area * pricing.additions.gutters.high
    }
    if (additions.insulation) {
      lowBase += area * pricing.additions.insulation.low
      highBase += area * pricing.additions.insulation.high
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

    // Update results section
    document.getElementById("low-estimate").textContent = lowEstimate
    document.getElementById("high-estimate").textContent = highEstimate
    document.getElementById("average-estimate").textContent = averageEstimate
    document.getElementById("result-area").textContent = `${area.toLocaleString()} sq ft`

    // Get the material label text
    const materialLabel = document.querySelector(`label[for="material-${material}"]`)
    const materialText = materialLabel ? materialLabel.querySelector("h3").textContent : "Asphalt Shingles"
    document.getElementById("result-material").textContent = materialText

    // Get the pitch text
    const pitchOption = document.querySelector(`button[data-pitch="${pitch}"]`)
    const pitchText = pitchOption ? pitchOption.querySelector("span:first-child").textContent : "Medium"
    document.getElementById("result-pitch").textContent = pitchText

    // Get the location text (hardcoded to Midwest for now)
    document.getElementById("result-location").textContent = "Midwest"

    // Display additional options
    additionsList.innerHTML = ""
    const activeAdditions = Object.entries(additions).filter(([_, checked]) => checked)
    if (activeAdditions.length > 0) {
      resultAdditions.classList.remove("hidden")
      activeAdditions.forEach(([key]) => {
        const li = document.createElement("li")
        const label = document.querySelector(`label[for="option-${key}"]`)
        li.textContent = label ? label.querySelector(".font-medium").textContent : key
        additionsList.appendChild(li)
      })
    } else {
      resultAdditions.classList.add("hidden")
    }

    // Show results
    resultsSection.classList.remove("hidden")
    resultsSection.scrollIntoView({ behavior: "smooth" })

    // Return the estimate data for email submission
    return {
      roofArea: area,
      material: materialText,
      pitch: pitchText,
      location: "Midwest",
      selectedAdditions: activeAdditions.map(([key]) => {
        const label = document.querySelector(`label[for="option-${key}"]`)
        return label ? label.querySelector(".font-medium").textContent : key
      }),
      lowEstimate,
      highEstimate,
      averageEstimate,
    }
  }

  // Function to send form data to email
  function sendFormData(contactInfo, estimateData) {
    // Create form data object
    const formData = new FormData()

    // Add contact information
    formData.append("firstName", contactInfo.firstName)
    formData.append("lastName", contactInfo.lastName)
    formData.append("email", contactInfo.email)
    formData.append("phone", contactInfo.phone)
    formData.append("streetAddress", contactInfo.streetAddress)
    formData.append("zipCode", contactInfo.zipCode)
    formData.append("state", contactInfo.state)

    // Add estimate information
    formData.append("roofArea", estimateData.roofArea)
    formData.append("material", estimateData.material)
    formData.append("pitch", estimateData.pitch)
    formData.append("location", estimateData.location)
    formData.append("selectedAdditions", estimateData.selectedAdditions.join(", "))
    formData.append("lowEstimate", estimateData.lowEstimate)
    formData.append("highEstimate", estimateData.highEstimate)
    formData.append("averageEstimate", estimateData.averageEstimate)

    // Add the FormSubmitAttachment snippet ID
    formData.append("_formsubmit_id", "tim@americanremodeling.net")

    // Send to FormSubmit
    fetch("https://formsubmit.co/ajax/tim@americanremodeling.net", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        console.log("Form submitted successfully")

        // Fire Facebook Pixel event
        if (typeof fbq !== "undefined") {
          const priceValue = Number.parseFloat(estimateData.averageEstimate.replace(/[$,]/g, ""))
          fbq("track", "Lead", {
            value: priceValue,
            currency: "USD",
            content_name: "Roofing Estimate",
            content_category: "Roofing",
          })
        }
      })
      .catch((error) => {
        console.error("Error submitting form:", error)
        alert(
          "There was an error submitting your information. Your estimate is displayed below, but please try again later to ensure we receive your contact details.",
        )
      })
  }

  // Set default pitch to medium
  const mediumPitchButton = document.querySelector('button[data-pitch="medium"]')
  if (mediumPitchButton) {
    mediumPitchButton.classList.add("selected")
    document.getElementById("roof-pitch").value = "medium"
  }

  // Set default material to asphalt
  const asphaltRadio = document.getElementById("material-asphalt")
  if (asphaltRadio) {
    asphaltRadio.checked = true
  }
})

