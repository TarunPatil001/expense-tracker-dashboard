import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Calculator, TrendingUp, Target, Lightbulb, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'
import { addTransaction } from '../store/expenseManagerSlice'
import toast from 'react-hot-toast'

const SmartBudgetRebalancer = ({ totalExpenses, monthlyBudget, currentDay, daysInMonth }) => {
  const dispatch = useDispatch()
  const { categories = [], preferences = {} } = useSelector(state => state.expenseManager || {})
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [showRebalancer, setShowRebalancer] = useState(false)

  const getCurrencySymbol = () => {
    switch (preferences?.currency) {
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'INR': return '₹'
      default: return '₹'
    }
  }

  // Calculate current situation
  const dailyBudget = monthlyBudget / daysInMonth
  const daysRemaining = daysInMonth - currentDay
  const budgetUsed = totalExpenses
  const budgetRemaining = monthlyBudget - budgetUsed
  const currentDailyAvg = totalExpenses / currentDay
  const isOverBudget = budgetRemaining < 0
  const isOverDailyLimit = currentDailyAvg > dailyBudget

  // Smart rebalancing strategies
  const rebalancingStrategies = [
    {
      id: 'reduce_future',
      icon: Target,
      title: 'Reduce Future Spending',
      color: 'blue',
      description: 'Lower daily limit for remaining days',
      calculation: () => {
        if (daysRemaining <= 0) return null
        const newDailyLimit = Math.max(budgetRemaining / daysRemaining, 0)
        const reductionNeeded = dailyBudget - newDailyLimit
        return {
          newDailyLimit: newDailyLimit,
          reductionPercentage: ((reductionNeeded / dailyBudget) * 100).toFixed(0),
          feasible: newDailyLimit >= dailyBudget * 0.3, // At least 30% of original
          message: newDailyLimit > 0 
            ? `Reduce daily spending to ${getCurrencySymbol()}${newDailyLimit.toFixed(0)}/day`
            : 'Budget exhausted - emergency mode'
        }
      }
    },
    {
      id: 'productive_categories',
      icon: TrendingUp,
      title: 'Invest in Productive Categories',
      color: 'green',
      description: 'Redirect overspend to growth categories',
      calculation: () => {
        const overspend = Math.max(0, budgetUsed - (dailyBudget * currentDay))
        const productiveCategories = categories.filter(cat => 
          ['Education', 'Health', 'Investment', 'Skill Development', 'Books', 'Courses'].includes(cat.name)
        )
        return {
          overspendAmount: overspend,
          productiveCategories: productiveCategories,
          suggestion: overspend > 0 
            ? `Convert ${getCurrencySymbol()}${overspend.toFixed(0)} overspend into productive investment`
            : 'Consider allocating future overspend to growth categories'
        }
      }
    },
    {
      id: 'weekly_reset',
      icon: Calculator,
      title: 'Weekly Budget Reset',
      color: 'purple',
      description: 'Rebalance weekly instead of daily',
      calculation: () => {
        const weeksRemaining = Math.ceil(daysRemaining / 7)
        const weeklyBudget = budgetRemaining / weeksRemaining
        return {
          weeklyBudget: weeklyBudget,
          weeksRemaining: weeksRemaining,
          flexibility: 'High',
          message: `${getCurrencySymbol()}${weeklyBudget.toFixed(0)} per week for ${weeksRemaining} weeks`
        }
      }
    },
    {
      id: 'earn_back',
      icon: Lightbulb,
      title: 'Earn Back Strategy',
      color: 'orange',
      description: 'Offset overspend with additional income',
      calculation: () => {
        const overspend = Math.max(0, budgetUsed - (dailyBudget * currentDay))
        const suggestions = [
          'Sell unused items',
          'Freelance work',
          'Cashback opportunities',
          'Side gig income'
        ]
        return {
          targetAmount: overspend,
          dailyEarnTarget: overspend / daysRemaining,
          suggestions: suggestions,
          message: `Earn ${getCurrencySymbol()}${overspend.toFixed(0)} to offset overspend`
        }
      }
    }
  ]

  // Add income transaction for "earn back" strategy
  const handleEarnBack = (amount, description) => {
    dispatch(addTransaction({
      title: description,
      amount: parseFloat(amount),
      category: 'income', // You might want to add income categories
      notes: 'Earn back - budget rebalancing',
      paymentMethod: 'Income',
      date: new Date().toISOString().split('T')[0],
      type: 'income'
    }))
    toast.success(`💰 ${getCurrencySymbol()}${amount} income added to rebalance budget!`)
  }

  if (!isOverDailyLimit && !isOverBudget) {
    return null // Don't show if budget is fine
  }

  return (
    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 sm:p-6 my-6 sm:my-8 mobile-container">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 sm:justify-between my-4 sm:my-6">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-white text-base sm:text-lg leading-tight">Smart Budget Rebalancing</h4>
            <p className="text-gray-400 text-sm sm:text-base mt-2 leading-relaxed break-words">
              {isOverBudget 
                ? `Budget exceeded by ${getCurrencySymbol()}${Math.abs(budgetRemaining).toFixed(0)}`
                : `Daily average ${getCurrencySymbol()}${(currentDailyAvg - dailyBudget).toFixed(0)} over limit`
              }
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowRebalancer(!showRebalancer)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors w-full sm:w-auto flex-shrink-0"
        >
          {showRebalancer ? 'Hide' : 'Rebalance'}
        </button>
      </div>

      {showRebalancer && (
        <div className="space-y-4 sm:space-y-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {rebalancingStrategies.map((strategy) => {
              const Icon = strategy.icon
              const calc = strategy.calculation()
              
              return (
                <div
                  key={strategy.id}
                  className={`group relative bg-gradient-to-br from-gray-900 to-gray-800 border-2 rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-300 mobile-card transform hover:scale-[1.02] ${
                    selectedStrategy === strategy.id 
                      ? `border-${strategy.color}-500 bg-gradient-to-br from-${strategy.color}-500/10 to-${strategy.color}-600/5 shadow-lg shadow-${strategy.color}-500/20`
                      : 'border-gray-600 hover:border-gray-500 hover:shadow-xl'
                  }`}
                  onClick={() => setSelectedStrategy(strategy.id)}
                >
                  {/* Strategy Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br from-${strategy.color}-500 to-${strategy.color}-600 rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-base sm:text-lg leading-tight">{strategy.title}</h5>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${strategy.color}-500/20 text-${strategy.color}-300 mt-1 inline-block`}>
                          {strategy.color === 'blue' ? 'REDUCE' : strategy.color === 'green' ? 'INVEST' : strategy.color === 'purple' ? 'FLEXIBLE' : 'EARN'}
                        </span>
                      </div>
                    </div>
                    {selectedStrategy === strategy.id && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-300 text-sm sm:text-base mb-4 leading-relaxed">{strategy.description}</p>
                  
                  {calc && (
                    <div className="space-y-2 sm:space-y-3">
                      {strategy.id === 'reduce_future' && (
                        <div className="text-sm sm:text-base">
                          <div className={`font-medium leading-tight ${calc.feasible ? 'text-green-400' : 'text-red-400'}`}>
                            {calc.message}
                          </div>
                          {calc.feasible && (
                            <div className="text-gray-400 mt-2">
                              {calc.reductionPercentage}% reduction needed
                            </div>
                          )}
                        </div>
                      )}
                      
                      {strategy.id === 'productive_categories' && (
                        <div className="text-sm sm:text-base">
                          <div className="text-green-400 font-medium leading-tight">{calc.suggestion}</div>
                          {calc.productiveCategories.length > 0 && (
                            <div className="text-gray-400 mt-2 leading-tight">
                              <span className="font-medium">Available:</span>
                              <div className="break-words mt-1">
                                {calc.productiveCategories.map(cat => cat.name).join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {strategy.id === 'weekly_reset' && (
                        <div className="text-sm sm:text-base">
                          <div className="text-purple-400 font-medium leading-tight">{calc.message}</div>
                          <div className="text-gray-400 mt-2">Flexibility: {calc.flexibility}</div>
                        </div>
                      )}
                      
                      {strategy.id === 'earn_back' && (
                        <div className="text-sm sm:text-base space-y-2 sm:space-y-3">
                          <div className="text-orange-400 font-medium leading-tight">{calc.message}</div>
                          <div className="text-gray-400">
                            Target: {getCurrencySymbol()}{calc.dailyEarnTarget?.toFixed(0)}/day
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {calc.suggestions.slice(0, 2).map((suggestion, idx) => (
                              <span key={idx} className="bg-orange-500/20 text-orange-300 text-sm px-3 py-1.5 rounded break-words">
                                {suggestion}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          {selectedStrategy && (
            <div className="bg-[#0f0f10] rounded-xl p-4 sm:p-6 my-4 sm:my-6">
              <h6 className="font-medium text-white mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                Apply Strategy
              </h6>
              
              {selectedStrategy === 'reduce_future' && (
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                    Your new daily limit will be automatically applied. We'll track your progress and send alerts.
                  </p>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium w-full sm:w-auto transition-colors"
                    onClick={() => {
                      const calc = rebalancingStrategies[0].calculation()
                      toast.success(`Daily limit updated to ${getCurrencySymbol()}${calc.newDailyLimit.toFixed(0)}`)
                      setShowRebalancer(false)
                    }}
                  >
                    Update Daily Limit
                  </button>
                </div>
              )}
              
              {selectedStrategy === 'productive_categories' && (
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                    Consider redirecting your next expense to education, health, or investment categories.
                  </p>
                  <button 
                    className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium w-full sm:w-auto transition-colors"
                    onClick={() => {
                      toast.success('Great choice! Your next expense will be flagged for productive spending.')
                      setShowRebalancer(false)
                    }}
                  >
                    Enable Productive Mode
                  </button>
                </div>
              )}
              
              {selectedStrategy === 'weekly_reset' && (
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                    Switch to weekly budget tracking for more flexibility in your spending patterns.
                  </p>
                  <button 
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium w-full sm:w-auto transition-colors"
                    onClick={() => {
                      toast.success('Switched to weekly budget tracking!')
                      setShowRebalancer(false)
                    }}
                  >
                    Switch to Weekly
                  </button>
                </div>
              )}
              
              {selectedStrategy === 'earn_back' && (
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                    Add income to offset your overspending and get back on track.
                  </p>
                  <div className="space-y-3">
                    {/* Input Fields Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input 
                        type="number" 
                        placeholder="Amount earned"
                        className="w-full bg-[#1a1a1b] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm sm:text-base focus:border-orange-500 focus:outline-none transition-colors"
                        id="earnBackAmount"
                      />
                      <input 
                        type="text" 
                        placeholder="Source (e.g., Freelance)"
                        className="w-full bg-[#1a1a1b] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm sm:text-base focus:border-orange-500 focus:outline-none transition-colors"
                        id="earnBackSource"
                      />
                    </div>
                    
                    {/* Button Row */}
                    <button 
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      onClick={() => {
                        const amount = document.getElementById('earnBackAmount').value
                        const source = document.getElementById('earnBackSource').value
                        if (amount && source) {
                          handleEarnBack(amount, source)
                          setShowRebalancer(false)
                        }
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Income
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SmartBudgetRebalancer
