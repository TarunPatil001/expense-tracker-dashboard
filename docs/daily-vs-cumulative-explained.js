// 📊 DAILY EXPENSES vs CUMULATIVE EXPENSES - Visual Example

/*
🗓️ EXAMPLE: September 2025 Spending

Daily Expenses (Red Line/Area):
┌─────────────────────────────────────┐
│ Day 1: ₹150 (Groceries)            │
│ Day 2: ₹80  (Coffee + Lunch)       │
│ Day 3: ₹200 (Fuel)                 │
│ Day 4: ₹0   (No spending)          │
│ Day 5: ₹120 (Dinner out)           │
└─────────────────────────────────────┘

Cumulative Expenses (Teal Line/Area):
┌─────────────────────────────────────┐
│ Day 1: ₹150 (150)                  │
│ Day 2: ₹230 (150 + 80)             │
│ Day 3: ₹430 (150 + 80 + 200)       │
│ Day 4: ₹430 (430 + 0)              │
│ Day 5: ₹550 (430 + 120)            │
└─────────────────────────────────────┘

Chart Visualization:
Daily    |  •                    (spikes on spending days)
Expenses |    •        •     •   (shows individual daily amounts)
         |      •    •           (goes to zero on no-spend days)
         └─────────────────────────────→ Days

Cumulative |  /                  (always increasing or flat)
Expenses   | /  /      /    /    (running total, never decreases)
           |/     /  /        /  (smooth upward trend)
           └─────────────────────────────→ Days

KEY INSIGHTS:
📈 Daily: Shows spending patterns - which days you spend more/less
📊 Cumulative: Shows total budget consumption over time
🎯 Average Line: Helps track if you're above/below daily budget target

PRACTICAL USES:
✅ Daily: "I spent ₹200 on fuel today"
✅ Cumulative: "I've spent ₹550 total this month so far"
✅ Pattern Recognition: "I spend more on weekends" (daily view)
✅ Budget Tracking: "Am I on track for my monthly limit?" (cumulative view)
*/

// Code Implementation Details:

const calculateExpenseData = (transactions, selectedMonth, selectedYear) => {
  // Group transactions by day
  const dailyData = {}
  
  transactions
    .filter(t => isDateInMonth(t.date, selectedMonth, selectedYear))
    .forEach(transaction => {
      const day = new Date(transaction.date).getDate()
      dailyData[day] = (dailyData[day] || 0) + transaction.amount
    })
  
  // Build chart data with both daily and cumulative values
  const chartData = []
  let cumulative = 0
  
  for (let day = 1; day <= getDaysInMonth(selectedYear, selectedMonth); day++) {
    const dailyAmount = dailyData[day] || 0  // 👈 DAILY EXPENSE
    cumulative += dailyAmount                 // 👈 CUMULATIVE TOTAL
    
    chartData.push({
      day: day,
      amount: dailyAmount,     // 🔴 Red line - daily spending
      cumulative: cumulative   // 🔵 Teal line - running total
    })
  }
  
  return chartData
}

// Chart Rendering:
// - dataKey="amount" renders the daily expenses (red)
// - dataKey="cumulative" renders the cumulative total (teal)
// - Both use different gradients and colors for distinction
