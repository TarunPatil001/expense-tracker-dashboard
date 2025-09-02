import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Settings } from 'lucide-react'
import { toggleModal } from '../store/expenseManagerSlice'

const CategoryBudgets = () => {
  const dispatch = useDispatch()
  const { categories = [], transactions = [], preferences = {} } = useSelector(state => state.expenseManager || {})
  const currencySymbol = preferences?.currency === 'INR' ? '₹' : preferences?.currency === 'USD' ? '$' : preferences?.currency === 'EUR' ? '€' : '₹'

  // Calculate spent amount for each category
  const getCategorySpent = (categoryId) => {
    return transactions
      .filter(transaction => transaction.category == categoryId && transaction.type === 'expense') // Use loose equality
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  }

  return (
    <div className="bg-[#1a1a1b] rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header Section */}
      <div className="p-4 sm:p-5 border-b border-gray-800 bg-gradient-to-r from-[#1a1a1b] to-[#252527]">
        {/* Desktop: Single row layout, Mobile: Stacked layout */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          {/* Title section */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-0">Category Budgets</h3>
                <p className="text-gray-400 text-xs sm:text-sm sm:hidden">Track your spending by category</p>
              </div>
              
              {/* Desktop button - inline with title */}
              <div className="hidden sm:flex flex-shrink-0">
                <button 
                  onClick={() => dispatch(toggleModal('showCategoryModal'))}
                  className="flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 text-sm font-medium px-3 py-2 rounded-xl border border-orange-500/20 hover:border-orange-500/30 transition-all duration-200 group whitespace-nowrap"
                >
                  <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200 flex-shrink-0" />
                  <span>Manage</span>
                </button>
              </div>
            </div>
            
            {/* Desktop subtitle */}
            <p className="hidden sm:block text-gray-400 text-sm mt-1">Track your spending by category</p>
          </div>
          
          {/* Mobile button */}
          <div className="sm:hidden">
            <button 
              onClick={() => dispatch(toggleModal('showCategoryModal'))}
              className="flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 text-xs font-medium px-3 py-2 rounded-xl border border-orange-500/20 hover:border-orange-500/30 transition-all duration-200 group whitespace-nowrap w-full justify-center"
            >
              <Settings className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200 flex-shrink-0" />
              <span>Manage</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="p-4 sm:p-5">
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-700/50 flex items-center justify-center">
              <Settings className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-400 font-medium mb-1">No categories yet</p>
            <p className="text-gray-500 text-xs">Create categories to track your budgets</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {categories.map((category) => {
              const spent = getCategorySpent(category.id)
              const budget = category.budget || 0
              const percentage = budget > 0 ? (spent / budget) * 100 : 0
              const isOverBudget = percentage > 100
              const remaining = Math.max(0, budget - spent)
              
              return (
                <div 
                  key={category.id} 
                  className="bg-[#0f0f10] rounded-xl p-4 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-200 group"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-medium flex-shrink-0"
                        style={{ backgroundColor: `${category.color}15`, color: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-white font-medium text-sm sm:text-base truncate">{category.name}</h4>
                        <p className="text-gray-400 text-xs">
                          {currencySymbol}{spent.toFixed(2)} of {currencySymbol}{budget.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Percentage Badge */}
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        isOverBudget 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : percentage > 80 
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                      }`}>
                        {percentage.toFixed(1)}%
                      </span>
                      <p className="text-gray-500 text-xs mt-1">
                        {currencySymbol}{remaining.toFixed(2)} left
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${
                          isOverBudget 
                            ? 'bg-gradient-to-r from-red-500 to-red-600' 
                            : percentage > 80
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                              : 'bg-gradient-to-r from-green-500 to-emerald-600'
                        }`}
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: percentage <= 80 && !isOverBudget ? category.color : undefined
                        }}
                      />
                    </div>
                    
                    {/* Progress indicator dot */}
                    {percentage > 0 && (
                      <div 
                        className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#0f0f10] transition-all duration-500 ${
                          isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ 
                          left: `calc(${Math.min(percentage, 100)}% - 6px)`,
                          backgroundColor: percentage <= 80 && !isOverBudget ? category.color : undefined
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Warning message for over budget */}
                  {isOverBudget && (
                    <div className="mt-2 p-2 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-xs font-medium">
                        Over budget by {currencySymbol}{(spent - budget).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryBudgets
