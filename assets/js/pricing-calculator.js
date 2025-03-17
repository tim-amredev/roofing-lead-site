document.addEventListener("DOMContentLoaded", () => {
  // Get references to key elements
  const form = document.getElementById("calculator-form")
  const resultsSection = document.getElementById("estimate-results")
  const recalculateBtn = document.getElementById("recalculate-btn")
  const additionsList = document.getElementById("additions-list")
  const resultAdditions = document.getElementById("result-additions")

  if (form) {
    // Add a submit handler that calculates and displays the estimate
    // but still allows the form to submit to FormSubmit
    form.addEventListener("submit", (e) => {
      // Calculate the estimate
      calculateAndDisplayEstimate()

      // Store the estimate data in localStorage for potential use after form submission
      storeEstimateData()

      // Continue with normal form submission to FormSubmit
      return true
    })
  }

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

  // Set up recalculate button
  if (recalculateBtn) {
    recalculateBtn.addEventListener("click", () => {
      resultsSection.classList.add("hidden")
      // Scroll back to the form
      form.scrollIntoView({ behavior: "smooth" })
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

  // Function to calculate and display the estimate
  function calculateAndDisplayEstimate() {
    // Get form values
    const area = Number.parseFloat(document.getElementById("roof-area").value)
    const pitch = document.getElementById("roof-pitch").value || "medium"
    const material = document.querySelector('input[name="material"]:checked')?.value || "asphalt"

    // Get additional options
    const additions = {
      removal: document.getElementById("option-removal").checked,
      underlayment: document.getElementById("option-underlayment").checked,
      ventilation: document.getElementById("option-ventilation").checked,
      gutters: document.getElementById("option-gutters").checked,
      insulation: document.getElementById("option-insulation").checked,
    }

    // Pricing data (based on industry averages)
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

    // Calculate base cost
    let lowBase = area * pricing.materials[material].low * pricing.pitchMultipliers[pitch]
    let highBase = area * pricing.materials[material].high * pricing.pitchMultipliers[pitch]

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
      // Estimate perimeter based on square footage (assuming square shape)
      const perimeter = Math.ceil(Math.sqrt(area) * 4)
      lowBase += perimeter * pricing.additions.gutters.low
      highBase += perimeter * pricing.additions.gutters.high
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

    // Display additional options
    additionsList.innerHTML = ""
    const activeAdditions = []

    if (additions.removal) activeAdditions.push("Old Roof Removal")
    if (additions.underlayment) activeAdditions.push("Premium Underlayment")
    if (additions.ventilation) activeAdditions.push("Improved Ventilation")
    if (additions.gutters) activeAdditions.push("New Gutters & Downspouts")
    if (additions.insulation) activeAdditions.push("Additional Insulation")

    if (activeAdditions.length > 0) {
      resultAdditions.classList.remove("hidden")
      activeAdditions.forEach((option) => {
        const li = document.createElement("li")
        li.textContent = option
        additionsList.appendChild(li)
      })
    } else {
      resultAdditions.classList.add("hidden")
    }

    // Show results
    resultsSection.classList.remove("hidden")

    // Add estimate data to hidden fields in the form
    addHiddenField("estimate_low", lowEstimate)
    addHiddenField("estimate_high", highEstimate)
    addHiddenField("estimate_average", averageEstimate)
    addHiddenField("roof_material", materialText)
    addHiddenField("roof_pitch", pitchText)
    addHiddenField("additional_options", activeAdditions.join(", "))
  }

  // Function to add hidden fields to the form
  function addHiddenField(name, value) {
    // Check if field already exists
    let field = form.querySelector(`input[name="${name}"]`)
    if (!field) {
      // Create new field if it doesn't exist
      field = document.createElement("input")
      field.type = "hidden"
      field.name = name
      form.appendChild(field)
    }
    // Set or update the value
    field.value = value
  }

  // Function to store estimate data in localStorage
  function storeEstimateData() {
    const area = Number.parseFloat(document.getElementById("roof-area").value)
    const pitch = document.getElementById("roof-pitch").value || "medium"
    const material = document.querySelector('input[name="material"]:checked')?.value || "asphalt"

    const formData = {
      area: area,
      pitch: pitch,
      material: material,
      removal: document.getElementById("option-removal").checked,
      underlayment: document.getElementById("option-underlayment").checked,
      ventilation: document.getElementById("option-ventilation").checked,
      gutters: document.getElementById("option-gutters").checked,
      insulation: document.getElementById("option-insulation").checked,
      firstName: document.getElementById("first-name").value,
      lastName: document.getElementById("last-name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
    }

    localStorage.setItem("roofingCalculatorData", JSON.stringify(formData))
  }
})

