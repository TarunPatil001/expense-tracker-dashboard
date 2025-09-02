import React from 'react'
import { useSelector } from 'react-redux'
import { Wallet, TrendingUp, Target, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const DashboardOverview = () => {
  const { 
    preferences = {}, 
    analytics = {}, 
    budget = {},
    transactions = []
  } = useSelector(state => state.expenseManager || {})
  const { currentMonth = {} } = analytics

  // Debug: Log the analytics data to see what's happening
  console.log('DashboardOverview Debug:', {
    analytics,
    currentMonth,
    transactions: transactions.length,
    monthlyIncome: currentMonth.totalIncome,
    monthlyExpenses: currentMonth.totalExpenses
  })

  // Calculate previous month data for trend comparison
  const previousMonth = (() => {
    const now = new Date()
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getFullYear() === prevMonth.getFullYear() && 
             transactionDate.getMonth() === prevMonth.getMonth()
    })
    
    const totalIncome = prevMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = prevMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses }
  })()

  // Calculate trend percentages
  const calculateTrend = (current, previous) => {
    if (previous === 0) return current > 0 ? '100.0' : '0.0'
    if (current === 0 && previous === 0) return '0.0'
    const change = ((current - previous) / Math.abs(previous)) * 100
    return isNaN(change) ? '0.0' : Math.abs(change).toFixed(1)
  }

  const balanceTrend = calculateTrend(
    currentMonth.totalIncome - currentMonth.totalExpenses,
    previousMonth.balance
  )
  const incomeTrend = calculateTrend(currentMonth.totalIncome || 0, previousMonth.totalIncome)
  const expenseTrend = calculateTrend(currentMonth.totalExpenses || 0, previousMonth.totalExpenses)

  const balanceIsPositive = (currentMonth.totalIncome - currentMonth.totalExpenses) >= previousMonth.balance
  const incomeIsPositive = (currentMonth.totalIncome || 0) >= previousMonth.totalIncome
  const expenseIsPositive = (currentMonth.totalExpenses || 0) <= previousMonth.totalExpenses // Lower expenses = positive

  const savingsRate = (() => {
    const income = currentMonth.totalIncome || 0
    const expenses = currentMonth.totalExpenses || 0
    if (income <= 0) return 0
    const savings = income - expenses
    const rate = (savings / income) * 100
    return isNaN(rate) ? 0 : Math.max(rate, 0) // Ensure non-negative
  })()

  // Calculate actual savings amount (same as balance)
  const totalSavings = (currentMonth.totalIncome || 0) - (currentMonth.totalExpenses || 0)

  const budgetUsed = (() => {
    const monthlyLimit = budget?.monthlyLimit || 0
    const totalExpenses = currentMonth.totalExpenses || 0
    if (monthlyLimit <= 0) return 0
    const used = (totalExpenses / monthlyLimit) * 100
    return isNaN(used) ? 0 : Math.min(used, 100)
  })()

  const currencySymbol = preferences?.currency === 'INR' ? '₹' : preferences?.currency === 'USD' ? '$' : preferences?.currency === 'EUR' ? '€' : '₹'

  const cards = [
    {
      title: "Total Balance",
      value: currentMonth.totalIncome - currentMonth.totalExpenses,
      icon: Wallet,
      color: "from-blue-500 to-cyan-500",
      trend: `${balanceIsPositive ? '+' : '-'}${balanceTrend}%`,
      isPositive: balanceIsPositive
    },
    {
      title: "Monthly Income",
      value: currentMonth.totalIncome,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      trend: `${incomeIsPositive ? '+' : '-'}${incomeTrend}%`, 
      isPositive: incomeIsPositive
    },
    {
      title: "Total Expenses",
      value: currentMonth.totalExpenses,
      icon: ArrowDownRight,
      color: "from-red-500 to-pink-500",
      trend: `${expenseIsPositive ? '-' : '+'}${expenseTrend}%`,
      isPositive: expenseIsPositive
    },
    {
      title: "Savings",
      value: totalSavings,
      icon: PiggyBank,
      color: "from-purple-500 to-indigo-500",
      trend: `${isNaN(savingsRate) ? '0.0' : savingsRate.toFixed(1)}%`,
      isPositive: totalSavings >= 0
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#1a1a1b] to-[#2a2a2b] rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back, {preferences.name || 'User'}! 👋
            </h2>
            <p className="text-gray-400">
              Here's your financial overview for {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Budget Usage</div>
              <div className="text-2xl font-bold text-white">
                {budgetUsed.toFixed(1)}%
              </div>
              <div className="w-32 bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <div 
              key={index}
              className="bg-[#1a1a1b] rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  card.isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {card.isPositive ? 
                    <ArrowUpRight className="w-4 h-4" /> : 
                    <ArrowDownRight className="w-4 h-4" />
                  }
                  {card.trend}
                </div>
              </div>
              
              <div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {currencySymbol}{isNaN(card.value) ? '0' : Math.abs(card.value).toLocaleString()}
                </h3>
                <p className="text-gray-400 text-sm">{card.title}</p>
              </div>

              {/* Progress bar for specific cards */}
              {(card.title === "Total Expenses" && (budget?.monthlyLimit || 0) > 0) && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Budget Progress</span>
                    <span>{budgetUsed.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 70 ? 'bg-yellow-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
                      }`}
                      style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Insights */}
      <div className="bg-[#1a1a1b] rounded-2xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0f0f10] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Savings Rate</p>
                <p className="text-green-400 text-2xl font-bold">
                  {isNaN(savingsRate) ? '0.0' : savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f0f10] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Daily Average</p>
                <p className="text-blue-400 text-2xl font-bold">
                  {currencySymbol}{(() => {
                    const currentDay = new Date().getDate()
                    const totalExpenses = currentMonth.totalExpenses || 0
                    if (currentDay === 0) return '0'
                    const dailyAvg = totalExpenses / currentDay
                    return isNaN(dailyAvg) ? '0' : dailyAvg.toFixed(0)
                  })()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f0f10] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-white font-medium">Remaining Budget</p>
                <p className="text-orange-400 text-2xl font-bold">
                  {currencySymbol}{Math.max(0, (budget?.monthlyLimit || 0) - (currentMonth?.totalExpenses || 0)).toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
