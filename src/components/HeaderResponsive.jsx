import React from 'react'
import { useSelector } from 'react-redux'
import { Plus, Menu, X } from 'lucide-react'
import { useSidebar } from '../hooks/useSidebarStore.jsx'

const Header = ({ onAddExpense }) => {
  const { preferences } = useSelector(state => state.expenseManager)
  const { isExpanded, toggleSidebar } = useSidebar()

  // Extract user info from preferences with safe defaults
  const userInitials = preferences?.initials || preferences?.name?.charAt(0) || 'TP'

  return (
    <header className={`sticky top-0 z-50 bg-[#111214] border-b border-[#222] py-2 sm:py-3 backdrop-blur-sm transition-all duration-300 ${isExpanded ? 'lg:ml-64' : 'lg:ml-20'} ml-0`}>
      <div className="max-w-full px-3 sm:px-6 lg:px-8 mx-auto">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Section - Sidebar Toggle + Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sidebar Toggle Button - Mobile & Tablet */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#1a1a1b] border border-[#333] flex items-center justify-center text-gray-400 hover:text-white hover:border-orange-500/30 transition-all duration-200"
            >
              {isExpanded ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Brand Logo */}
            <div className="flex-shrink-0 lg:hidden">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">E</span>
              </div>
            </div>
          </div>
          
          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* Add Expense Button */}
            <button 
              onClick={onAddExpense}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Add</span>
            </button>
            
            {/* Profile */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center cursor-pointer hover:from-gray-600 hover:to-gray-700 transition-all duration-200">
              <span className="text-white font-bold text-xs sm:text-sm">{userInitials}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
