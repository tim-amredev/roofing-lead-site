document.addEventListener("DOMContentLoaded", () => {
  const quoteSection = document.getElementById("quote-section")
  if (!quoteSection) return

  // Get form data from localStorage
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

  // Try to get stored form data
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

    // Add complexity factor based on issues
    if (formData.issues === "leaks" || formData.issues === "sagging") {
      lowBase *= 1.15
      highBase *= 1.15
    }

    // Add features cost
    if (formData.features !== "none") {
      lowBase *= 1.1
      highBase *= 1.1
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

  // Generate the quote
  generateQuote()
})

