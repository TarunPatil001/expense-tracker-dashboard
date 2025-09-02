import React from 'react'
import { useSelector } from 'react-redux'
import { Bell, Plus, Calendar, TrendingUp } from 'lucide-react'

const Header = ({ onAddExpense }) => {
  const { preferences, transactions } = useSelector(state => state.expenseManager)

  // Extract user info from preferences with safe defaults
  const userName = preferences?.name || preferences?.userName || 'Tarun Patil'
  
  // Generate user initials properly with enhanced logic
  const getUserInitials = (name) => {
    if (!name || name.trim() === '') return 'TP'
    
    // Clean the name and split by spaces
    const nameParts = name.trim().split(/\s+/).filter(part => part.length > 0)
    
    if (nameParts.length === 0) return 'TP'
    if (nameParts.length === 1) {
      // Single name, return first two characters or just first if name is short
      const singleName = nameParts[0]
      return singleName.length >= 2 ? singleName.substring(0, 2).toUpperCase() : singleName.charAt(0).toUpperCase()
    }
    
    // Multiple names, take first letter of first and last name
    const firstInitial = nameParts[0].charAt(0).toUpperCase()
    const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    return firstInitial + lastInitial
  }
  
  // Enhanced userInitials with fallbacks
  let userInitials
  if (preferences?.initials && preferences.initials.trim() !== '') {
    userInitials = preferences.initials.toUpperCase()
  } else {
    userInitials = getUserInitials(userName)
  }
  
  // Final safety check
  if (!userInitials || userInitials.trim() === '') {
    userInitials = 'TP'
  }
  
  // Debug: Add console log to check values
  console.log('Header Debug:', { 
    preferences: preferences, 
    userName: userName, 
    userInitials: userInitials,
    preferencesInitials: preferences?.initials 
  })
  
  // Temporary: Force clear localStorage if still showing old data
  React.useEffect(() => {
    if (preferences?.initials === 'U' && preferences?.name === 'User') {
      console.log('Detected old data, clearing localStorage...')
      localStorage.removeItem('expenseManagerData')
      window.location.reload()
    }
  }, [preferences])

  // Get current date info
  const now = new Date()
  const currentDate = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Quick stats for today
  const todaysTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date).toDateString()
    return transactionDate === now.toDateString()
  })
  const todayExpenses = todaysTransactions.filter(t => t.type === 'expense')
  const todayTotal = todayExpenses.reduce((sum, t) => sum + t.amount, 0)

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0f0f10] via-[#111214] to-[#0f0f10] border-b border-[#222] pb-4 backdrop-blur-sm">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          {/* Left Section - Date & Stats */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8 w-full sm:w-auto">
            <div className="w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{currentDate}</span>
                </div>
                
                {todayExpenses.length > 0 && (
                  <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                    <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 text-orange-400 flex-shrink-0" />
                    <span className="text-orange-300 font-medium text-xs sm:text-sm whitespace-nowrap">
                      {todayExpenses.length} expenses • ${todayTotal.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Enhanced Notifications */}
            <button className="relative group w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-[#111214] border border-[#222] flex items-center justify-center hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-200 shadow-lg backdrop-blur-sm">
              <Bell className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 group-hover:text-orange-400 transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse shadow-lg shadow-orange-500/50"></span>
              <span className="absolute -top-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 bg-orange-500 rounded-full"></span>
            </button>
            
            {/* Enhanced Add Expense Button */}
            <button 
              onClick={onAddExpense}
              className="relative group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-colors duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 flex items-center gap-1 sm:gap-2 border border-orange-400/20"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="sm:hidden text-xs">Add</span>
            </button>
            
            {/* Enhanced Profile */}
            <div className="relative group">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 flex items-center justify-center cursor-pointer border-2 border-transparent group-hover:border-orange-500/30 transition-all duration-200 shadow-lg backdrop-blur-sm">
                <span className="text-white font-semibold text-xs sm:text-sm">{userInitials}</span>
              </div>
              
              {/* Profile Tooltip */}
              <div className="absolute right-0 top-full mt-2 px-3 py-2 bg-[#111214] border border-[#222] rounded-lg text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50">
                {userName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
