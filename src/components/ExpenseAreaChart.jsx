import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp, TrendingDown, Calendar, ChevronDown } from 'lucide-react'
import SmartBudgetRebalancer from './SmartBudgetRebalancer'

const ExpenseAreaChart = () => {
  const { 
    preferences = {}, 
    transactions = [],
    budget = {}
  } = useSelector(state => state.expenseManager || {})
  
  // State for selected month/year
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  
  // Safe currency symbol function
  const getCurrencySymbol = () => {
    const currency = preferences?.currency
    switch (currency) {
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'INR': return '₹'
      default: return '₹'
    }
  }

  // Calculate daily expenses for selected month
  const calculateDailyExpenses = useMemo(() => {
    // Filter transactions for selected month/year
    const monthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return transactionDate.getMonth() === selectedMonth && 
             transactionDate.getFullYear() === selectedYear &&
             transaction.type === 'expense'
    })
    
    // Group by day
    const dailyData = {}
    monthTransactions.forEach(transaction => {
      const day = new Date(transaction.date).getDate()
      if (!dailyData[day]) {
        dailyData[day] = 0
      }
      dailyData[day] += transaction.amount
    })
    
    // Create array for all days of selected month
    const dailyExpenses = []
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    let cumulative = 0
    
    for (let day = 1; day <= daysInMonth; day++) {
      const amount = dailyData[day] || 0
      cumulative += amount
      dailyExpenses.push({
        day: day,
        amount: amount,
        cumulative: cumulative,
        date: new Date(selectedYear, selectedMonth, day).toISOString().split('T')[0]
      })
    }
    
    return dailyExpenses
  }, [transactions, selectedMonth, selectedYear])

  // Use calculated data or generate zero data if no transactions exist
  const chartData = calculateDailyExpenses.length > 0 ? calculateDailyExpenses : generateZeroData()
  const hasNoData = calculateDailyExpenses.length === 0 || calculateDailyExpenses.every(day => day.amount === 0)

  function generateZeroData() {
    const data = []
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      data.push({
        day: day,
        amount: 0,
        cumulative: 0,
        date: new Date(selectedYear, selectedMonth, day).toISOString().split('T')[0]
      })
    }
    return data
  }

  // removed unused generateSampleData

  const totalExpenses = chartData.reduce((sum, day) => sum + day.amount, 0)
  
  // For current month budget tracking, be smart about which expenses to count
  const expensesForBudgetCalc = (() => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    if (selectedMonth === currentMonth && selectedYear === currentYear) {
      // For budget tracking, count all expenses in current month regardless of date
      // This shows realistic spending vs budget for the month
      return totalExpenses
    }
    // For past/future months, count all expenses
    return totalExpenses
  })()
  
  // Calculate meaningful average daily spending
  const avgDaily = (() => {
    if (totalExpenses === 0) return 0
    
    // Get current day of month for elapsed days calculation
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    // If viewing current month, use elapsed days for realistic daily average
    if (selectedMonth === currentMonth && selectedYear === currentYear) {
      const elapsedDays = today.getDate() // Days that have actually passed
      return totalExpenses / elapsedDays
    } else {
      // For past months, use days with spending for meaningful average
      const daysWithSpending = chartData.filter(day => day.amount > 0).length
      return daysWithSpending > 0 ? totalExpenses / daysWithSpending : 0
    }
  })()
  
  // Calculate meaningful trend for expense tracking
  const trend = (() => {
    // First check: no data or total expenses is zero
    if (chartData.length <= 1 || totalExpenses === 0) return 0
    
    // Get days with actual spending
    const daysWithSpending = chartData.filter(day => day.amount > 0)
    
    // If no spending at all, return 0
    if (daysWithSpending.length === 0) return 0
    
    // Enhanced calculation for single day spending
    if (daysWithSpending.length === 1) {
      const monthlyBudget = budget?.monthlyLimit || 7000
      const dailyBudgetTarget = monthlyBudget / chartData.length
      const actualSpending = daysWithSpending[0].amount
      
      // Safety check for zero values
      if (dailyBudgetTarget === 0 || actualSpending === 0) return 0
      return ((actualSpending - dailyBudgetTarget) / dailyBudgetTarget) * 100
    }
    
    // Enhanced multi-day trend calculation
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear
    
    if (isCurrentMonth) {
      // For current month: Compare recent week vs previous week
      const currentDay = today.getDate()
      const recentWeekStart = Math.max(0, currentDay - 7)
      const previousWeekStart = Math.max(0, currentDay - 14)
      const previousWeekEnd = currentDay - 7
      
      const recentWeekData = chartData.slice(recentWeekStart, currentDay)
      const previousWeekData = chartData.slice(previousWeekStart, previousWeekEnd)
      
      const recentWeekTotal = recentWeekData.reduce((sum, day) => sum + day.amount, 0)
      const previousWeekTotal = previousWeekData.reduce((sum, day) => sum + day.amount, 0)
      
      // Both weeks have zero spending
      if (previousWeekTotal === 0 && recentWeekTotal === 0) return 0
      
      if (previousWeekTotal === 0) {
        return recentWeekTotal > 0 ? 25 : 0 // Moderate increase from zero baseline
      }
      
      const weekOverWeekChange = ((recentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100
      return Math.min(Math.max(weekOverWeekChange, -95), 200) // Allow for higher positive trends
    } else {
      // For historical months: Compare spending velocity (early vs late month)
      const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2))
      const secondHalf = chartData.slice(Math.floor(chartData.length / 2))
      
      const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.amount, 0) / firstHalf.length
      const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.amount, 0) / secondHalf.length
      
      // Both halves have zero spending
      if (firstHalfAvg === 0 && secondHalfAvg === 0) return 0
      
      if (firstHalfAvg === 0) {
        return secondHalfAvg > 0 ? 30 : 0
      }
      
      const velocityChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
      return Math.min(Math.max(velocityChange, -90), 150)
    }
  })()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1b] border border-gray-700 rounded-xl p-3 sm:p-4 shadow-lg max-w-xs">
          <p className="text-gray-300 text-xs sm:text-sm mb-1.5 sm:mb-2 font-medium">Day {label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <div 
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-300 text-xs sm:text-sm capitalize truncate">
                    {entry.dataKey === 'amount' ? 'Daily' : 'Cumulative'}
                  </span>
                </div>
                <span className="text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                  {getCurrencySymbol()}{entry.value.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  const CustomDot = (props) => {
    const { cx, cy, payload } = props
    if (payload.amount > avgDaily * 1.5) {
      return (
        <circle 
          cx={cx} 
          cy={cy} 
          r={3.5} 
          fill="#FF6B6B" 
          stroke="#FF6B6B" 
          strokeWidth={1.8}
          className="animate-pulse"
        />
      )
    }
    return null
  }

  return (
    <div className="bg-[#1a1a1b] rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold text-white truncate">Expense Trends</h3>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 leading-tight">
            Daily spending pattern for<br className="sm:hidden" /> 
            <span className="font-medium text-gray-300">
              {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className="relative">
            <select
              value={`${selectedYear}-${selectedMonth}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-')
                setSelectedYear(parseInt(year))
                setSelectedMonth(parseInt(month))
              }}
              className="appearance-none bg-[#0f0f10] border border-gray-700 hover:border-gray-600 rounded-lg px-3 sm:px-4 py-2 pr-8 sm:pr-10 text-gray-300 text-xs sm:text-sm focus:border-orange-500 focus:outline-none cursor-pointer transition-colors w-full min-w-0"
            >
              {/* Generate options for last 12 months */}
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date()
                date.setMonth(date.getMonth() - i)
                const year = date.getFullYear()
                const month = date.getMonth()
                return (
                  <option key={`${year}-${month}`} value={`${year}-${month}`}>
                    {date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </option>
                )
              })}
            </select>
            <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-[#0f0f10] rounded-xl p-3 sm:p-4 text-center border border-gray-800/50 hover:border-gray-700/50 transition-colors">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <span className="text-lg sm:text-2xl font-bold text-white">
              {getCurrencySymbol()}{expensesForBudgetCalc.toFixed(0)}
            </span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-medium">Total Spent</p>
          <p className="text-xs text-gray-500 leading-tight mt-1">
            {(() => {
              const monthlyBudget = budget?.monthlyLimit || 7000 // Fallback to 7000 if no budget set
              const remaining = monthlyBudget - expensesForBudgetCalc
              const percentage = (expensesForBudgetCalc / monthlyBudget) * 100
              return remaining >= 0 
                ? `${getCurrencySymbol()}${remaining.toFixed(0)} left (${percentage.toFixed(1)}% used)`
                : `${getCurrencySymbol()}${Math.abs(remaining).toFixed(0)} over budget`
            })()}
          </p>
        </div>

        <div className="bg-[#0f0f10] rounded-xl p-3 sm:p-4 text-center border border-gray-800/50 hover:border-gray-700/50 transition-colors">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <span className="text-lg sm:text-2xl font-bold text-white">
              {getCurrencySymbol()}{isNaN(avgDaily) ? '0' : avgDaily.toFixed(0)}
            </span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-medium">Avg Daily</p>
          <p className="text-xs text-gray-500 leading-tight mt-1">
            {(() => {
              const monthlyBudget = budget?.monthlyLimit || 7000 // Fallback to 7000 if no budget set
              const dailyBudget = monthlyBudget / chartData.length
              const currentAvg = isNaN(avgDaily) ? 0 : avgDaily
              const today = new Date()
              const currentMonth = today.getMonth()
              const currentYear = today.getFullYear()
              
              if (currentAvg <= dailyBudget) {
                return `${getCurrencySymbol()}${(dailyBudget - currentAvg).toFixed(0)} under target`
              } else {
                // Overspending scenario - provide actionable insights
                const overspend = currentAvg - dailyBudget
                const overspendPercentage = ((overspend / dailyBudget) * 100).toFixed(0)
                
                if (selectedMonth === currentMonth && selectedYear === currentYear) {
                  // For current month, calculate impact on remaining days
                  const daysElapsed = today.getDate()
                  const daysRemaining = chartData.length - daysElapsed
                  const totalSpentSoFar = expensesForBudgetCalc
                  const budgetRemaining = monthlyBudget - totalSpentSoFar
                  
                  if (daysRemaining > 0 && budgetRemaining > 0) {
                    const adjustedDailyBudget = budgetRemaining / daysRemaining
                    return `${getCurrencySymbol()}${adjustedDailyBudget.toFixed(0)}/day needed to stay on track`
                  } else if (budgetRemaining <= 0) {
                    return `Budget exceeded by ${getCurrencySymbol()}${Math.abs(budgetRemaining).toFixed(0)}`
                  } else {
                    return `${overspendPercentage}% over daily target`
                  }
                } else {
                  // For past months, show historical overspending
                  return `${getCurrencySymbol()}${overspend.toFixed(0)} over target (${overspendPercentage}%)`
                }
              }
            })()}
          </p>
        </div>

        <div className="bg-[#0f0f10] rounded-xl p-3 sm:p-4 text-center border border-gray-800/50 hover:border-gray-700/50 transition-colors">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <span className={`text-lg sm:text-2xl font-bold ${trend >= 0 ? 'text-red-400' : 'text-green-400'}`}>
              {isNaN(trend) ? '0.0' : Math.abs(trend).toFixed(1)}%
            </span>
            {(isNaN(trend) ? 0 : trend) >= 0 ? 
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" /> : 
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            }
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-medium">Trend</p>
          <p className="text-xs text-gray-500 leading-tight mt-1">
            {(() => {
              if (isNaN(trend) || Math.abs(trend) < 0.1) return 'Stable spending'
              
              const today = new Date()
              const isCurrentMonth = selectedMonth === today.getMonth() && selectedYear === today.getFullYear()
              const absValue = Math.abs(trend)
              
              // Dynamic descriptive text based on trend magnitude and context
              if (isCurrentMonth) {
                if (absValue < 5) return 'vs last week'
                if (absValue < 15) return trend > 0 ? 'spending up' : 'spending down'
                if (absValue < 30) return trend > 0 ? 'rising fast' : 'declining fast'
                return trend > 0 ? 'major increase' : 'major decrease'
              } else {
                // Historical month descriptions
                if (absValue < 10) return 'month-end pattern'
                if (absValue < 25) return trend > 0 ? 'escalated later' : 'front-loaded'
                return trend > 0 ? 'peaked late' : 'tapered off'
              }
            })()}
          </p>
        </div>
      </div>

      {/* Smart Insights */}
      {(() => {
        const monthlyBudget = budget?.monthlyLimit || 7000
        const today = new Date()
        const currentMonth = today.getMonth()
        const currentYear = today.getFullYear()
        const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear
        
        // Only show insights if there's spending data
        if (totalExpenses === 0) return null
        
        // Calculate insights
        let insightType = 'success' // success, warning, danger
        let insightTitle = ''
        let insightMessage = ''
        let actionItems = []
        
        if (isCurrentMonth) {
          const daysElapsed = today.getDate()
          const daysRemaining = chartData.length - daysElapsed
          const budgetRemaining = monthlyBudget - expensesForBudgetCalc
          const projectedMonthEnd = (totalExpenses / daysElapsed) * chartData.length
          
          if (budgetRemaining <= 0) {
            insightType = 'danger'
            insightTitle = '🚨 Budget Exceeded'
            insightMessage = `You've already spent ${getCurrencySymbol()}${Math.abs(budgetRemaining).toFixed(0)} over your monthly budget with ${daysRemaining} days remaining.`
            actionItems = [
              'Consider pausing non-essential purchases',
              'Review and reduce daily spending',
              'Look for ways to earn extra income'
            ]
          } else if (projectedMonthEnd > monthlyBudget * 1.1) {
            insightType = 'danger'
            insightTitle = '⚠️ Overspending Alert'
            insightMessage = `At current pace, you'll spend ${getCurrencySymbol()}${projectedMonthEnd.toFixed(0)} this month (${((projectedMonthEnd/monthlyBudget - 1) * 100).toFixed(0)}% over budget).`
            actionItems = [
              `Reduce daily spending to ${getCurrencySymbol()}${(budgetRemaining/daysRemaining).toFixed(0)}/day`,
              'Identify your biggest expense categories',
              'Set up spending alerts for large purchases'
            ]
          } else if (projectedMonthEnd > monthlyBudget * 0.9) {
            insightType = 'warning'
            insightTitle = '📊 Budget Watch'
            insightMessage = `You're on track to spend ${getCurrencySymbol()}${projectedMonthEnd.toFixed(0)} this month (${((projectedMonthEnd/monthlyBudget) * 100).toFixed(0)}% of budget).`
            actionItems = [
              'Monitor daily spending closely',
              'Consider building a buffer for unexpected expenses',
              'Track progress weekly'
            ]
          } else {
            insightType = 'success'
            insightTitle = '✅ On Track'
            insightMessage = `Great job! You're spending within budget. Projected: ${getCurrencySymbol()}${projectedMonthEnd.toFixed(0)} (${((projectedMonthEnd/monthlyBudget) * 100).toFixed(0)}% of budget).`
            actionItems = [
              'Consider saving the remaining budget',
              'Maintain current spending habits',
              'Plan for next month\'s goals'
            ]
          }
        } else {
          // Historical month analysis
          const budgetUsedPercentage = (totalExpenses / monthlyBudget) * 100
          if (budgetUsedPercentage > 110) {
            insightType = 'danger'
            insightTitle = '📈 Historical Overspending'
            insightMessage = `This month you spent ${budgetUsedPercentage.toFixed(0)}% of your budget (${getCurrencySymbol()}${(totalExpenses - monthlyBudget).toFixed(0)} over).`
          } else if (budgetUsedPercentage > 90) {
            insightType = 'warning'
            insightTitle = '📊 High Spending Month'
            insightMessage = `This month you used ${budgetUsedPercentage.toFixed(0)}% of your budget.`
          } else {
            insightType = 'success'
            insightTitle = '✅ Budget Success'
            insightMessage = `You stayed within budget this month, using ${budgetUsedPercentage.toFixed(0)}% (saved ${getCurrencySymbol()}${(monthlyBudget - totalExpenses).toFixed(0)}).`
          }
        }
        
        return (
          <div className={`rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border ${
            insightType === 'success' ? 'bg-green-500/10 border-green-500/30' :
            insightType === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
            'bg-red-500/10 border-red-500/30'
          }`}>
            <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">{insightTitle}</h4>
            <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed">{insightMessage}</p>
            {actionItems.length > 0 && (
              <div className="space-y-1">
                <p className="text-gray-400 text-xs font-medium">Recommendations:</p>
                <div className="space-y-0.5">
                  {actionItems.map((item, index) => (
                    <p key={index} className="text-gray-400 text-xs leading-relaxed">• {item}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Smart Budget Rebalancer */}
      <SmartBudgetRebalancer 
        totalExpenses={totalExpenses}
        monthlyBudget={budget?.monthlyLimit || 7000}
        currentDay={new Date().getDate()}
        daysInMonth={chartData.length}
      />

      {/* Chart */}
      <div className="h-64 sm:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ 
              top: 10, 
              right: 10, 
              left: 5, 
              bottom: 10
            }}
            className="mobile-chart"
          >
            <defs>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#2a2a2b" 
              horizontal={true}
              vertical={false}
            />
            
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              interval="preserveStartEnd"
              tickMargin={5}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              tickFormatter={(value) => `${getCurrencySymbol()}${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
              width={40}
              tickMargin={5}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Average line - only show if there's data */}
            {!hasNoData && (
              <ReferenceLine 
                y={avgDaily} 
                stroke="#FFA500" 
                strokeDasharray="5 5" 
                strokeOpacity={0.7}
                label={{ value: "Avg", position: "topRight", fill: "#FFA500", fontSize: 11 }}
              />
            )}
            
            {/* Cumulative Area - render first (behind) */}
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#4ECDC4"
              strokeWidth={1.5}
              fill="url(#cumulativeGradient)"
              fillOpacity={0.6}
            />
            
            {/* Daily Expenses Area - render second (in front) */}
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#FF6B6B"
              strokeWidth={2.5}
              fill="url(#expenseGradient)"
              fillOpacity={0.8}
              dot={hasNoData ? false : <CustomDot />}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* No Data Overlay */}
        {hasNoData && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1b]/80 backdrop-blur-sm rounded-lg">
            <div className="text-center p-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm sm:text-lg font-medium mb-1 sm:mb-2">
                No expense data for {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm leading-tight">
                {selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear() 
                  ? "Add expenses to see your spending trends"
                  : "No expenses recorded for this month"
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-to-r from-red-500 to-red-400 flex-shrink-0"></div>
          <span className="text-gray-300 text-xs sm:text-sm">Daily Expenses</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-to-r from-teal-500 to-teal-400 flex-shrink-0"></div>
          <span className="text-gray-300 text-xs sm:text-sm">Cumulative</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-0.5 sm:w-4 sm:h-0.5 bg-orange-500 rounded flex-shrink-0"></div>
          <span className="text-gray-300 text-xs sm:text-sm">Average</span>
        </div>
      </div>
    </div>
  )
}

export default ExpenseAreaChart
