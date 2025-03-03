// Force background color after page load
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.backgroundColor = "#f9fafb"
  document.documentElement.style.backgroundColor = "#f9fafb"

  // Get all sections
  const sections = document.querySelectorAll("section")
  sections.forEach((section) => {
    section.style.backgroundColor = "#f9fafb"
  })

  // Get main element
  const main = document.querySelector("main")
  if (main) {
    main.style.backgroundColor = "#f9fafb"
  }
})
