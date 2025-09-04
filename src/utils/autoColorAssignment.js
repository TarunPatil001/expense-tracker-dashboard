// Auto Color Assignment Utility
// Provides unique colors for each category without duplicates

// Predefined color palette with good contrast and visibility
const COLOR_PALETTE = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Mint Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#FF8A80', // Light Red
  '#81C784', // Light Green
  '#64B5F6', // Light Blue
  '#FFB74D', // Orange
  '#F06292', // Pink
  '#9575CD', // Purple
  '#A5D6A7', // Soft Green
  '#FFCC80', // Peach
  '#CE93D8', // Lavender
  '#80CBC4', // Cyan
  '#FFAB91', // Coral
  '#C5E1A5', // Lime
  '#FFF176', // Light Yellow
  '#BCAAA4', // Brown
  '#90CAF9', // Sky Blue
  '#F8BBD9', // Rose
  '#B39DDB', // Light Purple
  '#DCEDC8', // Pale Green
  '#FFE082', // Gold
  '#D7CCC8', // Beige
  '#B0BEC5', // Blue Grey
  '#FFCDD2', // Light Pink
  '#C8E6C9', // Pale Mint
  '#BBDEFB'  // Pale Blue
]

/**
 * Get the next available color that doesn't conflict with existing categories
 * @param {Array} existingCategories - Array of existing categories with color property
 * @returns {string} - Hex color code
 */
export const getNextAvailableColor = (existingCategories = []) => {
  // Get all currently used colors
  const usedColors = existingCategories
    .map(category => category.color)
    .filter(Boolean) // Remove any null/undefined colors
  
  // Find the first color from our palette that isn't used
  for (const color of COLOR_PALETTE) {
    if (!usedColors.includes(color)) {
      return color
    }
  }
  
  // If all predefined colors are used, generate a random color
  // This is a fallback for cases with 30+ categories
  return generateRandomColor(usedColors)
}

/**
 * Generate a random color that doesn't match existing colors
 * @param {Array} usedColors - Array of already used color codes
 * @returns {string} - Hex color code
 */
const generateRandomColor = (usedColors = []) => {
  let attempts = 0
  const maxAttempts = 50
  
  while (attempts < maxAttempts) {
    // Generate a random color with good saturation and lightness
    const hue = Math.floor(Math.random() * 360)
    const saturation = Math.floor(Math.random() * 30) + 60 // 60-90%
    const lightness = Math.floor(Math.random() * 20) + 50  // 50-70%
    
    const color = hslToHex(hue, saturation, lightness)
    
    // Check if this color is too similar to existing colors
    if (!isColorTooSimilar(color, usedColors)) {
      return color
    }
    
    attempts++
  }
  
  // Fallback: return a random color from our palette
  return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
}

/**
 * Convert HSL to HEX color
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} - Hex color code
 */
const hslToHex = (h, s, l) => {
  l /= 100
  const a = s * Math.min(l, 1 - l) / 100
  const f = n => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/**
 * Check if a color is too similar to existing colors
 * @param {string} newColor - New color in hex format
 * @param {Array} existingColors - Array of existing colors
 * @returns {boolean} - True if too similar
 */
const isColorTooSimilar = (newColor, existingColors) => {
  const newRgb = hexToRgb(newColor)
  if (!newRgb) return false
  
  for (const existingColor of existingColors) {
    const existingRgb = hexToRgb(existingColor)
    if (!existingRgb) continue
    
    // Calculate color distance using Euclidean distance in RGB space
    const distance = Math.sqrt(
      Math.pow(newRgb.r - existingRgb.r, 2) +
      Math.pow(newRgb.g - existingRgb.g, 2) +
      Math.pow(newRgb.b - existingRgb.b, 2)
    )
    
    // If distance is too small, colors are too similar
    if (distance < 50) {
      return true
    }
  }
  
  return false
}

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color code
 * @returns {Object|null} - RGB object or null if invalid
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Get all available colors in the palette
 * @returns {Array} - Array of hex color codes
 */
export const getAllAvailableColors = () => {
  return [...COLOR_PALETTE]
}

/**
 * Reset color assignments for categories
 * Useful when you want to reassign colors to all categories
 * @param {Array} categories - Array of categories
 * @returns {Array} - Categories with new color assignments
 */
export const reassignAllColors = (categories = []) => {
  return categories.map((category, index) => ({
    ...category,
    color: COLOR_PALETTE[index % COLOR_PALETTE.length]
  }))
}
