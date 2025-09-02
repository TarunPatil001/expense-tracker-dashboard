import React from 'react'
import { BarChart3, Menu, X } from 'lucide-react'
import AdvancedAnalytics from '../components/AdvancedAnalytics'
import CategoryBudgets from '../components/CategoryBudgets'
import IntelligentDashboard from '../components/IntelligentDashboard'
import CategoryManager from '../components/CategoryManager'
import ModernAddExpenseModal from '../components/ModernAddExpenseModal'
import ErrorBoundary from '../components/ErrorBoundary'
import { useSidebar } from '../hooks/useSidebarStore.jsx'

const AnalyticsPage = () => {
  const { isExpanded, toggleSidebar } = useSidebar()
  
  return (
    <div className="min-h-screen bg-[#0f0f10] text-white">
      {/* Sticky Analytics Header */}
      <header className={`sticky top-0 z-40 bg-[#111214] border-b border-[#222] py-3 sm:py-4 backdrop-blur-sm transition-all duration-300 ${isExpanded ? 'lg:ml-64' : 'lg:ml-20'} ml-0`}>
        <div className="max-w-full px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Left Section - Sidebar Toggle + Analytics Info */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sidebar Toggle Button - Mobile & Tablet */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#1a1a1b] border border-[#333] flex items-center justify-center text-gray-400 hover:text-white hover:border-cyan-500/30 transition-all duration-200"
              >
                {isExpanded ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              {/* Brand Logo - Mobile Only */}
              <div className="flex-shrink-0 lg:hidden">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">A</span>
                </div>
              </div>

              {/* Analytics Title Section */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 lg:flex items-center justify-center flex-shrink-0 hidden">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Analytics</h1>
                  <p className="text-gray-400 mt-1 text-xs sm:text-sm lg:text-base hidden sm:block">Analyze your spending patterns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className={`transition-all duration-300 ${isExpanded ? 'lg:ml-64' : 'lg:ml-20'} ml-0 p-4 sm:p-6 space-y-4 sm:space-y-6`}>
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          <div className="xl:col-span-8">
            <AdvancedAnalytics />
          </div>
          <div className="xl:col-span-4">
            <CategoryBudgets />
          </div>
        </div>

        {/* AI-Powered Intelligence Dashboard */}
        <div className="mt-2 sm:mt-4">
          <ErrorBoundary fallbackMessage="There was an error loading the intelligent dashboard">
            <IntelligentDashboard />
          </ErrorBoundary>
        </div>
      </main>

      {/* Modals */}
      <CategoryManager />
      <ModernAddExpenseModal />
    </div>
  )
}

export default AnalyticsPage
