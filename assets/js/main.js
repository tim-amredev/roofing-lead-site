document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const mobileMenuButton = document.getElementById("mobile-menu-button")
  const mobileMenu = document.getElementById("mobile-menu")

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden")
    })
  }

  // Contact form submission
  const contactForm = document.getElementById("contact-form")
  const contactSuccessModal = document.getElementById("contact-success-modal")
  const closeContactModal = document.getElementById("close-contact-modal")

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Simulate form submission
      setTimeout(() => {
        if (contactSuccessModal) {
          contactSuccessModal.classList.remove("hidden")
        }
        contactForm.reset()
      }, 1000)
    })
  }

  if (closeContactModal && contactSuccessModal) {
    closeContactModal.addEventListener("click", () => {
      contactSuccessModal.classList.add("hidden")
    })
  }
})

