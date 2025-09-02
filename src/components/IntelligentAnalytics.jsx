import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, DollarSign, PieChart, BarChart3 } from 'lucide-react'

const IntelligentAnalytics = () => {
  const { transactions = [], budget = {}, categories = [], preferences = {} } = useSelector(state => state.expenseManager || {})
  
  const getCurrencySymbol = () => {
    switch (preferences?.currency) {
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'INR': return '₹'
      default: return '₹'
    }
  }

  // Calculate spending consistency (0-100)
  const calculateSpendingConsistency = (expenses) => {
    if (expenses.length < 7) return 0
    
    const dailyAmounts = expenses.reduce((acc, t) => {
      const day = new Date(t.date).getDate()
      acc[day] = (acc[day] || 0) + t.amount
      return acc
    }, {})
    
    const amounts = Object.values(dailyAmounts)
    const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
    const variance = amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length
    const standardDeviation = Math.sqrt(variance)
    
    // Lower standard deviation = higher consistency
    const maxStdDev = mean // If std dev equals mean, consistency is 0
    const consistency = Math.max(0, Math.min(100, 100 - (standardDeviation / maxStdDev) * 100))
    
    return Math.round(consistency)
  }

  // Risk level calculation
  const calculateRiskLevel = (utilization, projected, budget) => {
    if (projected > budget * 1.2) return { level: 'High', color: 'red', message: 'Severe overspending risk' }
    if (projected > budget * 1.1) return { level: 'Medium', color: 'orange', message: 'Moderate overspending risk' }
    if (utilization > 90) return { level: 'Medium', color: 'yellow', message: 'High budget utilization' }
    return { level: 'Low', color: 'green', message: 'Healthy spending pattern' }
  }

  // Advanced analytics calculations
  const analytics = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const currentDate = now.getDate()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    
    // Filter current month expenses
    const currentMonthExpenses = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear && 
             t.type === 'expense'
    })
    
    // Filter previous month for comparison
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    const prevMonthExpenses = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === prevMonth && 
             date.getFullYear() === prevYear && 
             t.type === 'expense'
    })

    // Filter current month income transactions
    const currentMonthIncome = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear && 
             t.type === 'income'
    })
    
    // Calculate total income for current month
    const totalIncome = currentMonthIncome.reduce((sum, t) => sum + t.amount, 0)
    
    // Basic totals
    const totalSpent = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0)
    const prevMonthTotal = prevMonthExpenses.reduce((sum, t) => sum + t.amount, 0)
    const monthlyBudget = budget?.monthlyLimit || 7000
    const remaining = monthlyBudget - totalSpent
    const daysRemaining = daysInMonth - currentDate
    
    // Spending velocity and projections
    const dailyAverage = currentDate > 0 ? totalSpent / currentDate : 0
    const projectedMonthEnd = dailyAverage * daysInMonth
    const recommendedDailySpend = daysRemaining > 0 ? remaining / daysRemaining : 0
    
    // Month-over-month comparison
    const monthlyGrowth = prevMonthTotal > 0 ? ((totalSpent - prevMonthTotal) / prevMonthTotal) * 100 : 0
    
    // Category analysis
    const categorySpending = currentMonthExpenses.reduce((acc, t) => {
      const categoryId = t.category
      const category = categories.find(c => c.id.toString() === categoryId.toString())
      const categoryName = category?.name || 'Other'
      
      if (!acc[categoryName]) {
        acc[categoryName] = { amount: 0, count: 0, icon: category?.icon || '📦' }
      }
      acc[categoryName].amount += t.amount
      acc[categoryName].count += 1
      return acc
    }, {})
    
    const topCategories = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b.amount - a.amount)
      .slice(0, 5)
    
    // Spending patterns
    const weekdaySpending = currentMonthExpenses.reduce((acc, t) => {
      const dayOfWeek = new Date(t.date).getDay()
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]
      acc[dayName] = (acc[dayName] || 0) + t.amount
      return acc
    }, {})
    
    // Payment method analysis
    const paymentMethods = currentMonthExpenses.reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount
      return acc
    }, {})
    
    // Financial health scores
    const budgetUtilization = (totalSpent / monthlyBudget) * 100
    
    // Proper savings rate calculation: (Income - Expenses) / Income * 100
    const savingsRate = (() => {
      if (totalIncome <= 0) {
        // Fallback to budget-based calculation if no income data
        return Math.max(0, ((monthlyBudget - projectedMonthEnd) / monthlyBudget) * 100)
      }
      const savings = totalIncome - totalSpent
      const rate = (savings / totalIncome) * 100
      return isNaN(rate) ? 0 : Math.max(rate, 0) // Ensure non-negative
    })()
    
    const spendingConsistency = calculateSpendingConsistency(currentMonthExpenses)
    
    // Risk assessment
    const riskLevel = calculateRiskLevel(budgetUtilization, projectedMonthEnd, monthlyBudget)
    
    return {
      totalSpent,
      monthlyBudget,
      remaining,
      dailyAverage,
      projectedMonthEnd,
      recommendedDailySpend,
      monthlyGrowth,
      topCategories,
      weekdaySpending,
      paymentMethods,
      budgetUtilization,
      savingsRate,
      spendingConsistency,
      riskLevel,
      daysRemaining,
      currentDate,
      daysInMonth
    }
  }, [transactions, budget, categories])

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Spending */}
        <div className="bg-[#1a1a1b] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              analytics.remaining >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {analytics.remaining >= 0 ? 'Under Budget' : 'Over Budget'}
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {getCurrencySymbol()}{analytics.totalSpent.toFixed(0)}
          </div>
          <div className="text-gray-400 text-sm">
            of {getCurrencySymbol()}{analytics.monthlyBudget} budget
          </div>
          <div className="mt-2 bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${analytics.budgetUtilization > 100 ? 'bg-red-500' : analytics.budgetUtilization > 80 ? 'bg-orange-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(100, analytics.budgetUtilization)}%` }}
            />
          </div>
        </div>

        {/* Daily Average */}
        <div className="bg-[#1a1a1b] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              analytics.dailyAverage <= analytics.recommendedDailySpend ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
            }`}>
              {analytics.dailyAverage <= analytics.recommendedDailySpend ? 'On Track' : 'High'}
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {getCurrencySymbol()}{analytics.dailyAverage.toFixed(0)}
          </div>
          <div className="text-gray-400 text-sm">
            daily average spending
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Recommended: {getCurrencySymbol()}{analytics.recommendedDailySpend.toFixed(0)}/day
          </div>
        </div>

        {/* Projected Month End */}
        <div className="bg-[#1a1a1b] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              analytics.projectedMonthEnd <= analytics.monthlyBudget ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              Projection
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {getCurrencySymbol()}{analytics.projectedMonthEnd.toFixed(0)}
          </div>
          <div className="text-gray-400 text-sm">
            projected month-end total
          </div>
          <div className={`text-xs mt-1 ${analytics.projectedMonthEnd > analytics.monthlyBudget ? 'text-red-400' : 'text-green-400'}`}>
            {analytics.projectedMonthEnd > analytics.monthlyBudget ? 
              `${getCurrencySymbol()}${(analytics.projectedMonthEnd - analytics.monthlyBudget).toFixed(0)} over budget` :
              `${getCurrencySymbol()}${(analytics.monthlyBudget - analytics.projectedMonthEnd).toFixed(0)} under budget`
            }
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-[#1a1a1b] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className={`w-8 h-8 bg-${analytics.riskLevel.color}-500/20 rounded-lg flex items-center justify-center`}>
              <AlertTriangle className={`w-4 h-4 text-${analytics.riskLevel.color}-400`} />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full bg-${analytics.riskLevel.color}-500/20 text-${analytics.riskLevel.color}-400`}>
              {analytics.riskLevel.level} Risk
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {analytics.spendingConsistency.toFixed(0)}%
          </div>
          <div className="text-gray-400 text-sm">
            spending consistency
          </div>
          <div className={`text-xs mt-1 text-${analytics.riskLevel.color}-400`}>
            {analytics.riskLevel.message}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-[#1a1a1b] rounded-xl p-6 border border-gray-800">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-400" />
            Top Spending Categories
          </h3>
          <div className="space-y-3">
            {analytics.topCategories.map(([category, data]) => {
              const percentage = (data.amount / analytics.totalSpent) * 100
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{data.icon}</span>
                    <div>
                      <div className="text-white font-medium">{category}</div>
                      <div className="text-gray-400 text-sm">{data.count} transactions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {getCurrencySymbol()}{data.amount.toFixed(0)}
                    </div>
                    <div className="text-gray-400 text-sm">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Spending Insights */}
        <div className="bg-[#1a1a1b] rounded-xl p-6 border border-gray-800">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            Smart Insights
          </h3>
          <div className="space-y-4">
            {/* Budget Status */}
            <div className="p-3 bg-[#0f0f10] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">Budget Status</span>
              </div>
              <p className="text-gray-300 text-sm">
                You've spent {analytics.budgetUtilization.toFixed(1)}% of your monthly budget with {analytics.daysRemaining} days remaining.
                {analytics.remaining > 0 ? 
                  ` You have ${getCurrencySymbol()}${analytics.remaining.toFixed(0)} left for the month.` :
                  ` You're ${getCurrencySymbol()}${Math.abs(analytics.remaining).toFixed(0)} over budget.`
                }
              </p>
            </div>

            {/* Growth Trend */}
            <div className="p-3 bg-[#0f0f10] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-white font-medium">Monthly Trend</span>
              </div>
              <p className="text-gray-300 text-sm">
                {analytics.monthlyGrowth > 0 ? 
                  `Your spending increased by ${analytics.monthlyGrowth.toFixed(1)}% compared to last month.` :
                  `Your spending decreased by ${Math.abs(analytics.monthlyGrowth).toFixed(1)}% compared to last month.`
                }
              </p>
            </div>

            {/* Recommendations */}
            <div className="p-3 bg-[#0f0f10] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-white font-medium">Recommendation</span>
              </div>
              <p className="text-gray-300 text-sm">
                {analytics.projectedMonthEnd > analytics.monthlyBudget ?
                  `To stay within budget, limit daily spending to ${getCurrencySymbol()}${analytics.recommendedDailySpend.toFixed(0)} for the remaining ${analytics.daysRemaining} days.` :
                  `You're on track! Continue with your current spending pattern to save ${getCurrencySymbol()}${(analytics.monthlyBudget - analytics.projectedMonthEnd).toFixed(0)} this month.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntelligentAnalytics
