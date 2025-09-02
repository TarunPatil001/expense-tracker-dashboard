// Test script to add sample transactions for testing edit functionality
// Run this in the browser console to add test data

// Add test transactions
const testTransactions = [
  {
    id: 1001,
    title: "Grocery Shopping",
    amount: 150,
    category: "1", // Food category
    notes: "Weekly groceries",
    paymentMethod: "Credit Card",
    date: "2025-09-01",
    type: "expense",
    timestamp: new Date().toISOString()
  },
  {
    id: 1002,
    title: "Coffee",
    amount: 25,
    category: "2", // Dining category  
    notes: "Morning coffee",
    paymentMethod: "Cash",
    date: "2025-09-01",
    type: "expense",
    timestamp: new Date().toISOString()
  },
  {
    id: 1003,
    title: "Gas",
    amount: 80,
    category: "3", // Transportation category
    notes: "Fuel for car",
    paymentMethod: "UPI",
    date: "2025-09-01",
    type: "expense",
    timestamp: new Date().toISOString()
  }
]

// Add these to the store
testTransactions.forEach(transaction => {
  store.dispatch({
    type: 'expenseManager/addTransaction',
    payload: transaction
  })
})

console.log('Test transactions added. Try editing them now!')
