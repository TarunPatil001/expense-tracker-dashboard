import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts'
import { 
  Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
  DollarSign, Clock, Target, Activity
} from 'lucide-react'

// Helper functions for analytics calculations
const calculateDailyAnalytics = (monthTransactions, year, month, categories) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dailyData = {}
  const categoryData = {}
  
  // Group transactions by day and category
  monthTransactions.forEach(transaction => {
    const day = new Date(transaction.date).getDate()
    const category = transaction.category
    
    if (!dailyData[day]) dailyData[day] = 0
    dailyData[day] += transaction.amount
    
    if (!categoryData[category]) categoryData[category] = 0
    categoryData[category] += transaction.amount
  })
  
  // Create daily chart data
  const chartData = []
  for (let day = 1; day <= daysInMonth; day++) {
    chartData.push({
      day: day,
      amount: dailyData[day] || 0,
      date: new Date(year, month, day).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    })
  }
  
  // Create category pie chart data
  const pieData = Object.entries(categoryData).map(([categoryId, amount]) => {
    const category = categories.find(cat => cat.id == categoryId)
    return {
      name: category?.name || 'Unknown',
      value: amount,
      color: category?.color || '#8B5CF6'
    }
  }).sort((a, b) => b.value - a.value).slice(0, 6) // Top 6 categories
  
  return { chartData, pieData, type: 'daily' }
}

const calculateWeeklyAnalytics = (monthTransactions, categories) => {
  const weekData = {}
  const categoryData = {}
  
  monthTransactions.forEach(transaction => {
    const date = new Date(transaction.date)
    const weekOfMonth = Math.ceil(date.getDate() / 7)
    const category = transaction.category
    
    if (!weekData[weekOfMonth]) weekData[weekOfMonth] = 0
    weekData[weekOfMonth] += transaction.amount
    
    if (!categoryData[category]) categoryData[category] = 0
    categoryData[category] += transaction.amount
  })
  
  const chartData = []
  for (let week = 1; week <= 5; week++) {
    chartData.push({
      week: `Week ${week}`,
      amount: weekData[week] || 0
    })
  }
  
  const pieData = Object.entries(categoryData).map(([categoryId, amount]) => {
    const category = categories.find(cat => cat.id == categoryId)
    return {
      name: category?.name || 'Unknown',
      value: amount,
      color: category?.color || '#8B5CF6'
    }
  }).sort((a, b) => b.value - a.value).slice(0, 6)
  
  return { chartData, pieData, type: 'weekly' }
}

const calculateMonthlyAnalytics = (allTransactions, selectedYear, categories) => {
  const monthData = {}
  const categoryData = {}
  
  allTransactions.filter(t => t.type === 'expense').forEach(transaction => {
    const date = new Date(transaction.date)
    if (date.getFullYear() === selectedYear) {
      const month = date.getMonth()
      const category = transaction.category
      
      if (!monthData[month]) monthData[month] = 0
      monthData[month] += transaction.amount
      
      if (!categoryData[category]) categoryData[category] = 0
      categoryData[category] += transaction.amount
    }
  })
  
  const chartData = []
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  
  for (let month = 0; month < 12; month++) {
    chartData.push({
      month: monthNames[month],
      amount: monthData[month] || 0
    })
  }
  
  const pieData = Object.entries(categoryData).map(([categoryId, amount]) => {
    const category = categories.find(cat => cat.id == categoryId)
    return {
      name: category?.name || 'Unknown',
      value: amount,
      color: category?.color || '#8B5CF6'
    }
  }).sort((a, b) => b.value - a.value).slice(0, 6)
  
  return { chartData, pieData, type: 'monthly' }
}

