document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calculator-form")
  const resultsSection = document.getElementById("results-section")
  const recalculateBtn = document.getElementById("recalculate-btn")
  const additionsList = document.getElementById("additions-list")
  const resultAdditions = document.getElementById("result-additions")

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
        state
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
    const pitch = document.getElementById("roof-pitch").value
    const material = document.querySelector('input[name="material"]:checked').value
    const region = document.getElementById("location").value
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
    document.getElementById("result-material").textContent = document.querySelector(
      `label[for="material-${material}"] h3`,
    ).textContent
    document.getElementById("result-pitch").textContent = document.querySelector(
      `#roof-pitch option[value="${pitch}"]`,
    ).textContent
    document.getElementById("result-location").textContent = document.querySelector(
      `#location option[value="${region}"]`,
    ).textContent

    // Display additional options
    additionsList.innerHTML = ""
    const activeAdditions = Object.entries(additions).filter(([_, checked]) => checked)
    if (activeAdditions.length > 0) {
      resultAdditions.classList.remove("hidden")
      activeAdditions.forEach(([key]) => {
        const li = document.createElement("li")
        li.textContent = document.querySelector(`label[for="option-${key}"] .font-medium`).textContent
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
      material: document.querySelector(`label[for="material-${material}"] h3`).textContent,
      pitch: document.querySelector(`#roof-pitch option[value="${pitch}"]`).textContent,
      location: document.querySelector(`#location option[value="${region}"]`).textContent,
      selectedAdditions: activeAdditions.map(([key]) => 
        document.querySelector(`label[for="option-${key}"] .font-medium`).textContent
      ),
      lowEstimate,
      highEstimate,
      averageEstimate
    }
  }
  
  // Function to send form data to email
  function sendFormData(contactInfo, estimateData) {
    // Create form data object
    const formData = new FormData()
    
    // Add contact information
    formData.append('firstName', contactInfo.firstName)
    formData.append('lastName', contactInfo.lastName)
    formData.append('email', contactInfo.email)
    formData.append('phone', contactInfo.phone)
    formData.append('streetAddress', contactInfo.streetAddress)
    formData.append('zipCode', contactInfo.zipCode)
    formData.append('state', contactInfo.state)
    
    // Add estimate information
    formData.append('roofArea', estimateData.roofArea)
    formData.append('material', estimateData.material)
    formData.append('pitch', estimateData.pitch)
    formData.append('location', estimateData.location)
    formData.append('selectedAdditions', estimateData.selectedAdditions.join(', '))
    formData.append('lowEstimate', estimateData.lowEstimate)
    formData.append('highEstimate', estimateData.highEstimate)
    formData.append('averageEstimate', estimateData.averageEstimate)
    
    // Add the FormSubmitAttachment snippet ID
    formData.append('_formsubmit_attachment', 'snippet-pqC192izRi3cjEq4JN3yUWBy9kbTDA')
    
    // Send to FormSubmit
    fetch('https://formsubmit.co/tim@americanremodeling.net', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      console.log('Form submitted successfully')
    })
    .catch(error => {
      console.error('Error submitting form:', error)
    })
  }

  // Declare fbq if it's not already defined (e.g., if the Facebook Pixel isn't loaded yet)
  if (typeof fbq === "undefined") {
    fbq = () => {
      console.warn("Facebook Pixel not loaded.  fbq called with arguments:", arguments)
    }
  }

  // Wait for the results section to appear before firing the Lead event
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length || mutation.attributeName === "class") {
        const resultsSection = document.getElementById("results-section")
        if (resultsSection && !resultsSection.classList.contains("hidden")) {
          const estimatedPrice = document.getElementById("average-estimate").innerText || "0"
          // Remove currency symbol and commas for value
          const priceValue = Number.parseFloat(estimatedPrice.replace(/[$,]/g, ""))

          fbq("track", "Lead", {
            value: priceValue,
            currency: "USD",
            content_name: "Roofing Estimate",
            content_category: "Roofing",
          })

          observer.disconnect() // Stop observing after event fires once
        }
      }
    })
  })

  // Start observing changes in the results section for visibility changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  })
})
