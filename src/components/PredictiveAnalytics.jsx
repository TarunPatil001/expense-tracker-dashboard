import React, { useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Calendar,
  DollarSign,
  Activity,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react'

const generateRecommendations = (predicted, budget, risks, categories, getCurrencySymbol) => {
  const recommendations = []
  
  if (predicted > budget * 1.1) {
    recommendations.push({
      type: 'urgent',
      action: 'Immediate Cost Reduction',
      description: `Cut ${getCurrencySymbol()}${((predicted - budget) * 1.1).toFixed(0)} from your highest spending categories`,
      impact: 'high'
    })
  }
  
  if (categories.length > 0 && categories[0].variance > 0.3) {
    recommendations.push({
      type: 'optimize',
      action: 'Category Rebalancing',
      description: `Focus on controlling ${categories[0].category} spending - it's ${(categories[0].variance * 100).toFixed(0)}% above normal`,
      impact: 'medium'
    })
  }

  if (risks.some(r => r.level === 'high')) {
    recommendations.push({
      type: 'strategy',
      action: 'Emergency Budget Protocol',
      description: 'Activate 72-hour purchase delays and review all non-essential expenses',
      impact: 'high'
    })
  }

  return recommendations
}

const PredictiveAnalytics = () => {
  const { transactions = [], budget = {}, categories = [], preferences = {} } = useSelector(state => state.expenseManager || {})

  const getCurrencySymbol = useCallback(() => {
    switch (preferences?.currency) {
      case 'USD': return '$'
      case 'EUR': return '€' 
      case 'INR': return '₹'
      default: return '₹'
    }
  }, [preferences?.currency])

  // Advanced predictive analytics
  const predictions = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const currentDate = now.getDate()
    
    // Get last 3 months of data for trend analysis
    const last3Months = []
    for (let i = 0; i < 3; i++) {
      const month = currentMonth - i
      const year = month < 0 ? currentYear - 1 : currentYear
      const adjustedMonth = month < 0 ? month + 12 : month
      
      const monthExpenses = transactions.filter(t => {
        const date = new Date(t.date)
        return date.getMonth() === adjustedMonth && 
               date.getFullYear() === year && 
               t.type === 'expense'
      })
      
      last3Months.push({
        month: adjustedMonth,
        year,
        expenses: monthExpenses,
        total: monthExpenses.reduce((sum, t) => sum + t.amount, 0)
      })
    }

    const currentMonthExpenses = last3Months[0].expenses
    const totalSpent = last3Months[0].total
    const monthlyBudget = budget?.monthlyLimit || 7000

    // 1. End-of-Month Prediction using Linear Regression
    const dailySpending = currentMonthExpenses.reduce((acc, t) => {
      const day = new Date(t.date).getDate()
      acc[day] = (acc[day] || 0) + t.amount
      return acc
    }, {})

    const spendingDays = Object.keys(dailySpending).map(Number).sort((a, b) => a - b)
    if (spendingDays.length >= 5) {
      // Simple linear regression on daily cumulative spending
      const cumulativeSpending = []
      let cumSum = 0
      spendingDays.forEach(day => {
        cumSum += dailySpending[day]
        cumulativeSpending.push({ day, total: cumSum })
      })

      // Calculate trend
      const n = cumulativeSpending.length
      const sumX = cumulativeSpending.reduce((sum, d) => sum + d.day, 0)
      const sumY = cumulativeSpending.reduce((sum, d) => sum + d.total, 0)
      const sumXY = cumulativeSpending.reduce((sum, d) => sum + d.day * d.total, 0)
      const sumX2 = cumulativeSpending.reduce((sum, d) => sum + d.day * d.day, 0)

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
      const intercept = (sumY - slope * sumX) / n

      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      const predictedEndOfMonth = slope * daysInMonth + intercept
      const confidence = Math.max(0.6, Math.min(0.95, n / 15)) // Higher confidence with more data points

      // 2. Category-wise predictions
      const categoryPredictions = categories.map(category => {
        const categoryExpenses = currentMonthExpenses.filter(t => 
          t.category.toString() === category.id.toString()
        )
        const categoryTotal = categoryExpenses.reduce((sum, t) => sum + t.amount, 0)
        const categoryAvg = last3Months.reduce((sum, month) => {
          const monthCategoryTotal = month.expenses
            .filter(t => t.category.toString() === category.id.toString())
            .reduce((total, t) => total + t.amount, 0)
          return sum + monthCategoryTotal
        }, 0) / 3

        const projectedCategory = categoryTotal * (daysInMonth / currentDate)
        const variance = Math.abs(projectedCategory - categoryAvg) / Math.max(categoryAvg, 1)

        return {
          category: category.name,
          icon: category.icon,
          current: categoryTotal,
          projected: projectedCategory,
          average: categoryAvg,
          variance,
          trend: projectedCategory > categoryAvg ? 'up' : 'down'
        }
      }).filter(p => p.current > 0).sort((a, b) => b.projected - a.projected)

      // 3. Risk Assessment
      const riskFactors = []
      
      if (predictedEndOfMonth > monthlyBudget * 1.1) {
        riskFactors.push({
          level: 'high',
          factor: 'Budget Overshoot',
          impact: `Predicted to exceed budget by ${getCurrencySymbol()}${(predictedEndOfMonth - monthlyBudget).toFixed(0)}`,
          probability: confidence
        })
      }

      // Check for acceleration in spending
      const recentDaysSpending = spendingDays.slice(-5).reduce((sum, day) => sum + dailySpending[day], 0) / 5
      const earlyDaysSpending = spendingDays.slice(0, 5).reduce((sum, day) => sum + dailySpending[day], 0) / 5
      
      if (recentDaysSpending > earlyDaysSpending * 1.5) {
        riskFactors.push({
          level: 'medium',
          factor: 'Spending Acceleration',
          impact: `Recent daily spending ${((recentDaysSpending / earlyDaysSpending - 1) * 100).toFixed(0)}% higher than early month`,
          probability: 0.8
        })
      }

      // 4. Seasonal Trends (if enough historical data)
      const seasonalTrend = last3Months.length >= 3 ? 
        (last3Months[0].total - last3Months[2].total) / last3Months[2].total * 100 : 0

      // 5. Anomaly Detection
      const anomalies = []
      const avgDailySpend = totalSpent / currentDate
      
      Object.entries(dailySpending).forEach(([day, amount]) => {
        if (amount > avgDailySpend * 3) {
          anomalies.push({
            day: parseInt(day),
            amount,
            type: 'spike',
            severity: amount / avgDailySpend
          })
        }
      })

      return {
        endOfMonthPrediction: {
          amount: predictedEndOfMonth,
          confidence: confidence * 100,
          variance: Math.abs(predictedEndOfMonth - monthlyBudget),
          status: predictedEndOfMonth > monthlyBudget ? 'over' : 'under'
        },
        categoryPredictions: categoryPredictions.slice(0, 5),
        riskFactors,
        seasonalTrend,
        anomalies: anomalies.slice(0, 3),
        recommendations: generateRecommendations(predictedEndOfMonth, monthlyBudget, riskFactors, categoryPredictions, () => {
          switch (preferences?.currency) {
            case 'USD': return '$'
            case 'EUR': return '€' 
            case 'INR': return '₹'
            default: return '₹'
          }
        })
      }
    }

    return null
  }, [transactions, budget, categories, preferences?.currency, getCurrencySymbol])

  if (!predictions) {
    return (
      <div className="bg-[#1a1a1b] rounded-xl p-6 border border-gray-800">
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Building Predictions</h3>
          <p className="text-gray-400">Add more transactions to enable predictive analytics</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'over': return 'red'
      case 'under': return 'green'
      default: return 'gray'
    }
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'red'
      case 'medium': return 'yellow'
      case 'low': return 'green'
      default: return 'gray'
    }
  }

  return (
    <div className="bg-[#1a1a1b] rounded-xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Predictive Analytics</h3>
          <p className="text-gray-400 text-sm">AI-powered spending forecasts</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-emerald-400 text-xs font-medium">FORECASTING</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* End of Month Prediction */}
        <div className={`p-4 bg-${getStatusColor(predictions.endOfMonthPrediction.status)}-500/10 border border-${getStatusColor(predictions.endOfMonthPrediction.status)}-500/30 rounded-xl`}>
          <div className="flex items-center gap-3 mb-3">
            <Target className={`w-5 h-5 text-${getStatusColor(predictions.endOfMonthPrediction.status)}-400`} />
            <h4 className={`text-${getStatusColor(predictions.endOfMonthPrediction.status)}-400 font-medium`}>
              End-of-Month Prediction
            </h4>
            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
              {predictions.endOfMonthPrediction.confidence.toFixed(0)}% confidence
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-white">
              {getCurrencySymbol()}{predictions.endOfMonthPrediction.amount.toFixed(0)}
            </span>
            <span className={`text-${getStatusColor(predictions.endOfMonthPrediction.status)}-400 text-sm`}>
              {predictions.endOfMonthPrediction.status === 'over' ? 'over budget' : 'under budget'}
            </span>
          </div>
          <p className="text-gray-300 text-sm">
            Variance: {getCurrencySymbol()}{predictions.endOfMonthPrediction.variance.toFixed(0)} from budget
          </p>
        </div>

        {/* Category Predictions */}
        <div>
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-400" />
            Category Forecasts
          </h4>
          <div className="space-y-2">
            {predictions.categoryPredictions.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-white font-medium">{category.category}</span>
                  {category.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-red-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {getCurrencySymbol()}{category.projected.toFixed(0)}
                  </div>
                  <div className="text-gray-400 text-xs">
                    vs {getCurrencySymbol()}{category.average.toFixed(0)} avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Factors */}
        {predictions.riskFactors.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              Risk Assessment
            </h4>
            <div className="space-y-2">
              {predictions.riskFactors.map((risk, index) => (
                <div key={index} className={`p-3 bg-${getRiskColor(risk.level)}-500/10 border border-${getRiskColor(risk.level)}-500/30 rounded-lg`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-${getRiskColor(risk.level)}-400 font-medium text-sm`}>
                      {risk.factor}
                    </span>
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                      {(risk.probability * 100).toFixed(0)}% likely
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{risk.impact}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anomalies */}
        {predictions.anomalies.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Spending Anomalies
            </h4>
            <div className="space-y-2">
              {predictions.anomalies.map((anomaly, index) => (
                <div key={index} className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-orange-400 font-medium text-sm">
                      Day {anomaly.day} Spending Spike
                    </span>
                    <span className="text-white font-medium">
                      {getCurrencySymbol()}{anomaly.amount.toFixed(0)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs">
                    {anomaly.severity.toFixed(1)}x above daily average
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div>
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            AI Recommendations
          </h4>
          <div className="space-y-2">
            {predictions.recommendations.map((rec, index) => (
              <div key={index} className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-purple-400 font-medium text-sm">{rec.action}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.impact === 'high' ? 'bg-red-500/20 text-red-400' : 
                    rec.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {rec.impact} impact
                  </span>
                </div>
                <p className="text-gray-300 text-sm">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PredictiveAnalytics
