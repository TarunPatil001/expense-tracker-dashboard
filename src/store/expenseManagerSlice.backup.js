import { createSlice } from '@reduxjs/toolkit'

// Load data from localStorage
const loadFromLocalStorage = () => {
  try {
    const savedData = localStorage.getItem('expenseManagerData')
    return savedData ? JSON.parse(savedData) : null
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return null
  }
}

// Save data to localStorage
const saveToLocalStorage = (state) => {
  try {
    localStorage.setItem('expenseManagerData', JSON.stringify(state))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

const savedData = loadFromLocalStorage()

// Fresh initial state aligned with specification
const initialState = savedData || {
  // 📊 Transactions (CRUD)
  transactions: [
    {
      id: 1,
      title: "Sample Grocery",
      amount: 1500,
      type: "expense", // "income" or "expense"
      category: "Food",
      date: "2025-09-01",
      paymentMethod: "UPI",
      notes: "Bought from Dmart"
    }
  ],
  
  // 🏷️ Categories (CRUD)
  categories: [
    { id: "c1", name: "Food", color: "#FF5733", icon: "🍔" },
    { id: "c2", name: "Travel", color: "#4287f5", icon: "🚗" },
    { id: "c3", name: "Shopping", color: "#28a745", icon: "🛍️" },
    { id: "c4", name: "Bills", color: "#ffc107", icon: "📄" },
    { id: "c5", name: "Healthcare", color: "#e83e8c", icon: "🏥" },
    { id: "c6", name: "Entertainment", color: "#6f42c1", icon: "🎬" },
    { id: "c7", name: "Salary", color: "#20c997", icon: "💰" },
    { id: "c8", name: "Freelance", color: "#fd7e14", icon: "💻" },
    { id: "c9", name: "Investments", color: "#6c757d", icon: "📈" }
  ],
  
  // 💰 Budgets (CRUD)
  budget: {
    id: "b1",
    monthlyLimit: 20000,
    spent: 15000,
    alertsEnabled: true,
    weeklyLimit: 5000,
    remaining: 5000
  },
  
  // 🔔 Notifications (CRUD)
  notifications: [
    { 
      id: "n1", 
      message: "You reached 80% of your budget!", 
      type: "warning", 
      read: false,
      timestamp: new Date().toISOString(),
      category: "budget"
    }
  ],
  
  // ⚙️ User Preferences
  preferences: {
    theme: "dark", // "dark" | "light"
    currency: "INR", // "INR" | "USD" | "EUR"
    language: "en", // "en" | "hi"
    dateFormat: "DD/MM/YYYY",
    timezone: "Asia/Kolkata"
  },
  
  // 📊 Analytics & Dashboard
  analytics: {
    currentMonth: {
      totalIncome: 0,
      totalExpenses: 15000,
      balance: -15000,
      expensesByCategory: [],
      dailyExpenses: []
    },
    trends: {
      monthlyData: [],
      categoryTrends: [],
      savingsRate: []
    }
  },
  
  // 🎯 Goals & Targets
  goals: [],
  
  // 🎛️ UI State
  ui: {
    isSetupComplete: true,
    activeView: "dashboard",
    showExpenseModal: false,
    showCategoryModal: false,
    showBudgetModal: false,
    showGoalModal: false,
    showSettingsModal: false,
    showNotificationModal: false,
    searchQuery: "",
    dateRange: "thisMonth",
    selectedCategory: "all",
    filterType: "all" // "all" | "income" | "expense"
  }
}

const expenseManagerSlice = createSlice({
  name: 'expenseManager',
  initialState,
  reducers: {
    // 💳 TRANSACTIONS CRUD
    // Create Transaction
    addTransaction: (state, action) => {
      const newTransaction = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        ...action.payload
      }
      state.transactions.unshift(newTransaction)
      
      // Update analytics
      if (action.payload.type === 'expense') {
        state.analytics.currentMonth.totalExpenses += action.payload.amount
        state.budget.spent += action.payload.amount
      } else {
        state.analytics.currentMonth.totalIncome += action.payload.amount
      }
      state.analytics.currentMonth.balance = state.analytics.currentMonth.totalIncome - state.analytics.currentMonth.totalExpenses
      state.budget.remaining = state.budget.monthlyLimit - state.budget.spent
      
      // Add success notification
      state.notifications.unshift({
        id: Date.now() + 1,
        message: "✅ Transaction added successfully!",
        type: "success",
        read: false,
        timestamp: new Date().toISOString(),
        category: "transaction"
      })
      
      saveToLocalStorage(state)
    },
    
    // Update Transaction
    updateTransaction: (state, action) => {
      const { id, ...updates } = action.payload
      const transaction = state.transactions.find(t => t.id === id)
      if (transaction) {
        // Update analytics by removing old amount and adding new
        if (transaction.type === 'expense') {
          state.analytics.currentMonth.totalExpenses -= transaction.amount
          state.budget.spent -= transaction.amount
          state.analytics.currentMonth.totalExpenses += updates.amount || transaction.amount
          state.budget.spent += updates.amount || transaction.amount
        } else {
          state.analytics.currentMonth.totalIncome -= transaction.amount
          state.analytics.currentMonth.totalIncome += updates.amount || transaction.amount
        }
        
        Object.assign(transaction, updates)
        state.analytics.currentMonth.balance = state.analytics.currentMonth.totalIncome - state.analytics.currentMonth.totalExpenses
        state.budget.remaining = state.budget.monthlyLimit - state.budget.spent
        
        // Add success notification
        state.notifications.unshift({
          id: Date.now() + 1,
          message: "✏️ Transaction updated successfully!",
          type: "success",
          read: false,
          timestamp: new Date().toISOString(),
          category: "transaction"
        })
        
        saveToLocalStorage(state)
      }
    },
    
    // Delete Transaction
    deleteTransaction: (state, action) => {
      const transaction = state.transactions.find(t => t.id === action.payload)
      if (transaction) {
        // Update analytics
        if (transaction.type === 'expense') {
          state.analytics.currentMonth.totalExpenses -= transaction.amount
          state.budget.spent -= transaction.amount
        } else {
          state.analytics.currentMonth.totalIncome -= transaction.amount
        }
        state.analytics.currentMonth.balance = state.analytics.currentMonth.totalIncome - state.analytics.currentMonth.totalExpenses
        state.budget.remaining = state.budget.monthlyLimit - state.budget.spent
        
        state.transactions = state.transactions.filter(t => t.id !== action.payload)
        
        // Add success notification
        state.notifications.unshift({
          id: Date.now() + 1,
          message: "🗑️ Transaction deleted successfully!",
          type: "success",
          read: false,
          timestamp: new Date().toISOString(),
          category: "transaction"
        })
        
        saveToLocalStorage(state)
      }
    },
    
    // Delete Multiple Transactions
    deleteMultipleTransactions: (state, action) => {
      const idsToDelete = action.payload
      idsToDelete.forEach(id => {
        const transaction = state.transactions.find(t => t.id === id)
        if (transaction) {
          if (transaction.type === 'expense') {
            state.analytics.currentMonth.totalExpenses -= transaction.amount
            state.budget.spent -= transaction.amount
          } else {
            state.analytics.currentMonth.totalIncome -= transaction.amount
          }
        }
      })
      
      state.transactions = state.transactions.filter(t => !idsToDelete.includes(t.id))
      state.analytics.currentMonth.balance = state.analytics.currentMonth.totalIncome - state.analytics.currentMonth.totalExpenses
      state.budget.remaining = state.budget.monthlyLimit - state.budget.spent
      
      // Add success notification
      state.notifications.unshift({
        id: Date.now() + 1,
        message: `🗑️ ${idsToDelete.length} transactions deleted successfully!`,
        type: "success",
        read: false,
        timestamp: new Date().toISOString(),
        category: "transaction"
      })
      
      saveToLocalStorage(state)
    },

    // 🏷️ CATEGORIES CRUD
    // Create Category
    addCategory: (state, action) => {
      const newCategory = {
        id: `c${Date.now()}`,
        ...action.payload
      }
      state.categories.push(newCategory)
      saveToLocalStorage(state)
    },
    
    // Update Category
    updateCategory: (state, action) => {
      const { id, ...updates } = action.payload
      const category = state.categories.find(cat => cat.id === id)
      if (category) {
        Object.assign(category, updates)
        saveToLocalStorage(state)
      }
    },
    
    // Delete Category
    deleteCategory: (state, action) => {
      state.categories = state.categories.filter(cat => cat.id !== action.payload)
      // Update transactions to use "Uncategorized" as fallback
      state.transactions.forEach(transaction => {
        if (transaction.category === action.payload) {
          transaction.category = "Uncategorized"
        }
      })
      saveToLocalStorage(state)
    },

    // 💰 BUDGETS CRUD
    // Create/Update Budget
    setBudget: (state, action) => {
      state.budget = { ...state.budget, ...action.payload }
      state.budget.remaining = state.budget.monthlyLimit - state.budget.spent
      
      // Check if budget exceeded and add notification
      if (state.budget.alertsEnabled && state.budget.spent >= state.budget.monthlyLimit * 0.8) {
        const message = state.budget.spent >= state.budget.monthlyLimit 
          ? "🚨 You have exceeded your budget limit!"
          : "⚠️ You reached 80% of your monthly budget!"
        
        state.notifications.unshift({
          id: Date.now() + 1,
          message,
          type: state.budget.spent >= state.budget.monthlyLimit ? "error" : "warning",
          read: false,
          timestamp: new Date().toISOString(),
          category: "budget"
        })
      }
      
      saveToLocalStorage(state)
    },
    
    // Delete Budget
    deleteBudget: (state) => {
      state.budget = {
        id: null,
        monthlyLimit: 0,
        spent: 0,
        alertsEnabled: false,
        weeklyLimit: 0,
        remaining: 0
      }
      saveToLocalStorage(state)
    },

    // 🔔 NOTIFICATIONS CRUD
    // Create Notification
    addNotification: (state, action) => {
      const newNotification = {
        id: `n${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload
      }
      state.notifications.unshift(newNotification)
      saveToLocalStorage(state)
    },
    
    // Update Notification (Mark as read/unread)
    updateNotification: (state, action) => {
      const { id, ...updates } = action.payload
      const notification = state.notifications.find(n => n.id === id)
      if (notification) {
        Object.assign(notification, updates)
        saveToLocalStorage(state)
      }
    },
    
    // Delete Notification
    deleteNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
      saveToLocalStorage(state)
    },
    
    // Clear All Notifications
    clearAllNotifications: (state) => {
      state.notifications = []
      saveToLocalStorage(state)
    },
    
    // Mark All Notifications as Read
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
      saveToLocalStorage(state)
    },

    // ⚙️ USER PREFERENCES
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload }
      saveToLocalStorage(state)
    },
    
    // 🎯 GOALS CRUD
    addGoal: (state, action) => {
      const newGoal = {
        id: Date.now(),
        ...action.payload
      }
      state.goals.push(newGoal)
      saveToLocalStorage(state)
    },
    
    updateGoal: (state, action) => {
      const { id, ...updates } = action.payload
      const goal = state.goals.find(g => g.id === id)
      if (goal) {
        Object.assign(goal, updates)
        saveToLocalStorage(state)
      }
    },
    
    deleteGoal: (state, action) => {
      state.goals = state.goals.filter(g => g.id !== action.payload)
      saveToLocalStorage(state)
    },

    // 🎛️ UI STATE MANAGEMENT
    toggleModal: (state, action) => {
      const modalName = action.payload
      state.ui[modalName] = !state.ui[modalName]
    },
    
    setActiveView: (state, action) => {
      state.ui.activeView = action.payload
    },
    
    updateSearchQuery: (state, action) => {
      state.ui.searchQuery = action.payload
    },
    
    setDateRange: (state, action) => {
      state.ui.dateRange = action.payload
    },
    
    setSelectedCategory: (state, action) => {
      state.ui.selectedCategory = action.payload
    },
    
    setFilterType: (state, action) => {
      state.ui.filterType = action.payload
    },

    // 🔄 DATA MANAGEMENT
    // Complete Setup
    completeSetup: (state, action) => {
      const { profile, budget, categories } = action.payload
      state.preferences = { ...state.preferences, ...profile }
      if (budget) {
        state.budget.monthlyLimit = budget
        state.budget.remaining = budget - state.budget.spent
      }
      if (categories) {
        state.categories = [...state.categories, ...categories]
      }
      state.ui.isSetupComplete = true
      saveToLocalStorage(state)
    },
    
    // Reset All Data
    resetAllData: (state) => {
      // Keep user preferences but reset all other data
      const preferences = { ...state.preferences }
      Object.assign(state, {
        ...initialState,
        preferences,
        ui: { ...initialState.ui, isSetupComplete: false }
      })
      
      // Clear localStorage
      localStorage.removeItem('expenseManagerData')
      saveToLocalStorage(state)
    },
    
    // Import Data (for CSV/JSON import)
    importData: (state, action) => {
      const { transactions, categories, budget } = action.payload
      
      if (transactions) {
        state.transactions = [...state.transactions, ...transactions]
      }
      if (categories) {
        // Merge categories without duplicates
        categories.forEach(newCat => {
          if (!state.categories.find(cat => cat.name === newCat.name)) {
            state.categories.push(newCat)
          }
        })
      }
      if (budget) {
        state.budget = { ...state.budget, ...budget }
      }
      
      // Recalculate analytics
      const totalExpenses = state.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      const totalIncome = state.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      state.analytics.currentMonth.totalExpenses = totalExpenses
      state.analytics.currentMonth.totalIncome = totalIncome
      state.analytics.currentMonth.balance = totalIncome - totalExpenses
      state.budget.spent = totalExpenses
      state.budget.remaining = state.budget.monthlyLimit - totalExpenses
      
      // Add success notification
      state.notifications.unshift({
        id: Date.now() + 1,
        message: "📊 Data imported successfully!",
        type: "success",
        read: false,
        timestamp: new Date().toISOString(),
        category: "system"
      })
      
      saveToLocalStorage(state)
    }
  }
})

export const {
  // Transactions
  addTransaction,
  updateTransaction,
  deleteTransaction,
  deleteMultipleTransactions,
  
  // Categories
  addCategory,
  updateCategory,
  deleteCategory,
  
  // Budget
  setBudget,
  deleteBudget,
  
  // Notifications
  addNotification,
  updateNotification,
  deleteNotification,
  clearAllNotifications,
  markAllNotificationsRead,
  
  // Preferences
  updatePreferences,
  
  // Goals
  addGoal,
  updateGoal,
  deleteGoal,
  
  // UI State
  toggleModal,
  setActiveView,
  updateSearchQuery,
  setDateRange,
  setSelectedCategory,
  setFilterType,
  
  // Data Management
  completeSetup,
  resetAllData,
  importData
} = expenseManagerSlice.actions

export default expenseManagerSlice.reducer
