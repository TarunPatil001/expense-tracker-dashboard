import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Trash2, Calendar, CreditCard, Filter, Search, MoreHorizontal, Edit3, CheckSquare, Square, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { deleteTransaction, updateSearchQuery, setSelectedCategory, setEditingTransaction, deleteMultipleTransactions } from '../store/expenseManagerSlice'

const ModernExpenseList = () => {
  const dispatch = useDispatch()
  const { transactions = [], categories = [], preferences = {}, ui = {} } = useSelector(state => state.expenseManager)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  
  // Safety check for UI state
  const searchQuery = ui.searchQuery || ''
  const selectedCategory = ui.selectedCategory || 'all'

  // Clear selection when leaving selection mode
  useEffect(() => {
    if (!isSelectionMode) {
      setSelectedTransactions(new Set())
    }
  }, [isSelectionMode])
  
  // Filter transactions based on search and category
  const filteredExpenses = transactions.filter(expense => {
    const matchesSearch = expense.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.amount?.toString().includes(searchQuery)
    const matchesCategory = selectedCategory === 'all' || 
                           expense.category == selectedCategory || // Use loose equality
                           expense.category?.toString() === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get recent expenses (last 10)
  const recentExpenses = filteredExpenses.slice(0, 10)

  const getCategoryDetails = (categoryId) => {
    // Handle both string and number IDs
    const category = categories.find(cat => cat.id == categoryId) // Use loose equality
    return category || { 
      name: 'Unknown', 
      color: '#6B7280', 
      icon: '❓' 
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const handleDeleteExpense = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      dispatch(deleteTransaction(expenseId))
      toast.success('💸 Expense deleted successfully!')
    }
  }

  const handleEditExpense = (expense) => {
    dispatch(setEditingTransaction(expense))
    toast.success('✏️ Opening edit form...')
  }

  // Multiple delete functionality
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedTransactions(new Set())
  }

  const handleSelectTransaction = (transactionId) => {
    const newSelected = new Set(selectedTransactions)
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId)
    } else {
      newSelected.add(transactionId)
    }
    setSelectedTransactions(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedTransactions.size === recentExpenses.length) {
      setSelectedTransactions(new Set())
    } else {
      setSelectedTransactions(new Set(recentExpenses.map(expense => expense.id)))
    }
  }

  const handleBulkDelete = () => {
    if (selectedTransactions.size === 0) {
      toast.error('Please select expenses to delete')
      return
    }

    const count = selectedTransactions.size
    if (window.confirm(`Are you sure you want to delete ${count} selected expense${count > 1 ? 's' : ''}?`)) {
      // Convert Set to Array for the action
      const transactionIds = Array.from(selectedTransactions)
      dispatch(deleteMultipleTransactions(transactionIds))
      setSelectedTransactions(new Set())
      setIsSelectionMode(false)
      toast.success(`🗑️ ${count} expense${count > 1 ? 's' : ''} deleted successfully!`)
    }
  }

  const cancelSelection = () => {
    setIsSelectionMode(false)
    setSelectedTransactions(new Set())
  }

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'Credit Card': '💳',
      'Debit Card': '💳',
      'Cash': '💵',
      'UPI': '📱',
      'Net Banking': '🏦',
      'Paytm': '📱',
      'PhonePe': '📱',
      'GPay': '📱'
    }
    return icons[method] || '💳'
  }

  const currencySymbol = preferences?.currency === 'INR' ? '₹' : preferences?.currency === 'USD' ? '$' : preferences?.currency === 'EUR' ? '€' : '₹'

  // Calculate total safely
  const totalAmount = filteredExpenses.length > 0 
    ? filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0) 
    : 0

  return (
    <div className="bg-[#1a1a1b] rounded-2xl border border-gray-800">
      {/* Header */}
      <div className="p-3 sm:p-5 border-b border-gray-800">
        {/* Mobile-first header layout */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-0.5">Recent Expenses</h3>
            <p className="text-gray-400 text-sm">
              {isSelectionMode ? (
                `${selectedTransactions.size} of ${filteredExpenses.length} selected`
              ) : (
                <span className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-0">
                  <span>{filteredExpenses.length} expenses</span>
                  <span className="hidden sm:inline mx-2">•</span>
                  <span className="text-orange-400 font-medium">
                    {currencySymbol}{totalAmount.toFixed(2)} total
                  </span>
                </span>
              )}
            </p>
          </div>
          
          {/* Mobile-optimized action buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-shrink-0">
            {/* Bulk Actions */}
            {isSelectionMode ? (
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <button
                  onClick={handleSelectAll}
                  className="px-2 sm:px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2"
                >
                  {selectedTransactions.size === recentExpenses.length ? (
                    <>
                      <Square className="w-3 sm:w-4 h-3 sm:h-4" />
                      <span className="hidden sm:inline">Deselect All</span>
                      <span className="sm:hidden">Deselect</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-3 sm:w-4 h-3 sm:h-4" />
                      <span className="hidden sm:inline">Select All</span>
                      <span className="sm:hidden">Select</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedTransactions.size === 0}
                  className="px-2 sm:px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs sm:text-sm rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2"
                >
                  <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span className="hidden sm:inline">Delete ({selectedTransactions.size})</span>
                  <span className="sm:hidden">({selectedTransactions.size})</span>
                </button>
                <button
                  onClick={cancelSelection}
                  className="px-2 sm:px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2"
                >
                  <X className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={toggleSelectionMode}
                  className="px-2 sm:px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2"
                >
                  <CheckSquare className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span className="hidden sm:inline">Select Multiple</span>
                  <span className="sm:hidden">Select</span>
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 bg-[#0f0f10] hover:bg-[#252527] rounded-lg transition-colors"
                  title="Toggle filters"
                >
                  <Filter className="w-4 h-4 text-gray-400" />
                </button>
                <button className="text-orange-400 hover:text-orange-300 text-xs sm:text-sm font-medium hidden sm:block">
                  View All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search and Filters - Mobile Optimized */}
        <div className={`space-y-2 sm:space-y-3 transition-all duration-300 ${showFilters ? 'block' : 'hidden'}`}>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={ui.searchQuery}
                onChange={(e) => dispatch(updateSearchQuery(e.target.value))}
                placeholder="Search expenses..."
                className="w-full bg-[#0f0f10] border border-gray-700 rounded-lg pl-10 pr-4 py-2 sm:py-2 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none text-sm"
              />
            </div>
            <select
              value={ui.selectedCategory}
              onChange={(e) => dispatch(setSelectedCategory(e.target.value))}
              className="w-full sm:w-auto bg-[#0f0f10] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none text-sm min-w-0 sm:min-w-[180px]"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="p-3 sm:p-5">
        <div className="space-y-1.5 sm:space-y-2">
          {recentExpenses.map((expense) => {
            const category = getCategoryDetails(expense.category)
            return (
              <div 
                key={expense.id} 
                className="flex items-start sm:items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-[#0f0f10] rounded-xl hover:bg-[#252527] transition-all duration-200 group border border-transparent hover:border-gray-700"
              >
                {/* Selection Checkbox */}
                {isSelectionMode && (
                  <button
                    onClick={() => handleSelectTransaction(expense.id)}
                    className="flex items-center justify-center w-6 sm:w-7 h-6 sm:h-7 rounded-lg border-2 border-gray-600 hover:border-orange-500 transition-colors flex-shrink-0 mt-0.5 sm:mt-0"
                  >
                    {selectedTransactions.has(expense.id) ? (
                      <CheckSquare className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-orange-500" />
                    ) : (
                      <Square className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-400" />
                    )}
                  </button>
                )}

                {/* Category Icon */}
                <div 
                  className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg flex items-center justify-center text-base sm:text-lg font-medium flex-shrink-0"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  {category.icon}
                </div>

                {/* Expense Details - Mobile Optimized */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-medium truncate pr-2 text-sm sm:text-base leading-tight">
                      {expense.title}
                    </h4>
                    <span className="text-white font-bold text-sm sm:text-base flex-shrink-0 ml-2">
                      -{currencySymbol}{expense.amount.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Mobile: Stack info vertically, Desktop: Horizontal */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 bg-gray-700 rounded text-xs font-medium">
                        {category.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">{formatDate(expense.date)}</span>
                      </div>
                    </div>
                    
                    {/* Payment method - hidden on mobile to save space */}
                    <div className="hidden sm:flex items-center gap-1">
                      <span className="flex-shrink-0">{getPaymentMethodIcon(expense.paymentMethod)}</span>
                      <span className="truncate">{expense.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Actions - Mobile Optimized */}
                {!isSelectionMode && (
                  <div className="flex items-center gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => handleEditExpense(expense)}
                      className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors"
                      title="Edit expense"
                    >
                      <Edit3 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-1 sm:p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {recentExpenses.length === 0 && (
            <div className="text-center py-6 sm:py-8">
              <div className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-gray-700/50 flex items-center justify-center">
                <CreditCard className="w-5 sm:w-6 h-5 sm:h-6 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm sm:text-base font-medium">No expenses found</p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 px-4 sm:px-0">
                {searchQuery || selectedCategory !== 'all' ? 
                  'Try adjusting your search or filters' : 
                  'Add your first expense to get started'
                }
              </p>
            </div>
          )}
        </div>

        {/* Load More - Mobile Optimized */}
        {filteredExpenses.length > 10 && (
          <div className="text-center mt-3 sm:mt-4">
            <button className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-[#0f0f10] hover:bg-[#252527] text-white rounded-xl transition-colors border border-gray-700 hover:border-gray-600 text-sm">
              Load More ({filteredExpenses.length - 10} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModernExpenseList
