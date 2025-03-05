document.addEventListener("DOMContentLoaded", () => {
  // Contact form submission
  const contactForm = document.getElementById("contact-form")
  const contactSuccessModal = document.getElementById("contact-success-modal")
  const closeContactModal = document.getElementById("close-contact-modal")

  if (contactForm) {
    // No custom form handling needed as we're using FormSubmit's native functionality
  }

  if (closeContactModal && contactSuccessModal) {
    closeContactModal.addEventListener("click", () => {
      contactSuccessModal.classList.add("hidden")
    })
  }
})

