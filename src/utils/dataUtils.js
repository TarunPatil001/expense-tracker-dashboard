// Utility functions for data management

/**
 * Clear localStorage and force fresh start
 * Useful for development or when user wants to reset everything
 */
export const clearLocalStorageData = () => {
  try {
    localStorage.removeItem('expenseManagerData')
    console.log('✅ localStorage cleared successfully')
    return true
  } catch (error) {
    console.error('❌ Error clearing localStorage:', error)
    return false
  }
}

/**
 * Check if localStorage has valid data
 */
export const hasValidLocalStorageData = () => {
  try {
    const savedData = localStorage.getItem('expenseManagerData')
    if (!savedData) return false
    
    const parsed = JSON.parse(savedData)
    
    // Basic validation
    const requiredProperties = ['transactions', 'categories', 'budget', 'notifications', 'preferences', 'analytics', 'goals', 'ui']
    
    for (const prop of requiredProperties) {
      if (!(prop in parsed)) {
        return false
      }
    }
    
    return true
  } catch (error) {
    console.error('Error checking localStorage data:', error)
    return false
  }
}

/**
 * Export current state to JSON file
 */
export const exportStateToFile = (state) => {
  try {
    const dataStr = JSON.stringify(state, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `expense-manager-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    console.log('✅ State exported successfully')
    return true
  } catch (error) {
    console.error('❌ Error exporting state:', error)
    return false
  }
}

/**
 * Get localStorage data size in KB
 */
export const getLocalStorageSize = () => {
  try {
    const data = localStorage.getItem('expenseManagerData')
    if (!data) return 0
    
    const sizeInBytes = new Blob([data]).size
    const sizeInKB = (sizeInBytes / 1024).toFixed(2)
    return parseFloat(sizeInKB)
  } catch (error) {
    console.error('Error calculating localStorage size:', error)
    return 0
  }
}

/**
 * Force reload the page to pickup fresh state
 */
export const forceReloadWithFreshState = () => {
  clearLocalStorageData()
  window.location.reload()
}

// Console helpers for development
if (typeof window !== 'undefined') {
  // Make utilities available in browser console for debugging
  window.expenseManagerUtils = {
    clearData: clearLocalStorageData,
    hasValidData: hasValidLocalStorageData,
    exportState: exportStateToFile,
    getDataSize: getLocalStorageSize,
    resetApp: forceReloadWithFreshState
  }
  
  console.log('🛠️ Expense Manager Utils loaded. Use window.expenseManagerUtils in console.')
}
