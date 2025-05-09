document.addEventListener("DOMContentLoaded", () => {
  // Target the questionnaire form
  const questionnaireForm = document.getElementById("questionnaire-form");

  if (questionnaireForm) {
    questionnaireForm.addEventListener("submit", function (e) {
      e.preventDefault();  // Prevent default to avoid double submission

      // Create form data for LeadPerfection
      const formData = new FormData(this);
      const leadPerfectionData = new URLSearchParams(); // Use URLSearchParams for URL-encoded format

      // Map form fields to LeadPerfection parameters
      leadPerfectionData.append("firstname", formData.get("firstname") || "");
      leadPerfectionData.append("lastname", formData.get("lastname") || "");
      leadPerfectionData.append("address1", formData.get("street_address") || "");
      leadPerfectionData.append("city", formData.get("city") || "");
      leadPerfectionData.append("state", formData.get("state") || "");
      leadPerfectionData.append("zip", formData.get("zip_code") || "");
      leadPerfectionData.append("phone1", formData.get("phone") || "");
      leadPerfectionData.append("email", formData.get("email") || "");

      // Add the specific product ID for roofing
      leadPerfectionData.append("productid", "Roof");
      leadPerfectionData.append("proddescr", "Roofing");

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

      leadPerfectionData.append("notes", notes);

      // Required identifiers for LeadPerfection
      leadPerfectionData.append("sender", "Instantroofingprices.com");
      leadPerfectionData.append("srs_id", "1669");

      // Send asynchronously to avoid blocking user
      setTimeout(() => {
        const leadPerfectionUrl = "https://th97.leadperfection.com/batch/addleads.asp";

        const xhr = new XMLHttpRequest();
        xhr.open("POST", leadPerfectionUrl, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.send(leadPerfectionData.toString());
      }, 0);
    });
  }
});
