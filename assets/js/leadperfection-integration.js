document.addEventListener("DOMContentLoaded", () => {
  /**
   * Send lead data to LeadConduit
   * @param {Object} leadData - The lead data object
   * @param {string} source - The source of the lead (calculator, questionnaire, etc.)
   */
  function sendToLeadConduit(leadData, source = "website") {
    const leadConduitData = new URLSearchParams()

    // Map standard fields
    leadConduitData.append("firstname", leadData.firstname || "")
    leadConduitData.append("lastname", leadData.lastname || "")
    leadConduitData.append("address1", leadData.address1 || "")
    leadConduitData.append("city", leadData.city || "")
    leadConduitData.append("state", leadData.state || "")
    leadConduitData.append("zip", leadData.zip || "")
    leadConduitData.append("phone1", leadData.phone1 || "")
    leadConduitData.append("email", leadData.email || "")

    // Required fields for LeadConduit
    leadConduitData.append("sender", "Instantroofingprices.com")
    leadConduitData.append("srs_id", "1669")
    leadConduitData.append("productid", "Roof")
    leadConduitData.append("proddescr", "Roofing")

    // Add source information
    leadConduitData.append("source", source)

    // Add notes if provided
    if (leadData.notes) {
      leadConduitData.append("notes", leadData.notes)
    }

    // Send to LeadConduit
    return fetch("https://app.leadconduit.com/flows/67f7c604f84b9544eca41ff7/sources/680b67d1735fe6f491a213a8/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: leadConduitData,
    })
      .then((response) => {
        console.log("LeadConduit response status:", response.status)
        return response
      })
      .catch((error) => {
        console.error("Error sending to LeadConduit:", error)
        throw error
      })
  }

  /**
   * Extract name parts from full name string
   * @param {string} fullName - The full name string
   * @returns {Object} Object with firstname and lastname
   */
  function extractNameParts(fullName) {
    if (!fullName || typeof fullName !== "string") {
      return { firstname: "", lastname: "" }
    }

    const nameParts = fullName.trim().split(" ")
    return {
      firstname: nameParts[0] || "",
      lastname: nameParts.slice(1).join(" ") || "",
    }
  }

  /**
   * Validate required fields for LeadConduit
   * @param {Object} leadData - The lead data object
   * @returns {boolean} True if valid, false otherwise
   */
  function validateLeadData(leadData) {
    const requiredFields = ["firstname", "lastname", "email", "phone1"]

    for (const field of requiredFields) {
      if (!leadData[field] || leadData[field].trim() === "") {
        console.warn(`Missing required field: ${field}`)
        return false
      }
    }

    return true
  }

  // Make functions available globally for form handlers
  window.LeadConduitIntegration = {
    sendToLeadConduit,
    extractNameParts,
    validateLeadData,
  }
})
