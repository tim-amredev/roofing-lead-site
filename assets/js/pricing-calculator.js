document.addEventListener("DOMContentLoaded", () => {
  const calculatorForm = document.getElementById("calculator-form")
  const resultsSection = document.getElementById("results-section")
  const recalculateBtn = document.getElementById("recalculate-btn")

  // Material price ranges (per sq ft)
  const materialPrices = {
    asphalt: { min: 4.0, max: 7.0 },
    metal: { min: 8.5, max: 16.0 },
    tile: { min: 12.0, max: 25.0 },
    wood: { min: 7.5, max: 14.0 },
    slate: { min: 18.0, max: 40.0 },
    premium: { min: 6.0, max: 10.0 },
  }

  // Additional options costs
  const additionalCosts = {
    "option-removal": { min: 1.25, max: 2.5, label: "Old Roof Removal" },
    "option-underlayment": { min: 0.75, max: 1.5, label: "Premium Underlayment" },
    "option-ventilation": { min: 1.5, max: 3.0, label: "Improved Ventilation" },
    "option-gutters": { min: 2.5, max: 5.0, label: "New Gutters & Downspouts" },
    "option-insulation": { min: 2.0, max: 4.0, label: "Additional Insulation" },
  }

  // Pitch multipliers (affects labor cost)
  const pitchMultipliers = {
    flat: 1.0,
    low: 1.1,
    medium: 1.2,
    steep: 1.4,
    "very-steep": 1.6,
  }

  // Location cost factors
  const locationFactors = {
    northeast: 1.25,
    midwest: 1.0,
    south: 0.9,
    west: 1.35,
    northwest: 1.2,
    southwest: 1.15,
  }

  // Format currency
  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Calculate estimate
  function calculateEstimate() {
    // Get form values
    const roofArea = Number.parseFloat(document.getElementById("roof-area").value)
    const roofPitch = document.getElementById("roof-pitch").value
    const location = document.getElementById("location").value

    // Get selected material
    let selectedMaterial
    const materialInputs = document.querySelectorAll('input[name="material"]')
    materialInputs.forEach((input) => {
      if (input.checked) {
        selectedMaterial = input.value
      }
    })

    // Base costs
    const materialCost = materialPrices[selectedMaterial]
    const pitchMultiplier = pitchMultipliers[roofPitch]
    const locationFactor = locationFactors[location]

    // Calculate base estimate
    let lowEstimate = roofArea * materialCost.min * pitchMultiplier * locationFactor
    let highEstimate = roofArea * materialCost.max * pitchMultiplier * locationFactor

    // Add additional options
    const selectedAdditions = []
    Object.keys(additionalCosts).forEach((option) => {
      const checkbox = document.getElementById(option)
      if (checkbox && checkbox.checked) {
        const optionCost = additionalCosts[option]
        lowEstimate += roofArea * optionCost.min
        highEstimate += roofArea * optionCost.max
        selectedAdditions.push(optionCost.label)
      }
    })

    // Calculate average
    const averageEstimate = (lowEstimate + highEstimate) / 2

    // Update results
    document.getElementById("low-estimate").textContent = formatCurrency(lowEstimate)
    document.getElementById("high-estimate").textContent = formatCurrency(highEstimate)
    document.getElementById("average-estimate").textContent = formatCurrency(averageEstimate)

    // Update project details
    document.getElementById("result-area").textContent = `${roofArea} sq ft`

    // Convert material ID to readable name
    const materialNames = {
      asphalt: "Asphalt Shingles",
      metal: "Metal Roofing",
      tile: "Clay/Concrete Tile",
      wood: "Wood Shingles",
      slate: "Slate",
      premium: "Premium Shingles",
    }
    document.getElementById("result-material").textContent = materialNames[selectedMaterial]

    // Convert pitch to readable name
    const pitchNames = {
      flat: "Flat",
      low: "Low",
      medium: "Medium",
      steep: "Steep",
      "very-steep": "Very Steep",
    }
    document.getElementById("result-pitch").textContent = pitchNames[roofPitch]

    // Convert location to readable name
    const locationNames = {
      northeast: "Northeast",
      midwest: "Midwest",
      south: "South",
      west: "West",
      northwest: "Northwest",
      southwest: "Southwest",
    }
    document.getElementById("result-location").textContent = locationNames[location]

    // Show additional options if any were selected
    const additionsList = document.getElementById("additions-list")
    const resultAdditions = document.getElementById("result-additions")

    if (selectedAdditions.length > 0) {
      additionsList.innerHTML = ""
      selectedAdditions.forEach((addition) => {
        const li = document.createElement("li")
        li.textContent = addition
        additionsList.appendChild(li)
      })
      resultAdditions.classList.remove("hidden")
    } else {
      resultAdditions.classList.add("hidden")
    }

    // Show results section
    resultsSection.classList.remove("hidden")
    resultsSection.scrollIntoView({ behavior: "smooth" })
  }

  // Material selection styling
  const materialOptions = document.querySelectorAll('.material-option input[type="radio"]')
  materialOptions.forEach((radio) => {
    radio.addEventListener("change", function () {
      // Remove selected class from all options
      document.querySelectorAll('.material-option input[type="radio"] + label > div').forEach((div) => {
        div.style.borderColor = "rgba(255, 255, 255, 0.1)"
        div.style.boxShadow = "none"
        div.style.backgroundColor = "#2E4A7D"
      })

      // Add selected class to the chosen option
      if (this.checked) {
        const label = document.querySelector(`label[for="${this.id}"]`)
        const div = label.querySelector("div")
        div.style.borderColor = "#D4A017"
        div.style.boxShadow = "0 0 0 2px #D4A017"
        div.style.backgroundColor = "#3E4E88"
      }
    })
  })

  // Form submission
  if (calculatorForm) {
    calculatorForm.addEventListener("submit", (e) => {
      e.preventDefault()
      calculateEstimate()
    })
  }

  // Recalculate button
  if (recalculateBtn) {
    recalculateBtn.addEventListener("click", () => {
      resultsSection.classList.add("hidden")
      window.scrollTo({
        top: calculatorForm.offsetTop - 100,
        behavior: "smooth",
      })
    })
  }
})

