import React from 'react'
import { useDispatch } from 'react-redux'
import HeaderResponsive from '../components/HeaderResponsive'
import DashboardOverview from '../components/DashboardOverview'
import ExpenseAreaChart from '../components/ExpenseAreaChart'
import CategoryBudgets from '../components/CategoryBudgets'
import ModernExpenseList from '../components/ModernExpenseList'
import ModernAddExpenseModal from '../components/ModernAddExpenseModal'
import CategoryManager from '../components/CategoryManager'
import ErrorBoundary from '../components/ErrorBoundary'
import { toggleModal } from '../store/expenseManagerSlice'
import { useSidebar } from '../hooks/useSidebarStore.jsx'

const ExpensesPage = () => {
  const dispatch = useDispatch()
  const { isExpanded } = useSidebar()

  const handleAddExpense = () => {
    dispatch(toggleModal('showExpenseModal'))
  }

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white">
      {/* Header - No wrapper div for sticky positioning */}
      <HeaderResponsive onAddExpense={handleAddExpense} />
      
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

export default ExpensesPage
