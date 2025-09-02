// 🧪 CUMULATIVE CALCULATION TEST
// Testing with your actual expense data

const testTransactions = [
  {
    id: 1,
    title: "Food",
    amount: 120,
    category: "Food",
    date: "2025-09-01", // Today (Sept 1)
    type: "expense",
    paymentMethod: "Cash"
  },
  {
    id: 2,
    title: "Sandwich", 
    amount: 150,
    category: "Food",
    date: "2025-09-01", // Today (Sept 1)
    type: "expense",
    paymentMethod: "Cash"
  },
  {
    id: 3,
    title: "Travel",
    amount: 80,
    category: "Travel", 
    date: "2025-09-03", // Sep 3
    type: "expense",
    paymentMethod: "Cash"
  }
]

// Expected Calculation:
console.log("=== CUMULATIVE CALCULATION TEST ===")

// Group by day first
const dailyData = {}
testTransactions.forEach(transaction => {
  const day = new Date(transaction.date).getDate()
  if (!dailyData[day]) {
    dailyData[day] = 0
  }
  dailyData[day] += transaction.amount
})

console.log("Daily Data:", dailyData)
// Expected: { 1: 270, 3: 80 }

// Calculate cumulative
let cumulative = 0
const result = []

for (let day = 1; day <= 30; day++) { // September has 30 days
  const amount = dailyData[day] || 0
  cumulative += amount
  
  if (day <= 5) { // Show first 5 days
    result.push({
      day: day,
      dailyAmount: amount,
      cumulative: cumulative
    })
  }
}

console.log("=== EXPECTED RESULTS ===")
result.forEach(item => {
  console.log(`Day ${item.day}: Daily=₹${item.dailyAmount}, Cumulative=₹${item.cumulative}`)
})

/* 
EXPECTED OUTPUT:
Day 1: Daily=₹270, Cumulative=₹270  (120 + 150)
Day 2: Daily=₹0,   Cumulative=₹270  (no spending)
Day 3: Daily=₹80,  Cumulative=₹350  (270 + 80)
Day 4: Daily=₹0,   Cumulative=₹350  (no spending)
Day 5: Daily=₹0,   Cumulative=₹350  (no spending)
*/
