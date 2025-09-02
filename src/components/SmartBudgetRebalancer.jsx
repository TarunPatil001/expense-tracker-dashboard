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
    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 mobile-container">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between mb-3 sm:mb-4">
        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-white text-sm sm:text-base leading-tight">Smart Budget Rebalancing</h4>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 leading-tight break-words">
              {isOverBudget 
                ? `Budget exceeded by ${getCurrencySymbol()}${Math.abs(budgetRemaining).toFixed(0)}`
                : `Daily average ${getCurrencySymbol()}${(currentDailyAvg - dailyBudget).toFixed(0)} over limit`
              }
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowRebalancer(!showRebalancer)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto flex-shrink-0"
        >
          {showRebalancer ? 'Hide' : 'Rebalance'}
        </button>
      </div>

      {showRebalancer && (
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {rebalancingStrategies.map((strategy) => {
              const Icon = strategy.icon
              const calc = strategy.calculation()
              
              return (
                <div
                  key={strategy.id}
                  className={`bg-[#0f0f10] border rounded-xl p-3 sm:p-4 cursor-pointer transition-all mobile-card ${
                    selectedStrategy === strategy.id 
                      ? `border-${strategy.color}-500 bg-${strategy.color}-500/5`
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedStrategy(strategy.id)}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${strategy.color}-400 flex-shrink-0`} />
                    <h5 className="font-medium text-white text-sm sm:text-base leading-tight min-w-0 flex-1">{strategy.title}</h5>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed break-words">{strategy.description}</p>
                  
                  {calc && (
                    <div className="space-y-1.5 sm:space-y-2">
                      {strategy.id === 'reduce_future' && (
                        <div className="text-xs sm:text-sm">
                          <div className={`font-medium leading-tight ${calc.feasible ? 'text-green-400' : 'text-red-400'}`}>
                            {calc.message}
                          </div>
                          {calc.feasible && (
                            <div className="text-gray-400 mt-1">
                              {calc.reductionPercentage}% reduction needed
                            </div>
                          )}
                        </div>
                      )}
                      
                      {strategy.id === 'productive_categories' && (
                        <div className="text-xs sm:text-sm">
                          <div className="text-green-400 font-medium leading-tight">{calc.suggestion}</div>
                          {calc.productiveCategories.length > 0 && (
                            <div className="text-gray-400 mt-1 leading-tight">
                              <span className="font-medium">Available:</span>
                              <div className="break-words">
                                {calc.productiveCategories.map(cat => cat.name).join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {strategy.id === 'weekly_reset' && (
                        <div className="text-xs sm:text-sm">
                          <div className="text-purple-400 font-medium leading-tight">{calc.message}</div>
                          <div className="text-gray-400 mt-1">Flexibility: {calc.flexibility}</div>
                        </div>
                      )}
                      
                      {strategy.id === 'earn_back' && (
                        <div className="text-xs sm:text-sm space-y-1.5 sm:space-y-2">
                          <div className="text-orange-400 font-medium leading-tight">{calc.message}</div>
                          <div className="text-gray-400">
                            Target: {getCurrencySymbol()}{calc.dailyEarnTarget?.toFixed(0)}/day
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {calc.suggestions.slice(0, 2).map((suggestion, idx) => (
                              <span key={idx} className="bg-orange-500/20 text-orange-300 text-xs px-2 py-1 rounded break-words">
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
            <div className="bg-[#0f0f10] rounded-xl p-3 sm:p-4">
              <h6 className="font-medium text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                Apply Strategy
              </h6>
              
              {selectedStrategy === 'reduce_future' && (
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    Your new daily limit will be automatically applied. We'll track your progress and send alerts.
                  </p>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium w-full sm:w-auto transition-colors"
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
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    Consider redirecting your next expense to education, health, or investment categories.
                  </p>
                  <button 
                    className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium w-full sm:w-auto transition-colors"
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
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    Switch to weekly budget tracking for more flexibility in your spending patterns.
                  </p>
                  <button 
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium w-full sm:w-auto transition-colors"
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
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    Add income to offset your overspending and get back on track.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="number" 
                      placeholder="Amount earned"
                      className="flex-1 bg-[#1a1a1b] border border-gray-700 rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:border-orange-500 focus:outline-none"
                      id="earnBackAmount"
                    />
                    <input 
                      type="text" 
                      placeholder="Source (e.g., Freelance)"
                      className="flex-1 bg-[#1a1a1b] border border-gray-700 rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:border-orange-500 focus:outline-none"
                      id="earnBackSource"
                    />
                    <button 
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium w-full sm:w-auto flex-shrink-0 transition-colors"
                      onClick={() => {
                        const amount = document.getElementById('earnBackAmount').value
                        const source = document.getElementById('earnBackSource').value
                        if (amount && source) {
                          handleEarnBack(amount, source)
                          setShowRebalancer(false)
                        }
                      }}
                    >
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
