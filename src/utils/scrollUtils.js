/**
 * Utility functions for scroll management
 */

/**
 * Scrolls to the top of the page smoothly
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  })
}

/**
 * Scrolls to the top of a specific container element
 * @param {string} selector - CSS selector for the container
 */
export const scrollContainerToTop = (selector) => {
  const container = document.querySelector(selector)
  if (container) {
    container.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }
}

/**
 * Scrolls to the top immediately (no animation)
 */
export const scrollToTopInstant = () => {
  window.scrollTo(0, 0)
}

/**
 * Scrolls to a specific element by ID
 * @param {string} elementId - ID of the element to scroll to
 * @param {number} offset - Optional offset from the top (default: 0)
 */
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId)
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    })
  }
}
