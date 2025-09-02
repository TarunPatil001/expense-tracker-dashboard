// 🔍 Cumulative Calculation Verification Tool
// Run this in browser console to debug cumulative calculations

const verifyCumulativeCalculation = () => {
  console.log("=== CUMULATIVE CALCULATION VERIFICATION ===")
  
  // Get current store state (if available)
  const state = window.store?.getState?.()?.expenseManager
  if (!state) {
    console.log("❌ Store not available. Make sure you're on the app page.")
    return
  }
  
  const { transactions = [] } = state
  console.log("📊 Total transactions:", transactions.length)
  
  // Filter for current month (September 2025)
  const currentMonth = 8 // September = 8 (0-indexed)
  const currentYear = 2025
  
  const monthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear &&
           transaction.type === 'expense'
  })
  
  console.log("📅 September 2025 expenses:", monthTransactions)
  
  // Group by day
  const dailyData = {}
  monthTransactions.forEach(transaction => {
    const day = new Date(transaction.date).getDate()
    if (!dailyData[day]) {
      dailyData[day] = 0
    }
    dailyData[day] += transaction.amount
    console.log(`➕ Day ${day}: +₹${transaction.amount} (${transaction.title})`)
  })
  
  console.log("📈 Daily totals:", dailyData)
  
  // Calculate cumulative
  let cumulative = 0
  const results = []
  
  for (let day = 1; day <= 5; day++) { // First 5 days
    const amount = dailyData[day] || 0
    cumulative += amount
    
    results.push({
      day,
      daily: amount,
      cumulative
    })
    
    console.log(`📊 Day ${day}: Daily=₹${amount}, Cumulative=₹${cumulative}`)
  }
  
  console.log("✅ Calculation complete!")
  return results
}

// Expected for your data:
const expectedResults = [
  { day: 1, daily: 270, cumulative: 270 }, // Food ₹120 + Sandwich ₹150
  { day: 2, daily: 0, cumulative: 270 },   // No spending
  { day: 3, daily: 80, cumulative: 350 },  // Travel ₹80
  { day: 4, daily: 0, cumulative: 350 },   // No spending  
  { day: 5, daily: 0, cumulative: 350 }    // No spending
]

console.log("🎯 Expected results:", expectedResults)

// Call this function in browser console:
// verifyCumulativeCalculation()

// Also make store available globally for debugging
if (typeof window !== 'undefined') {
  // This will be available in browser console
  window.verifyCumulativeCalculation = verifyCumulativeCalculation
}
