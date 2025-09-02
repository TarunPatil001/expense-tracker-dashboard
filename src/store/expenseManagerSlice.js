import { createSlice } from '@reduxjs/toolkit'

// Load data from localStorage
const loadFromLocalStorage = () => {
  try {
    const savedData = localStorage.getItem('expenseManagerData')
    if (!savedData) return null
    
    const parsed = JSON.parse(savedData)
    
    // Validate the structure of loaded data
    if (!isValidStateStructure(parsed)) {
      console.warn('Invalid localStorage data structure, starting fresh')
      return null
    }
    
    return parsed
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return null
  }
}

// Validate if the loaded state has required structure
const isValidStateStructure = (data) => {
  if (!data || typeof data !== 'object') return false
  
  // Check for essential properties that should exist
  const requiredProperties = ['transactions', 'categories', 'budget', 'notifications', 'preferences', 'analytics', 'goals', 'ui']
  
  for (const prop of requiredProperties) {
    if (!(prop in data)) {
      console.warn(`Missing required property: ${prop}`)
      return false
    }
  }
  
  // Check if arrays are actually arrays
  const arrayProperties = ['transactions', 'categories', 'notifications', 'goals']
  for (const prop of arrayProperties) {
    if (!Array.isArray(data[prop])) {
      console.warn(`Property ${prop} should be an array`)
      return false
    }
  }
  
  // Check if objects have required structure
  if (!data.preferences || typeof data.preferences !== 'object') {
    console.warn('Invalid preferences structure')
    return false
  }
  
  if (!data.analytics || typeof data.analytics !== 'object' || !data.analytics.currentMonth) {
    console.warn('Invalid analytics structure')
    return false
  }
  
  return true
}

// Save data to localStorage
const saveToLocalStorage = (state) => {
  try {
    localStorage.setItem('expenseManagerData', JSON.stringify(state))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// Calculate current month analytics from transactions
const calculateCurrentMonthAnalytics = (transactions) => {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Filter transactions for current month
  const currentMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    const transactionMonth = transactionDate.getMonth()
    const transactionYear = transactionDate.getFullYear()
    return transactionMonth === currentMonth && transactionYear === currentYear
  })
  
  // Calculate totals for current month only
  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
    
  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses
  }
}

// Calculate daily expenses from transactions
const calculateDailyExpenses = (transactions) => {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Filter transactions for current month
  const currentMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear &&
           transaction.type === 'expense'
  })
  
  // Group by day
  const dailyData = {}
  currentMonthTransactions.forEach(transaction => {
    const day = new Date(transaction.date).getDate()
    if (!dailyData[day]) {
      dailyData[day] = 0
    }
    dailyData[day] += transaction.amount
  })
  
  // Create array for all days of current month
  const dailyExpenses = []
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  let cumulative = 0
  
  for (let day = 1; day <= daysInMonth; day++) {
    const amount = dailyData[day] || 0
    cumulative += amount
    dailyExpenses.push({
      day: day,
      amount: amount,
      cumulative: cumulative,
      date: new Date(currentYear, currentMonth, day).toISOString().split('T')[0]
    })
  }
  
  return dailyExpenses
}

// Fresh empty state for new users or corrupted data
const getFreshInitialState = () => ({
  // 📊 Transactions (CRUD) - Start empty
  transactions: [],
  
  // 🏷️ Categories (CRUD) - Start empty so users create their own
  categories: [],
  
  // 💰 Budgets (CRUD) - Start with empty budget
  budget: {
    id: null,
    monthlyLimit: 0,
    spent: 0,
    alertsEnabled: false,
    weeklyLimit: 0,
    remaining: 0
  },
  
  // 🔔 Notifications (CRUD) - Start empty
  notifications: [],
  
  // ⚙️ User Preferences - Sensible defaults
  preferences: {
    name: "Tarun Patil",
    email: "",
    initials: "TP",
    theme: "dark", // "dark" | "light"
    currency: "INR", // "INR" | "USD" | "EUR"
    language: "en", // "en" | "hi"
    dateFormat: "DD/MM/YYYY",
    timezone: "Asia/Kolkata",
    monthlyIncome: 0
  },
  
  // 📊 Analytics & Dashboard - Start with zeros
  analytics: {
    currentMonth: {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      expensesByCategory: [],
      dailyExpenses: []
    },
    trends: {
      monthlyData: [],
      categoryTrends: [],
      savingsRate: []
    }
  },
  
  // 🎯 Goals & Targets - Start empty
  goals: [],
  
  // 🎛️ UI State - Default UI settings
  ui: {
    isSetupComplete: false, // Force setup wizard for new users
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
    filterType: "all", // "all" | "income" | "expense"
    editingTransaction: null // For edit functionality
  }
})

