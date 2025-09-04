import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  PiggyBank,
  Zap,
  Award,
  Clock,
  MapPin,
  ChevronRight
} from 'lucide-react'

const SmartInsightsEngine = () => {
  const { transactions = [], budget = {}, categories = [], preferences = {} } = useSelector(state => state.expenseManager || {})
  const [selectedInsight, setSelectedInsight] = useState(null)

  // Advanced insights using statistical analysis
  const smartInsights = useMemo(() => {
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
    
    // Get comprehensive data
    const monthlyExpenses = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear && 
             t.type === 'expense'
    })

    const insights = []

    // 1. Spending Velocity Analysis
    const last7Days = transactions.filter(t => {
      const daysDiff = (now - new Date(t.date)) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7 && t.type === 'expense'
    })
    
    const last30Days = transactions.filter(t => {
      const daysDiff = (now - new Date(t.date)) / (1000 * 60 * 60 * 24)
      return daysDiff <= 30 && t.type === 'expense'
    })

    const weeklySpend = last7Days.reduce((sum, t) => sum + t.amount, 0)
    const monthlySpend = last30Days.reduce((sum, t) => sum + t.amount, 0)
    const velocityChange = weeklySpend > 0 ? ((weeklySpend * 4) - monthlySpend) / monthlySpend * 100 : 0

    if (Math.abs(velocityChange) > 20) {
      insights.push({
        type: velocityChange > 0 ? 'warning' : 'success',
        category: 'Spending Velocity',
        title: velocityChange > 0 ? 'Accelerating Spending Detected' : 'Spending Deceleration',
        insight: `Your spending velocity has ${velocityChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(velocityChange).toFixed(1)}% compared to your monthly average.`,
        impact: velocityChange > 0 ? 'high' : 'positive',
        actionable: true,
        recommendation: velocityChange > 0 
          ? 'Consider implementing daily spending limits to control velocity'
          : 'Great! Your controlled spending is creating savings opportunities',
        confidence: 0.85,
        icon: TrendingUp
      })
    }

    // 2. Category Anomaly Detection
    const categorySpending = monthlyExpenses.reduce((acc, t) => {
      const categoryId = t.category
      const category = categories.find(c => c.id.toString() === categoryId.toString())
      const categoryName = category?.name || 'Other'
      acc[categoryName] = (acc[categoryName] || 0) + t.amount
      return acc
    }, {})

    const totalSpent = monthlyExpenses.reduce((sum, t) => sum + t.amount, 0)
    Object.entries(categorySpending).forEach(([categoryName, amount]) => {
      const percentage = (amount / totalSpent) * 100
      if (percentage > 40) {
        insights.push({
          type: 'warning',
          category: 'Category Analysis',
          title: `${categoryName} Dominance Alert`,
          insight: `${categoryName} represents ${percentage.toFixed(1)}% of your spending, indicating potential over-concentration.`,
          impact: 'medium',
          actionable: true,
          recommendation: `Diversify spending or create sub-budgets for ${categoryName} to improve balance`,
          confidence: 0.9,
          icon: Target
        })
      }
    })

    // 3. Smart Timing Patterns
    const hourlySpending = monthlyExpenses.reduce((acc, t) => {
      const hour = new Date(t.date).getHours()
      acc[hour] = (acc[hour] || 0) + t.amount
      return acc
    }, {})

    const peakHour = Object.entries(hourlySpending).sort(([,a], [,b]) => b - a)[0]
    if (peakHour && hourlySpending[peakHour[0]] > totalSpent * 0.3) {
      const hour = parseInt(peakHour[0])
      const timeLabel = hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`
      
      insights.push({
        type: 'info',
        category: 'Behavioral Pattern',
        title: 'Peak Spending Time Identified',
        insight: `You spend ${((hourlySpending[peakHour[0]] / totalSpent) * 100).toFixed(1)}% of your money around ${timeLabel}.`,
        impact: 'low',
        actionable: true,
        recommendation: `Set spending alerts or use a waiting period before purchases during ${timeLabel}`,
        confidence: 0.75,
        icon: Clock
      })
    }

    // 4. Micro-Transaction Analysis
    const smallTransactions = monthlyExpenses.filter(t => t.amount < 50)
    const smallTransactionTotal = smallTransactions.reduce((sum, t) => sum + t.amount, 0)
    
    if (smallTransactions.length > 15 && smallTransactionTotal > totalSpent * 0.25) {
      insights.push({
        type: 'warning',
        category: 'Micro-Spending',
        title: 'Death by a Thousand Cuts',
        insight: `${smallTransactions.length} small purchases (under ${getCurrencySymbol()}50) add up to ${((smallTransactionTotal / totalSpent) * 100).toFixed(1)}% of your spending.`,
        impact: 'medium',
        actionable: true,
        recommendation: 'Consolidate small purchases or use a weekly allowance system for micro-spending',
        confidence: 0.88,
        icon: Zap
      })
    }

    // 5. Weekend vs Weekday Analysis
    const weekendSpending = monthlyExpenses.filter(t => {
      const day = new Date(t.date).getDay()
      return day === 0 || day === 6
    }).reduce((sum, t) => sum + t.amount, 0)

    const weekendRatio = weekendSpending / totalSpent

    if (weekendRatio > 0.5) {
      insights.push({
        type: 'info',
        category: 'Lifestyle Pattern',
        title: 'Weekend Spending Dominance',
        insight: `${(weekendRatio * 100).toFixed(1)}% of your spending happens on weekends.`,
        impact: 'low',
        actionable: true,
        recommendation: 'Plan weekend budgets in advance and consider weekday entertainment alternatives',
        confidence: 0.8,
        icon: Calendar
      })
    }

    // 6. Budget Efficiency Score
    const monthlyBudget = budget?.monthlyLimit || 7000
    const remaining = monthlyBudget - totalSpent
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const currentDate = now.getDate()
    const daysRemaining = daysInMonth - currentDate
    
    const efficiency = daysRemaining > 0 ? (remaining / daysRemaining) / (monthlyBudget / daysInMonth) : 0
    
    if (efficiency > 1.5) {
      insights.push({
        type: 'success',
        category: 'Budget Optimization',
        title: 'Budget Surplus Opportunity',
        insight: `You're ${(efficiency * 100).toFixed(0)}% ahead of your budget pace with ${getCurrencySymbol()}${remaining.toFixed(0)} remaining.`,
        impact: 'positive',
        actionable: true,
        recommendation: 'Consider increasing savings, investments, or planned purchases',
        confidence: 0.92,
        icon: PiggyBank
      })
    } else if (efficiency < 0.5) {
      insights.push({
        type: 'error',
        category: 'Budget Risk',
        title: 'Budget Overspend Risk',
        insight: `You're spending ${(2 - efficiency * 2).toFixed(1)}x faster than your budget allows.`,
        impact: 'high',
        actionable: true,
        recommendation: 'Implement emergency spending freeze and review essential vs non-essential expenses',
        confidence: 0.95,
        icon: AlertTriangle
      })
    }

    // 7. Payment Method Intelligence
    const paymentMethods = monthlyExpenses.reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount
      return acc
    }, {})

    const cashSpending = paymentMethods['Cash'] || 0
    if (cashSpending > totalSpent * 0.4) {
      insights.push({
        type: 'info',
        category: 'Payment Optimization',
        title: 'High Cash Usage Detected',
        insight: `${((cashSpending / totalSpent) * 100).toFixed(1)}% of spending is in cash, limiting tracking accuracy.`,
        impact: 'medium',
        actionable: true,
        recommendation: 'Switch to digital payments for better tracking, rewards, and expense categorization',
        confidence: 0.7,
        icon: Award
      })
    }

    // Sort insights by impact and confidence
    return insights.sort((a, b) => {
      const impactScore = { high: 3, medium: 2, low: 1, positive: 0 }
      return (impactScore[b.impact] * b.confidence) - (impactScore[a.impact] * a.confidence)
    })

  }, [transactions, budget, categories, preferences])

  const getInsightColor = (type) => {
    switch (type) {
      case 'success': return 'green'
      case 'warning': return 'yellow'
      case 'error': return 'red'
      case 'info': return 'blue'
      default: return 'gray'
    }
  }

  const getImpactBadge = (impact) => {
    const styles = {
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      positive: 'bg-green-500/20 text-green-400 border-green-500/30'
    }
    return styles[impact] || styles.low
  }

  return (
    <div className="bg-[#1a1a1b] rounded-xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-base sm:text-lg">Smart Insights Engine</h3>
          <p className="text-gray-400 text-sm">Advanced behavioral analysis & predictions</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs font-medium">ANALYZING</span>
        </div>
      </div>

      {smartInsights.length === 0 ? (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-white font-medium mb-2">Gathering Intelligence</h4>
          <p className="text-gray-400 text-sm">Add more transactions for data-driven insights</p>
        </div>
      ) : (
        <div className="space-y-4">
          {smartInsights.slice(0, 5).map((insight, index) => {
            const Icon = insight.icon
            const color = getInsightColor(insight.type)
            
            return (
              <div 
                key={index}
                className={`p-4 bg-${color}-500/10 border border-${color}-500/30 rounded-xl cursor-pointer hover:bg-${color}-500/20 transition-all duration-200`}
                onClick={() => setSelectedInsight(selectedInsight === index ? null : index)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 bg-${color}-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1`}>
                    <Icon className={`w-4 h-4 text-${color}-400`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`text-${color}-400 font-medium`}>{insight.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getImpactBadge(insight.impact)}`}>
                        {insight.impact.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{insight.insight}</p>
                    
                    {selectedInsight === index && (
                      <div className={`mt-3 p-3 bg-${color}-500/10 rounded-lg border border-${color}-500/20`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className={`w-4 h-4 text-${color}-400`} />
                          <span className={`text-${color}-300 font-medium text-sm`}>Smart Recommendation</span>
                        </div>
                        <p className="text-gray-300 text-sm">{insight.recommendation}</p>
                      </div>
                    )}
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${selectedInsight === index ? 'rotate-90' : ''}`} />
                </div>
              </div>
            )
          })}
          
          {smartInsights.length > 5 && (
            <div className="text-center pt-4">
              <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                View {smartInsights.length - 5} more insights →
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-white font-medium text-sm">Analytics Progress</span>
        </div>
        <p className="text-gray-300 text-sm">
          The system has analyzed {transactions.length} transactions across {categories.length} categories. 
          Insight accuracy improves with more data and user behavior patterns.
        </p>
      </div>
    </div>
  )
}

export default SmartInsightsEngine