const AdvancedAnalytics = () => {
  const { transactions = [], preferences = {}, categories = [] } = useSelector(state => state.expenseManager || {})
  
  // State for view and date selection
  const [viewType, setViewType] = useState('daily') // 'daily', 'weekly', 'monthly'
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const getCurrencySymbol = () => {
    switch (preferences?.currency) {
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'INR': return '₹'
      default: return '₹'
    }
  }

  // Calculate analytics based on view type and selected date
  const analyticsData = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    
    // Filter transactions for the selected month
    const monthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return transactionDate.getFullYear() === year && 
             transactionDate.getMonth() === month &&
             transaction.type === 'expense'
    })

    if (viewType === 'daily') {
      return calculateDailyAnalytics(monthTransactions, year, month, categories)
    } else if (viewType === 'weekly') {
      return calculateWeeklyAnalytics(monthTransactions, categories)
    } else {
      return calculateMonthlyAnalytics(transactions, year, categories)
    }
  }, [transactions, viewType, selectedDate, categories])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const { chartData } = analyticsData
    const amounts = chartData.map(d => d.amount)
    const total = amounts.reduce((sum, amount) => sum + amount, 0)
    const average = amounts.length > 0 ? total / amounts.length : 0
    const highest = Math.max(...amounts)
    const lowest = Math.min(...amounts.filter(a => a > 0))
    
    return { total, average, highest, lowest: isFinite(lowest) ? lowest : 0 }
  }, [analyticsData])

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate)
    if (viewType === 'daily' || viewType === 'weekly') {
      newDate.setMonth(newDate.getMonth() + direction)
    } else {
      newDate.setFullYear(newDate.getFullYear() + direction)
    }
    setSelectedDate(newDate)
  }

  const getDateDisplayText = () => {
    if (viewType === 'monthly') {
      return selectedDate.getFullYear().toString()
    } else {
      return selectedDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1b] border border-gray-700 rounded-xl p-4 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-white font-semibold">
              {getCurrencySymbol()}{payload[0].value.toFixed(2)}
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile-Optimized Header Controls */}
      <div className="bg-[#1a1a1b] rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:gap-4">
          {/* View Type Selector */}
          <div className="flex items-center gap-2">
            <div className="flex bg-[#0f0f10] rounded-lg p-1 w-full sm:w-auto">
              {['daily', 'weekly', 'monthly'].map((type) => (
                <button
                  key={type}
                  onClick={() => setViewType(type)}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                    viewType === type
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 flex-shrink-0" />
              <span className="truncate">{getDateDisplayText()}</span>
            </div>
            
            <button
              onClick={() => navigateDate(1)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-[#1a1a1b] rounded-lg sm:rounded-xl p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm">Total Spent</p>
              <p className="text-white text-lg sm:text-2xl font-bold truncate">
                {getCurrencySymbol()}{summaryStats.total.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1b] rounded-lg sm:rounded-xl p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm">Average</p>
              <p className="text-white text-lg sm:text-2xl font-bold truncate">
                {getCurrencySymbol()}{summaryStats.average.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1b] rounded-lg sm:rounded-xl p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm">Highest</p>
              <p className="text-white text-lg sm:text-2xl font-bold truncate">
                {getCurrencySymbol()}{summaryStats.highest.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1b] rounded-lg sm:rounded-xl p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm">Lowest</p>
              <p className="text-white text-lg sm:text-2xl font-bold truncate">
                {getCurrencySymbol()}{summaryStats.lowest.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Responsive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Main Chart */}
        <div className="bg-[#1a1a1b] rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
            {viewType === 'daily' ? 'Daily' : viewType === 'weekly' ? 'Weekly' : 'Monthly'} Expenses
          </h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              {viewType === 'daily' ? (
                <LineChart data={analyticsData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2b" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    tickFormatter={(value) => `${getCurrencySymbol()}${value}`}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#FF6B6B" 
                    strokeWidth={2}
                    dot={{ fill: '#FF6B6B', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#FF6B6B', strokeWidth: 2 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={analyticsData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2b" />
                  <XAxis 
                    dataKey={viewType === 'weekly' ? 'week' : 'month'} 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    tickFormatter={(value) => `${getCurrencySymbol()}${value}`}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="amount" 
                    fill="#FF6B6B"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-[#1a1a1b] rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Category Breakdown</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={window.innerWidth < 640 ? 80 : 100}
                  dataKey="value"
                  label={({ name, percent }) => 
                    window.innerWidth < 640 ? 
                    `${(percent * 100).toFixed(0)}%` :
                    `${name} ${(percent * 100).toFixed(1)}%`
                  }
                  labelLine={false}
                >
                  {analyticsData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${getCurrencySymbol()}${value.toFixed(2)}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedAnalytics
