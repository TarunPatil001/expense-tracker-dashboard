import React from 'react'
import { useDispatch } from 'react-redux'
import { Home, Plus, Menu, X } from 'lucide-react'
import DashboardOverview from '../components/DashboardOverview'
import ExpenseAreaChart from '../components/ExpenseAreaChart'
import CategoryBudgets from '../components/CategoryBudgets'
import ModernExpenseList from '../components/ModernExpenseList'
import ModernAddExpenseModal from '../components/ModernAddExpenseModal'
import CategoryManager from '../components/CategoryManager'
import ErrorBoundary from '../components/ErrorBoundary'
import { toggleModal } from '../store/expenseManagerSlice'
import { useSidebar } from '../hooks/useSidebarStore.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle'

const DashboardPage = () => {
  const dispatch = useDispatch()
  const { isExpanded, toggleSidebar } = useSidebar()

  // Set page title
  useDocumentTitle('Dashboard')

  const handleAddExpense = () => {
    dispatch(toggleModal('showExpenseModal'))
  }

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white">
      {/* Page Header */}
      <header className={`sticky top-0 z-40 bg-[#111214] border-b border-[#222] py-3 sm:py-4 backdrop-blur-sm transition-all duration-300 ${isExpanded ? 'lg:ml-64' : 'lg:ml-20'} ml-0`}>
        <div className="max-w-full px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Left Section - Mobile Toggle + Title */}
            <div className="flex items-center gap-3">
              {/* Sidebar Toggle Button - Mobile & Tablet */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#1a1a1b] border border-[#333] flex items-center justify-center text-gray-400 hover:text-white hover:border-emerald-500/30 transition-all duration-200"
              >
                {isExpanded ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              {/* Brand Logo - Mobile Only */}
              <div className="flex-shrink-0 lg:hidden">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">E</span>
                </div>
              </div>

              {/* Desktop Icon */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 lg:flex items-center justify-center flex-shrink-0 hidden">
                <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              
              {/* Title */}
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 text-sm sm:text-base lg:text-lg hidden sm:block">Track and manage your expenses</p>
              </div>
            </div>
            
            {/* Right Section - Add Button */}
            <button
              onClick={handleAddExpense}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 text-sm sm:text-base font-medium shadow-lg hover:shadow-orange-500/25"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add Expense</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className={`transition-all duration-300 ${isExpanded ? 'lg:ml-64' : 'lg:ml-20'} ml-0 p-4 sm:p-6 space-y-4 sm:space-y-6`}>
        {/* Overview */}
        <DashboardOverview />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <ExpenseAreaChart />
          </div>
          <div className="lg:col-span-1">
            <CategoryBudgets />
          </div>
        </div>

        {/* Expenses List */}
        <ErrorBoundary fallbackMessage="There was an error loading the expense list">
          <ModernExpenseList />
        </ErrorBoundary>
      </main>

      {/* Modals */}
      <ModernAddExpenseModal />
      <CategoryManager />
    </div>
  )
}

export default DashboardPage