const savedData = loadFromLocalStorage()

// Use saved data if valid, otherwise start fresh
let initialState
if (savedData && isValidStateStructure(savedData)) {
  // Ensure saved data has all required properties with proper defaults
  initialState = {
    ...getFreshInitialState(), // Start with fresh defaults
    ...savedData, // Override with saved data
    preferences: {
      ...getFreshInitialState().preferences, // Ensure all preference defaults
      ...savedData.preferences // Override with saved preferences
    }
  }
  
  // Calculate daily expenses and analytics from existing transactions
  if (initialState.transactions && initialState.transactions.length > 0) {
    console.log('Initial State - Found transactions:', initialState.transactions.length)
    console.log('Initial State - Sample transaction:', initialState.transactions[0])
    
    if (!initialState.analytics) {
      initialState.analytics = { currentMonth: { totalIncome: 0, totalExpenses: 0, balance: 0, dailyExpenses: [] } }
    }
    if (!initialState.analytics.currentMonth) {
      initialState.analytics.currentMonth = { totalIncome: 0, totalExpenses: 0, balance: 0, dailyExpenses: [] }
    }
    
    // Recalculate current month analytics from existing transactions
    const currentMonthData = calculateCurrentMonthAnalytics(initialState.transactions)
    initialState.analytics.currentMonth.totalIncome = currentMonthData.totalIncome
    initialState.analytics.currentMonth.totalExpenses = currentMonthData.totalExpenses
    initialState.analytics.currentMonth.balance = currentMonthData.balance
    initialState.analytics.currentMonth.dailyExpenses = calculateDailyExpenses(initialState.transactions)
    
    // Also update budget spent with current month expenses
    if (!initialState.budget) {
      initialState.budget = { monthlyLimit: 0, spent: 0, remaining: 0 }
    }
    initialState.budget.spent = currentMonthData.totalExpenses
    initialState.budget.remaining = initialState.budget.monthlyLimit - currentMonthData.totalExpenses
  } else {
    console.log('Initial State - No transactions found')
  }
} else {
  initialState = getFreshInitialState()
}

