import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Brain, TrendingUp, Target, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'

const SmartBudgetAdvisor = () => {
  const { transactions = [], budget = {}, categories = [], preferences = {} } = useSelector(state => state.expenseManager || {})
  
  // Generate intelligent advice based on spending patterns
  const advice = useMemo(() => {
    const getCurrencySymbol = () => {
      switch (preferences?.currency) {
        case 'USD': return '$'
        case 'EUR': return '€' 
        case 'INR': return '₹'
        default: return '₹'
      }
    }
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const currentDate = now.getDate()
    
    // Current month data
    const currentMonthExpenses = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear && 
             t.type === 'expense'
    })
    
    const totalSpent = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0)
    const monthlyBudget = budget?.monthlyLimit || 7000
    const remaining = monthlyBudget - totalSpent
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysRemaining = daysInMonth - currentDate
    const dailyAverage = currentDate > 0 ? totalSpent / currentDate : 0
    const projectedEnd = dailyAverage * daysInMonth
    
    // Category analysis
    const categorySpending = currentMonthExpenses.reduce((acc, t) => {
      const categoryId = t.category
      const category = categories.find(c => c.id.toString() === categoryId.toString())
      const categoryName = category?.name || 'Other'
      acc[categoryName] = (acc[categoryName] || 0) + t.amount
      return acc
    }, {})
    
    // Generate advice array
    const adviceList = []
    
    // Budget status advice
    if (remaining < 0) {
      adviceList.push({
        type: 'error',
        icon: AlertCircle,
        title: 'Budget Exceeded',
        message: `You're ${getCurrencySymbol()}${Math.abs(remaining).toFixed(0)} over budget. Consider emergency cost-cutting measures.`,
        action: 'Review and cut non-essential expenses immediately'
      })
    } else if (projectedEnd > monthlyBudget * 1.1) {
      adviceList.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Overspending Risk',
        message: `At current pace, you'll exceed budget by ${getCurrencySymbol()}${(projectedEnd - monthlyBudget).toFixed(0)}.`,
        action: `Reduce daily spending to ${getCurrencySymbol()}${(remaining / daysRemaining).toFixed(0)}/day`
      })
    } else if (projectedEnd < monthlyBudget * 0.8) {
      adviceList.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Excellent Budget Control',
        message: `You're projected to save ${getCurrencySymbol()}${(monthlyBudget - projectedEnd).toFixed(0)} this month!`,
        action: 'Consider increasing your savings or investment contributions'
      })
    }
    
    // Category-specific advice
    const highestCategory = Object.entries(categorySpending).sort(([,a], [,b]) => b - a)[0]
    if (highestCategory && highestCategory[1] > monthlyBudget * 0.4) {
      adviceList.push({
        type: 'info',
        icon: TrendingUp,
        title: `High ${highestCategory[0]} Spending`,
        message: `${highestCategory[0]} accounts for ${((highestCategory[1]/totalSpent)*100).toFixed(0)}% of your spending.`,
        action: `Look for ways to optimize ${highestCategory[0]} expenses`
      })
    }
    
    // Spending pattern advice
    const weekendSpending = currentMonthExpenses.filter(t => {
      const day = new Date(t.date).getDay()
      return day === 0 || day === 6 // Sunday or Saturday
    }).reduce((sum, t) => sum + t.amount, 0)
    
    const weekdaySpending = totalSpent - weekendSpending
    
    if (weekendSpending > weekdaySpending && weekendSpending > 0) {
      adviceList.push({
        type: 'info',
        icon: Brain,
        title: 'Weekend Spending Pattern',
        message: 'You spend more on weekends than weekdays.',
        action: 'Plan weekend activities with a fixed budget to control costs'
      })
    }
    
    // Payment method optimization
    const cashSpending = currentMonthExpenses
      .filter(t => t.paymentMethod === 'Cash')
      .reduce((sum, t) => sum + t.amount, 0)
    
    if (cashSpending > totalSpent * 0.3) {
      adviceList.push({
        type: 'info',
        icon: Target,
        title: 'Consider Digital Payments',
        message: 'You use cash for many transactions.',
        action: 'Switch to digital payments for better tracking and rewards'
      })
    }
    
    // Frequency advice
    const dailyTransactionCounts = currentMonthExpenses.reduce((acc, t) => {
      const day = new Date(t.date).getDate()
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {})
    
    const avgTransactionsPerDay = Object.values(dailyTransactionCounts).reduce((sum, count) => sum + count, 0) / Object.keys(dailyTransactionCounts).length
    
    if (avgTransactionsPerDay > 5) {
      adviceList.push({
        type: 'warning',
        icon: Lightbulb,
        title: 'Frequent Small Purchases',
        message: `You make ${avgTransactionsPerDay.toFixed(1)} transactions per day on average.`,
        action: 'Consolidate purchases to avoid impulse spending'
      })
    }
    
    // Recent trend advice
    const recentWeek = currentMonthExpenses.filter(t => {
      const daysDiff = (now - new Date(t.date)) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7
    })
    
    const recentWeekSpending = recentWeek.reduce((sum, t) => sum + t.amount, 0)
    const recentDailyAvg = recentWeekSpending / 7
    
    if (recentDailyAvg > dailyAverage * 1.5) {
      adviceList.push({
        type: 'warning',
        icon: TrendingUp,
        title: 'Recent Spending Spike',
        message: 'Your spending has increased significantly in the past week.',
        action: 'Review recent purchases and identify any unusual expenses'
      })
    }
    
    return adviceList
  }, [transactions, budget, categories, preferences])

  if (advice.length === 0) {
    return (
      <div className="bg-[#1a1a1b] rounded-xl p-6 border border-gray-800">
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Smart Advisor</h3>
          <p className="text-gray-400">Add more expenses to get personalized advice</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1a1a1b] rounded-xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Smart Budget Advisor</h3>
          <p className="text-gray-400 text-sm">Personalized insights based on your spending</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {advice.map((item, index) => {
          const Icon = item.icon
          const typeColors = {
            success: 'green',
            warning: 'yellow', 
            error: 'red',
            info: 'blue'
          }
          const color = typeColors[item.type]
          
          return (
            <div key={index} className={`p-4 bg-${color}-500/10 border border-${color}-500/30 rounded-xl`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 bg-${color}-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1`}>
                  <Icon className={`w-4 h-4 text-${color}-400`} />
                </div>
                <div className="flex-1">
                  <h4 className={`text-${color}-400 font-medium mb-1`}>{item.title}</h4>
                  <p className="text-gray-300 text-sm mb-2">{item.message}</p>
                  <div className={`text-${color}-300 text-xs bg-${color}-500/10 px-3 py-2 rounded-lg border border-${color}-500/20`}>
                    💡 <strong>Action:</strong> {item.action}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span className="text-white font-medium text-sm">Pro Tip</span>
        </div>
        <p className="text-gray-300 text-sm">
          The more you use the app, the better our analytics become at providing personalized advice. 
          Keep tracking your expenses for increasingly accurate insights!
        </p>
      </div>
    </div>
  )
}

export default SmartBudgetAdvisor
