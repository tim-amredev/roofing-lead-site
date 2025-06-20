document.addEventListener("DOMContentLoaded", () => {
  /**
   * Send lead data to LeadConduit
   * @param {Object} leadData - The lead data object
   * @param {string} source - The source of the lead (calculator, questionnaire, etc.)
   */
  function sendToLeadConduit(leadData, source = "website") {
    const leadConduitData = new URLSearchParams()

    // Map standard fields using correct LeadConduit parameter names
    leadConduitData.append("first_name", leadData.first_name || "")
    leadConduitData.append("last_name", leadData.last_name || "")
    leadConduitData.append("address_1", leadData.address_1 || "")
    leadConduitData.append("city", leadData.city || "")
    leadConduitData.append("state", leadData.state || "")
    leadConduitData.append("postal_code", leadData.postal_code || "")
    leadConduitData.append("phone_1", leadData.phone_1 || "")
    leadConduitData.append("email", leadData.email || "")

    // Product and source information
    leadConduitData.append("product", "Roofing")
    leadConduitData.append("sender_name_are", "Instantroofingprices.com")

    // Add source information to comments
    let comments = `Source: ${source}\n`
    if (leadData.comments) {
      comments += leadData.comments
    }
    leadConduitData.append("comments", comments)

    // Send to LeadConduit
    return fetch("https://app.leadconduit.com/flows/684198bbf6391f0c24db713a/sources/68556e9a6cfc53ae321b466c/submit", {
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
   * @returns {Object} Object with first_name and last_name
   */
  function extractNameParts(fullName) {
    if (!fullName || typeof fullName !== "string") {
      return { first_name: "", last_name: "" }
    }

    const nameParts = fullName.trim().split(" ")
    return {
      first_name: nameParts[0] || "",
      last_name: nameParts.slice(1).join(" ") || "",
    }
  }

  /**
   * Validate required fields for LeadConduit
   * @param {Object} leadData - The lead data object
   * @returns {boolean} True if valid, false otherwise
   */
  function validateLeadData(leadData) {
    const requiredFields = ["first_name", "last_name", "email", "phone_1"]

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
