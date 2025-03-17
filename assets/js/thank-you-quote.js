document.addEventListener("DOMContentLoaded", () => {
  const quoteSection = document.getElementById("quote-section")
  if (!quoteSection) return

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

  // Try to get stored calculator data first (from pricing calculator)
  let calculatorData = null
  try {
    const storedCalculatorData = localStorage.getItem("roofingCalculatorData")
    if (storedCalculatorData) {
      calculatorData = JSON.parse(storedCalculatorData)
      // Clear localStorage after using it
      localStorage.removeItem("roofingCalculatorData")
    }
  } catch (error) {
    console.error("Error retrieving calculator data:", error)
  }

  // If we have calculator data, use it directly
  if (calculatorData) {
    displayCalculatorResults(calculatorData)
    return
  }

  // Otherwise, fall back to questionnaire data
  try {
    const storedData = localStorage.getItem("roofingFormData")
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      // Merge with default data
      formData = { ...formData, ...parsedData }
      // Clear localStorage after using it
      localStorage.removeItem("roofingFormData")
    }
  } catch (error) {
    console.error("Error retrieving form data:", error)
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
    if (nameElement && formData.name) {
      nameElement.textContent = formData.name
      nameElement.parentElement.classList.remove("hidden")
    }
  }

  // Function to display calculator results
  function displayCalculatorResults(data) {
    // Get material info
    const material = data.material || "asphalt"
    const materialNames = {
      asphalt: "Asphalt Shingles",
      premium: "Premium Shingles",
      metal: "Metal Roofing",
      wood: "Wood Shingles",
      tile: "Clay/Concrete Tile",
      slate: "Slate",
    }
    const materialName = materialNames[material] || "Asphalt Shingles"

    // Get pitch info
    const pitch = data.pitch || "medium"
    const pitchNames = {
      flat: "Flat",
      low: "Low Slope",
      medium: "Medium",
      steep: "Steep",
      "very-steep": "Very Steep",
    }
    const pitchName = pitchNames[pitch] || "Medium"

    // Get area
    const area = data.area || 1500

    // Pricing data (same as in pricing-calculator.js)
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
      additions: {
        removal: { low: 1.5, high: 2.5 }, // per sq ft
        underlayment: { flat: 500, high: 1000 }, // flat fee
        ventilation: { flat: 600, high: 1200 }, // flat fee
        gutters: { low: 4.0, high: 8.0 }, // per linear ft (estimated as perimeter)
        insulation: { low: 2.0, high: 4.0 }, // per sq ft
      },
    }

    // Calculate base cost using the same logic as pricing-calculator.js
    let lowBase = area * pricing.materials[material].low * pricing.pitchMultipliers[pitch]
    let highBase = area * pricing.materials[material].high * pricing.pitchMultipliers[pitch]

    // Add additional costs
    if (data.removal) {
      lowBase += area * pricing.additions.removal.low
      highBase += area * pricing.additions.removal.high
    }
    if (data.underlayment) {
      lowBase += pricing.additions.underlayment.flat
      highBase += pricing.additions.underlayment.high
    }
    if (data.ventilation) {
      lowBase += pricing.additions.ventilation.flat
      highBase += pricing.additions.ventilation.high
    }
    if (data.gutters) {
      // Estimate perimeter based on square footage (assuming square shape)
      const perimeter = Math.ceil(Math.sqrt(area) * 4)
      lowBase += perimeter * pricing.additions.gutters.low
      highBase += perimeter * pricing.additions.gutters.high
    }
    if (data.insulation) {
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

    // Update the quote section
    document.getElementById("quote-material").textContent = materialName
    document.getElementById("quote-area").textContent = `${area.toLocaleString()} sq ft`
    document.getElementById("quote-low").textContent = lowEstimate
    document.getElementById("quote-high").textContent = highEstimate
    document.getElementById("quote-average").textContent = averageEstimate

    // Personalize greeting if name is available
    const nameElement = document.getElementById("customer-name")
    if (nameElement && (data.firstName || data.lastName)) {
      nameElement.textContent = `${data.firstName || ""} ${data.lastName || ""}`.trim()
      nameElement.parentElement.classList.remove("hidden")
    }
  }

  // Generate the quote if we're using questionnaire data
  if (!calculatorData) {
    generateQuote()
  }
})

