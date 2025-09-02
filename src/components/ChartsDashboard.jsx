import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react'

const ChartsDashboard = () => {
  const { transactions = [], categories = [], preferences = {}, budget = {} } = useSelector(state => state.expenseManager || {})
  
  // Calculate chart data
  const chartData = useMemo(() => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    // Filter current month expenses
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })

    // Daily expenses for area chart
    const dailyExpenses = {}
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    
    // Initialize all days with 0
    for (let i = 1; i <= daysInMonth; i++) {
      dailyExpenses[i] = 0
    }
    
    // Fill with actual expenses
    currentMonthExpenses.forEach(expense => {
      const day = new Date(expense.date).getDate()
      dailyExpenses[day] += expense.amount
    })

    const areaChartData = Object.entries(dailyExpenses).map(([day, amount]) => ({
      day: parseInt(day),
      amount,
      cumulative: Object.entries(dailyExpenses)
        .slice(0, parseInt(day))
        .reduce((sum, [, amt]) => sum + amt, 0)
    }))

    // Category-wise expenses for pie chart
    const categoryExpenses = {}
    currentMonthExpenses.forEach(expense => {
      const category = categories.find(cat => cat.id === expense.categoryId)
      if (category) {
        categoryExpenses[category.name] = (categoryExpenses[category.name] || 0) + expense.amount
      }
    })

    const pieChartData = Object.entries(categoryExpenses).map(([name, value]) => {
      const category = categories.find(cat => cat.name === name)
      return {
        name,
        value,
        color: category?.color || '#8884d8'
      }
    })

    // Weekly expenses for bar chart
    const weeklyExpenses = [0, 0, 0, 0, 0] // 5 weeks max
    currentMonthExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date)
      const weekOfMonth = Math.floor((expenseDate.getDate() - 1) / 7)
      if (weekOfMonth < 5) {
        weeklyExpenses[weekOfMonth] += expense.amount
      }
    })

    const barChartData = weeklyExpenses.map((amount, index) => ({
      week: `Week ${index + 1}`,
      amount
    }))

    // Monthly comparison (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getMonth() === date.getMonth() && 
               expenseDate.getFullYear() === date.getFullYear()
      })
      
      const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        expenses: totalExpenses,
        budget: settings.monthlyBudget || 0
      })
    }

    return {
      areaChartData,
      pieChartData,
      barChartData,
      monthlyData,
      totalExpenses: currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      totalCategories: pieChartData.length,
      avgDailySpend: currentMonthExpenses.length > 0 
        ? currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0) / currentDate.getDate()
        : 0
    }
  }, [expenses, categories, settings.monthlyBudget])

  const currencySymbol = preferences?.currency === 'INR' ? '₹' : preferences?.currency === 'USD' ? '$' : preferences?.currency === 'EUR' ? '€' : '₹'

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1b] border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {currencySymbol}{entry.value?.toFixed(2)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0f0f10] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold text-white">
                {currencySymbol}{chartData.totalExpenses.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-[#0f0f10] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Budget Remaining</p>
              <p className="text-2xl font-bold text-green-400">
                {currencySymbol}{Math.max(0, settings.monthlyBudget - chartData.totalExpenses).toFixed(2)}
              </p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-[#0f0f10] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Daily Spend</p>
              <p className="text-2xl font-bold text-orange-400">
                {currencySymbol}{chartData.avgDailySpend.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-[#0f0f10] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Categories Used</p>
              <p className="text-2xl font-bold text-purple-400">
                {chartData.totalCategories}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Expenses Area Chart */}
        <div className="bg-[#0f0f10] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Expenses Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.areaChartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorAmount)"
                name="Daily"
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorCumulative)"
                name="Cumulative"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="bg-[#0f0f10] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Expense Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.pieChartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${currencySymbol}${value.toFixed(2)}`, 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Expenses Bar Chart */}
        <div className="bg-[#0f0f10] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Comparison Line Chart */}
        <div className="bg-[#0f0f10] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">6-Month Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="Expenses"
              />
              <Line 
                type="monotone" 
                dataKey="budget" 
                stroke="#22c55e" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                name="Budget"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default ChartsDashboard
