import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Brain, TrendingUp, Eye, EyeOff, Settings, Zap, Activity, GraduationCap } from 'lucide-react'
import SmartBudgetRebalancer from './SmartBudgetRebalancer'
import SmartBudgetAdvisor from './SmartBudgetAdvisor'
import IntelligentAnalytics from './IntelligentAnalytics'
import AIInsightsEngine from './AIInsightsEngine'
import SmartLearningAssistant from './SmartLearningAssistant'
import PredictiveAnalytics from './PredictiveAnalytics'
import SmartAddExpenseModal from './SmartAddExpenseModal'

const IntelligentDashboard = () => {
  const { transactions = [], budget = {}, categories = [] } = useSelector(state => state.expenseManager || {})
  const [activeTab, setActiveTab] = useState('advisor')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  // Calculate advanced intelligence score based on usage and data quality
  const intelligenceScore = useMemo(() => {
    let score = 0
    const maxScore = 100

    // Data volume scoring (25 points)
    if (transactions.length > 0) score += 5
    if (transactions.length > 10) score += 5
    if (transactions.length > 30) score += 5
    if (transactions.length > 50) score += 5
    if (transactions.length > 100) score += 5

    // Data quality scoring (25 points)
    const hasDescriptions = transactions.filter(t => t.notes?.length > 0).length
    const descriptionRatio = hasDescriptions / Math.max(transactions.length, 1)
    score += Math.round(descriptionRatio * 10)

    const hasCategories = transactions.filter(t => t.category).length
    const categoryRatio = hasCategories / Math.max(transactions.length, 1)
    score += Math.round(categoryRatio * 10)

    const paymentMethodDiversity = new Set(transactions.map(t => t.paymentMethod)).size
    score += Math.min(5, paymentMethodDiversity)

    // Budget configuration (20 points)
    if (budget.monthlyLimit) {
      score += 10
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlySpent = transactions
        .filter(t => {
          const date = new Date(t.date)
          return date.getMonth() === currentMonth && 
                 date.getFullYear() === currentYear && 
                 t.type === 'expense'
        })
        .reduce((sum, t) => sum + t.amount, 0)
      
      const utilization = monthlySpent / budget.monthlyLimit
      if (utilization > 0.1 && utilization < 1.5) score += 10 // Good budget usage
    }

    // Category diversity (15 points)
    if (categories.length >= 3) score += 5
    if (categories.length >= 5) score += 5
    if (categories.length >= 8) score += 5

    // Consistency and engagement (15 points)
    const dateRange = transactions.length > 1 ? 
      (new Date(Math.max(...transactions.map(t => new Date(t.date)))) - 
       new Date(Math.min(...transactions.map(t => new Date(t.date))))) / (1000 * 60 * 60 * 24) : 0
    
    if (dateRange > 7) score += 5   // At least a week of data
    if (dateRange > 30) score += 5  // At least a month of data
    if (dateRange > 90) score += 5  // At least 3 months of data

    return Math.min(score, maxScore)
  }, [transactions, budget, categories])

  const getIntelligenceLevel = (score) => {
    if (score >= 90) return { level: 'AI Master', color: 'purple', desc: 'Maximum intelligence unlocked' }
    if (score >= 75) return { level: 'Expert', color: 'green', desc: 'Advanced AI insights available' }
    if (score >= 60) return { level: 'Advanced', color: 'blue', desc: 'Most AI features unlocked' }
    if (score >= 40) return { level: 'Intermediate', color: 'yellow', desc: 'Good AI capabilities' }
    if (score >= 20) return { level: 'Beginner', color: 'orange', desc: 'Basic AI insights' }
    return { level: 'Learning', color: 'red', desc: 'Building intelligence' }
  }

  const intelligence = getIntelligenceLevel(intelligenceScore)

  const tabs = [
    { id: 'advisor', label: 'AI Advisor', icon: Brain, component: SmartBudgetAdvisor },
    { id: 'insights', label: 'AI Insights', icon: Activity, component: AIInsightsEngine },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp, component: PredictiveAnalytics },
    { id: 'learning', label: 'Learning', icon: GraduationCap, component: SmartLearningAssistant },
    { id: 'rebalancer', label: 'Rebalancer', icon: Zap, component: SmartBudgetRebalancer },
    { id: 'analytics', label: 'Analytics', icon: Settings, component: IntelligentAnalytics }
  ]

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <Brain className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="bg-[#1a1a1b] rounded-xl sm:rounded-2xl border border-gray-800/50 overflow-hidden">
        {/* Mobile-Optimized Header */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-white font-semibold text-base sm:text-lg">AI-Powered Intelligence</h2>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 bg-${intelligence.color}-400 rounded-full animate-pulse`}></div>
                  <span className={`text-${intelligence.color}-400 text-xs sm:text-sm font-medium`}>
                    {intelligence.level} Level
                  </span>
                  <span className="text-gray-400 text-xs sm:text-sm">({intelligenceScore}/100)</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors text-sm font-medium"
              >
                Smart Add
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Intelligence Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">AI Intelligence Progress</span>
              <span className="text-xs text-gray-400">{intelligence.desc}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className={`h-2 bg-gradient-to-r from-${intelligence.color}-500 to-${intelligence.color}-400 rounded-full transition-all duration-500`}
                style={{ width: `${intelligenceScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mobile-Responsive Navigation Tabs */}
        <div className="border-b border-gray-800">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-white bg-gray-800/50'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {tabs.map(tab => {
            const Component = tab.component
            return (
              <div
                key={tab.id}
                className={`${activeTab === tab.id ? 'block' : 'hidden'}`}
              >
                <Component />
              </div>
            )
          })}
        </div>

        {/* Enhanced Tips Section */}
        {intelligenceScore < 90 && (
          <div className="border-t border-gray-800 p-4 bg-gray-900/50">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-white font-medium mb-1">Boost Your AI Intelligence Level</h4>
                <div className="text-gray-400 text-sm space-y-1">
                  {transactions.length < 20 && (
                    <p>• Add more transactions to unlock behavioral analysis</p>
                  )}
                  {transactions.length < 50 && (
                    <p>• Reach 50+ transactions for predictive analytics</p>
                  )}
                  {!budget.monthlyLimit && (
                    <p>• Set a monthly budget for personalized recommendations</p>
                  )}
                  {categories.length < 5 && (
                    <p>• Create 5+ categories for better expense classification</p>
                  )}
                  {transactions.filter(t => !t.notes || t.notes.length === 0).length > transactions.length * 0.7 && (
                    <p>• Add descriptions to 30%+ of transactions for smart predictions</p>
                  )}
                  {new Set(transactions.map(t => t.paymentMethod)).size < 3 && (
                    <p>• Use diverse payment methods for comprehensive tracking</p>
                  )}
                  {intelligenceScore >= 60 && (
                    <p>• Complete learning lessons to unlock AI Master level</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Smart Add Modal */}
      <SmartAddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  )
}

export default IntelligentDashboard
