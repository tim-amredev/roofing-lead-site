document.addEventListener("DOMContentLoaded", () => {
  // Target the questionnaire form
  const questionnaireForm = document.getElementById("questionnaire-form");

  if (questionnaireForm) {
    questionnaireForm.addEventListener("submit", function (e) {
      e.preventDefault();  // Prevent default to avoid double submission

      // Create form data for LeadConduit
      const formData = new FormData(this);
      const leadConduitData = new URLSearchParams(); // Use URLSearchParams for URL-encoded format

      // Map form fields to LeadConduit parameters
      leadConduitData.append("firstname", formData.get("firstname") || "");
      leadConduitData.append("lastname", formData.get("lastname") || "");
      leadConduitData.append("address1", formData.get("street_address") || "");
      leadConduitData.append("city", formData.get("city") || "");
      leadConduitData.append("state", formData.get("state") || "");
      leadConduitData.append("zip", formData.get("zip_code") || "");
      leadConduitData.append("phone1", formData.get("phone") || "");
      leadConduitData.append("email", formData.get("email") || "");

      // Add the specific product ID for roofing
      leadConduitData.append("productid", "Roof");
      leadConduitData.append("proddescr", "Roofing");

      // Combine various form fields into notes
      let notes = "Project Details:\n";
      notes += `Reason: ${formData.get("reason") || "N/A"}\n`;
      notes += `Roof Age: ${formData.get("roof_age") || "N/A"}\n`;
      notes += `Square Footage: ${formData.get("square_footage") || "N/A"}\n`;
      notes += `Current Material: ${formData.get("current_material") || "N/A"}\n`;
      notes += `Desired Material: ${formData.get("desired_material") || "N/A"}\n`;
      notes += `Roof Type: ${formData.get("roof_type") || "N/A"}\n`;

      const issues = formData.getAll("issues[]");
      if (issues.length > 0) {
        notes += `Issues: ${issues.join(", ")}\n`;
      }

      const features = formData.getAll("features[]");
      if (features.length > 0) {
        notes += `Desired Features: ${features.join(", ")}\n`;
      }

      notes += `Timeframe: ${formData.get("timeframe") || "N/A"}\n`;
      notes += `Budget: ${formData.get("budget") || "N/A"}\n`;
      notes += `Comments: ${formData.get("comments") || "N/A"}`;

      leadConduitData.append("notes", notes);

      // Required identifiers for LeadConduit
      leadConduitData.append("sender", "Instantroofingprices.com");
      leadConduitData.append("srs_id", "1669");

      // Send asynchronously to avoid blocking user
      setTimeout(() => {
        const leadConduitUrl = "https://app.leadconduit.com/flows/67f7c604f84b9544eca41ff7/sources/680b67d1735fe6f491a213a8/submit";

        const xhr = new XMLHttpRequest();
        xhr.open("POST", leadConduitUrl, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.send(leadConduitData.toString());
      }, 0);
    });
  }
});
