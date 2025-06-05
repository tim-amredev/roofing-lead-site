// Get other form values
      const firstName = document.getElementById("first-name").value.trim();
      const lastName = document.getElementById("last-name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      
      // Basic validation for required fields
      if (!firstName || !lastName || !email || !phone) {
        alert("Please fill in all required contact information fields.");
        return false;
      }
      
      // Store form data in localStorage
      const formData = new FormData(this);
      const formDataObj = {};
      
      // Convert FormData to object
      formData.forEach((value, key) => {
        formDataObj[key] = value;
      });
      
      // Store in localStorage
      localStorage.setItem("roofingCalculatorData", JSON.stringify(formDataObj));
      
      // Prepare data for LeadConduit
      const leadConduitData = new URLSearchParams();
      leadConduitData.append('firstname', firstName);
      leadConduitData.append('lastname', lastName);
      leadConduitData.append('address1', document.getElementById("street-address").value || "");
      leadConduitData.append('city', document.getElementById("city").value || "");
      leadConduitData.append('state', document.getElementById("state").value || "");
      leadConduitData.append('zip', document.getElementById("zip_code").value || "");
      leadConduitData.append('phone1', phone);
      leadConduitData.append('email', email);
      
      // Required fields
      leadConduitData.append('sender', 'Instantroofingprices.com');
      leadConduitData.append('srs_id', '1669');
      leadConduitData.append('productid', 'Roof');
      leadConduitData.append('proddescr', 'Roofing');
      
      // Compile notes from calculator data
      let notes = "Roofing Calculator Estimate:\n";
      notes += "Roof Area: " + area + " sq ft\n";
      notes += "Roof Pitch: " + (document.getElementById("roof-pitch").value || "medium") + "\n";
      
      // Get selected material
      const materialRadio = document.querySelector('input[name="material"]:checked');
      const materialValue = materialRadio ? materialRadio.value : "asphalt";
      notes += "Material: " + materialValue + "\n";
      
      // Get additional options
      const additionalOptions = [];
      if (document.getElementById("option-removal").checked) additionalOptions.push("Old Roof Removal");
      if (document.getElementById("option-underlayment").checked) additionalOptions.push("Premium Underlayment");
      if (document.getElementById("option-ventilation").checked) additionalOptions.push("Improved Ventilation");
      if (document.getElementById("option-gutters").checked) additionalOptions.push("New Gutters & Downspouts");
      if (document.getElementById("option-insulation").checked) additionalOptions.push("Additional Insulation");
      
      if (additionalOptions.length > 0) {
        notes += "Additional Options: " + additionalOptions.join(", ") + "\n";
      }
      
      // Calculate estimates before sending to LeadConduit
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
        }
      };

      // Calculate base cost
      const pitchValue = document.getElementById("roof-pitch").value || "medium";
      const pitchMultiplier = pricing.pitchMultipliers[pitchValue] || 1.2;
      const materialPricing = pricing.materials[materialValue] || pricing.materials.asphalt;

      let lowBase = area * materialPricing.low * pitchMultiplier;
      let highBase = area * materialPricing.high * pitchMultiplier;
@@ -724,77 +724,77 @@ document.addEventListener("DOMContentLoaded", function() {
        highBase += area * 2.5;
      }
      if (document.getElementById("option-underlayment").checked) {
        lowBase += 500;
        highBase += 1000;
      }
      if (document.getElementById("option-ventilation").checked) {
        lowBase += 600;
        highBase += 1200;
      }
      if (document.getElementById("option-gutters").checked) {
        const perimeter = Math.ceil(Math.sqrt(area) * 4);
        lowBase += perimeter * 4.0;
        highBase += perimeter * 8.0;
      }
      if (document.getElementById("option-insulation").checked) {
        lowBase += area * 2.0;
        highBase += area * 4.0;
      }

      // Ensure minimum project cost
      const minCost = 5000;
      lowBase = Math.max(lowBase, minCost);
      highBase = Math.max(highBase, minCost * 1.2);

      // Format costs for LeadConduit
      const calculatedLowEstimate = Math.round(lowBase);
      const calculatedHighEstimate = Math.round(highBase);
      const calculatedAverageEstimate = Math.round((lowBase + highBase) / 2);

      notes += "Low Estimate: $" + calculatedLowEstimate.toLocaleString() + "\n";
      notes += "High Estimate: $" + calculatedHighEstimate.toLocaleString() + "\n";
      notes += "Average Estimate: $" + calculatedAverageEstimate.toLocaleString() + "\n";
      
      leadConduitData.append('notes', notes);
      
      // Send data to LeadConduit
      fetch('https://app.leadconduit.com/flows/67f7c604f84b9544eca41ff7/sources/680b67d1735fe6f491a213a8/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: leadConduitData
      })
      .then(response => {
        console.log('LeadConduit response:', response);
        // Continue with the original form submission to FormSubmit
        form.submit();
      })
      .catch(error => {
        console.error('Error sending to LeadConduit:', error);
        // Continue with the original form submission to FormSubmit even if LeadConduit fails
        form.submit();
      });
    });
  }
  
  // Check if we're returning from form submission
  if (window.location.hash === "#estimate-results") {
    // Get stored form data
    const storedData = localStorage.getItem("roofingCalculatorData");
    if (storedData) {
      const formData = JSON.parse(storedData);
      
      // Calculate and display the estimate
      const area = formData.area;
      const pitch = formData.pitch;
      const material = formData.material;
      
      // Simple calculation for demo purposes
      const basePrice = material === "asphalt" ? 6 : 
                       material === "metal" ? 13 : 
                       material === "tile" ? 20 : 
                       material === "wood" ? 11 : 
                       material === "slate" ? 32 : 8;
      
      const pitchMultiplier = pitch === "flat" ? 1.0 :
