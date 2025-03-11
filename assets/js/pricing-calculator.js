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
    calculateEstimate()
  })

  recalculateBtn.addEventListener("click", () => {
    resultsSection.classList.add("hidden")
    form.reset()
    additionsList.innerHTML = ""
    resultAdditions.classList.add("hidden")
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
      return
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
  }

  // Declare fbq if it's not already defined (e.g., if the Facebook Pixel isn't loaded yet)
  if (typeof fbq === 'undefined') {
    fbq = function() {
      console.warn('Facebook Pixel not loaded.  fbq called with arguments:', arguments);
    };
  }

  // Wait for the results section to appear before firing the Lead event
  let observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length || mutation.attributeName === 'class') {
        let resultsSection = document.getElementById('results-section');
        if (resultsSection && !resultsSection.classList.contains('hidden')) {
          let estimatedPrice = document.getElementById('average-estimate').innerText || '0';
          // Remove currency symbol and commas for value
          let priceValue = parseFloat(estimatedPrice.replace(/[$,]/g, ''));
          
          fbq('track', 'Lead', {
            value: priceValue,
            currency: 'USD',
            content_name: 'Roofing Estimate',
            content_category: 'Roofing'
          });
          
          observer.disconnect(); // Stop observing after event fires once
        }
      }
    });
  });

  // Start observing changes in the results section for visibility changes
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: true,
    attributeFilter: ['class'] 
  });
})