const expenseManagerSlice = createSlice({
  name: 'expenseManager',
  initialState,
  reducers: {
    // 💳 TRANSACTIONS CRUD
    // Create Transaction
    addTransaction: (state, action) => {
      // Ensure transactions array exists
      if (!state.transactions) {
        state.transactions = []
      }
      
      const newTransaction = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        ...action.payload
      }
      state.transactions.unshift(newTransaction)
      
      // Ensure analytics structure exists
      if (!state.analytics) {
        state.analytics = { currentMonth: { totalIncome: 0, totalExpenses: 0, balance: 0 } }
      }
      if (!state.analytics.currentMonth) {
        state.analytics.currentMonth = { totalIncome: 0, totalExpenses: 0, balance: 0 }
      }
      
      // Ensure budget structure exists
      if (!state.budget) {
        state.budget = { monthlyLimit: 0, spent: 0, remaining: 0 }
      }
      
      // Update analytics with proper current month calculation
      const currentMonthData = calculateCurrentMonthAnalytics(state.transactions)
      state.analytics.currentMonth.totalIncome = currentMonthData.totalIncome
      state.analytics.currentMonth.totalExpenses = currentMonthData.totalExpenses
      state.analytics.currentMonth.balance = currentMonthData.balance
      
      // Update budget (spent should be current month expenses only)
      state.budget.spent = currentMonthData.totalExpenses
      state.budget.remaining = state.budget.monthlyLimit - state.budget.spent
      
      // Calculate daily expenses for chart
      state.analytics.currentMonth.dailyExpenses = calculateDailyExpenses(state.transactions)
      
      // Ensure notifications array exists
      if (!state.notifications) {
        state.notifications = []
      }
      
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
      // Ensure transactions array exists
      if (!state.transactions) {
        state.transactions = []
        return
      }
      
      const { id, ...updates } = action.payload
      const transaction = state.transactions.find(t => t.id === id)
      if (transaction) {
        // Ensure analytics and budget structures exist
        if (!state.analytics?.currentMonth) {
          state.analytics = { currentMonth: { totalIncome: 0, totalExpenses: 0, balance: 0 } }
        }
        if (!state.budget) {
          state.budget = { monthlyLimit: 0, spent: 0, remaining: 0 }
        }
        
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
        
        // Recalculate analytics with proper current month calculation
        const currentMonthData = calculateCurrentMonthAnalytics(state.transactions)
        state.analytics.currentMonth.totalIncome = currentMonthData.totalIncome
        state.analytics.currentMonth.totalExpenses = currentMonthData.totalExpenses
        state.analytics.currentMonth.balance = currentMonthData.balance
        
        // Update budget (spent should be current month expenses only)
        state.budget.spent = currentMonthData.totalExpenses
        state.budget.remaining = state.budget.monthlyLimit - state.budget.spent
        
        // Calculate daily expenses for chart
        state.analytics.currentMonth.dailyExpenses = calculateDailyExpenses(state.transactions)
        
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
      // Ensure transactions array exists
      if (!state.transactions) {
        state.transactions = []
        return
      }
      
      const transaction = state.transactions.find(t => t.id === action.payload)
      if (transaction) {
        // Ensure analytics and budget structures exist
        if (!state.analytics?.currentMonth) {
          state.analytics = { currentMonth: { totalIncome: 0, totalExpenses: 0, balance: 0 } }
        }
        if (!state.budget) {
          state.budget = { monthlyLimit: 0, spent: 0, remaining: 0 }
        }
        
        // Update analytics
        if (transaction.type === 'expense') {
          state.analytics.currentMonth.totalExpenses -= transaction.amount
          state.budget.spent -= transaction.amount
        } else {
          state.analytics.currentMonth.totalIncome -= transaction.amount
        }
        state.transactions = state.transactions.filter(t => t.id !== action.payload)
        
        // Recalculate analytics with proper current month calculation
        const currentMonthData = calculateCurrentMonthAnalytics(state.transactions)
        state.analytics.currentMonth.totalIncome = currentMonthData.totalIncome
        state.analytics.currentMonth.totalExpenses = currentMonthData.totalExpenses
        state.analytics.currentMonth.balance = currentMonthData.balance
        
        // Update budget (spent should be current month expenses only)
        state.budget.spent = currentMonthData.totalExpenses
        state.budget.remaining = state.budget.monthlyLimit - state.budget.spent
        
        // Calculate daily expenses for chart
        state.analytics.currentMonth.dailyExpenses = calculateDailyExpenses(state.transactions)
        
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
      // Ensure transactions array exists
      if (!state.transactions) {
        state.transactions = []
        return
      }
      
      // Ensure analytics and budget structures exist
      if (!state.analytics?.currentMonth) {
        state.analytics = { currentMonth: { totalIncome: 0, totalExpenses: 0, balance: 0 } }
      }
      if (!state.budget) {
        state.budget = { monthlyLimit: 0, spent: 0, remaining: 0 }
      }
      if (!state.notifications) {
        state.notifications = []
      }
      
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
      // Ensure categories array exists
      if (!state.categories) {
        state.categories = []
      }
      
      const newCategory = {
        id: `c${Date.now()}`,
        ...action.payload
      }
      state.categories.push(newCategory)
      saveToLocalStorage(state)
    },
    
    // Update Category
    updateCategory: (state, action) => {
      // Ensure categories array exists
      if (!state.categories) {
        state.categories = []
        return
      }
      
      const { id, ...updates } = action.payload
      const category = state.categories.find(cat => cat.id === id)
      if (category) {
        Object.assign(category, updates)
        saveToLocalStorage(state)
      }
    },
    
    // Delete Category
    deleteCategory: (state, action) => {
      // Ensure arrays exist
      if (!state.categories) {
        state.categories = []
        return
      }
      if (!state.transactions) {
        state.transactions = []
      }
      
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
      // Ensure notifications array exists
      if (!state.notifications) {
        state.notifications = []
      }
      
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
      // Ensure notifications array exists
      if (!state.notifications) {
        state.notifications = []
        return
      }
      
      const { id, ...updates } = action.payload
      const notification = state.notifications.find(n => n.id === id)
      if (notification) {
        Object.assign(notification, updates)
        saveToLocalStorage(state)
      }
    },
    
    // Delete Notification
    deleteNotification: (state, action) => {
      // Ensure notifications array exists
      if (!state.notifications) {
        state.notifications = []
        return
      }
      
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
      // Ensure notifications array exists
      if (!state.notifications) {
        state.notifications = []
        return
      }
      
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
      // Ensure goals array exists
      if (!state.goals) {
        state.goals = []
      }
      
      const newGoal = {
        id: Date.now(),
        ...action.payload
      }
      state.goals.push(newGoal)
      saveToLocalStorage(state)
    },
    
    updateGoal: (state, action) => {
      // Ensure goals array exists
      if (!state.goals) {
        state.goals = []
        return
      }
      
      const { id, ...updates } = action.payload
      const goal = state.goals.find(g => g.id === id)
      if (goal) {
        Object.assign(goal, updates)
        saveToLocalStorage(state)
      }
    },
    
    deleteGoal: (state, action) => {
      // Ensure goals array exists
      if (!state.goals) {
        state.goals = []
        return
      }
      
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

    // Edit functionality
    setEditingTransaction: (state, action) => {
      state.ui.editingTransaction = action.payload
      if (action.payload) {
        state.ui.showExpenseModal = true
      }
    },

    clearEditingTransaction: (state) => {
      state.ui.editingTransaction = null
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
      // Get completely fresh state
      const freshState = getFreshInitialState()
      
      // Reset to fresh state while preserving some user preferences if they exist
      const preservedPreferences = state.preferences ? { ...state.preferences } : freshState.preferences
      
      Object.assign(state, {
        ...freshState,
        preferences: preservedPreferences
      })
      
      // Clear localStorage and save fresh state
      localStorage.removeItem('expenseManagerData')
      saveToLocalStorage(state)
    },

    // Force Fresh Start (for corrupted data)
    forceFreshStart: (state) => {
      // Get completely fresh state
      const freshState = getFreshInitialState()
      
      // Reset to completely fresh state
      Object.assign(state, freshState)
      
      // Clear localStorage and save fresh state
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
      
      // Recalculate analytics with proper current month calculation
      const currentMonthData = calculateCurrentMonthAnalytics(state.transactions)
      state.analytics.currentMonth.totalIncome = currentMonthData.totalIncome
      state.analytics.currentMonth.totalExpenses = currentMonthData.totalExpenses
      state.analytics.currentMonth.balance = currentMonthData.balance
      
      // Update budget (spent should be current month expenses only)
      state.budget.spent = currentMonthData.totalExpenses
      state.budget.remaining = state.budget.monthlyLimit - state.budget.spent
      
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
    },
    
    // Refresh Analytics - manually recalculate current month analytics
    refreshAnalytics: (state) => {
      // Ensure analytics structure exists
      if (!state.analytics) {
        state.analytics = { currentMonth: { totalIncome: 0, totalExpenses: 0, balance: 0, dailyExpenses: [] } }
      }
      if (!state.analytics.currentMonth) {
        state.analytics.currentMonth = { totalIncome: 0, totalExpenses: 0, balance: 0, dailyExpenses: [] }
      }
      if (!state.budget) {
        state.budget = { monthlyLimit: 0, spent: 0, remaining: 0 }
      }
      
      // Recalculate current month analytics from existing transactions
      const currentMonthData = calculateCurrentMonthAnalytics(state.transactions)
      state.analytics.currentMonth.totalIncome = currentMonthData.totalIncome
      state.analytics.currentMonth.totalExpenses = currentMonthData.totalExpenses
      state.analytics.currentMonth.balance = currentMonthData.balance
      state.analytics.currentMonth.dailyExpenses = calculateDailyExpenses(state.transactions)
      
      // Update budget with current month expenses
      state.budget.spent = currentMonthData.totalExpenses
      state.budget.remaining = state.budget.monthlyLimit - state.budget.spent
      
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
  setEditingTransaction,
  clearEditingTransaction,
  
  // Data Management
  completeSetup,
  resetAllData,
  forceFreshStart,
  importData,
  refreshAnalytics
} = expenseManagerSlice.actions

export default expenseManagerSlice.reducer
