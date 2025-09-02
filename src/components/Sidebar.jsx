import React, { memo, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { Home, PieChart, Settings, Plus, ChevronLeft, ChevronRight, X, Menu } from 'lucide-react'
import { toggleModal } from '../store/expenseManagerSlice'
import { useSidebar } from '../hooks/useSidebarStore.jsx'

// Memoize menu items to prevent recreation on every render
const menuItems = [
  { icon: Home, id: 'expenses', to: '/', label: 'Expenses' },
  { icon: PieChart, id: 'analytics', to: '/analytics', label: 'Analytics' }
]

const Sidebar = memo(({ onSettingsClick }) => {
  const dispatch = useDispatch()
  const { isExpanded, toggleSidebar, setIsExpanded } = useSidebar()
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [showText, setShowText] = useState(isExpanded)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  // Touch handlers for mobile swipe gestures
  const handleTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (window.innerWidth < 768) {
      if (isLeftSwipe && isExpanded) {
        setIsExpanded(false)
      } else if (isRightSwipe && !isExpanded) {
        setIsExpanded(true)
      }
    }
  }

  // Handle text animation timing
  useEffect(() => {
    if (isExpanded) {
      // Delay showing text until sidebar starts expanding
      const timer = setTimeout(() => setShowText(true), 150)
      return () => clearTimeout(timer)
    } else {
      // Hide text immediately when collapsing
      setShowText(false)
    }
  }, [isExpanded])

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false)
      } else if (window.innerWidth >= 1024) {
        // Auto-expand on large screens for better UX
        setIsExpanded(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setIsExpanded])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpanded && window.innerWidth < 768) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded, setIsExpanded])

  // Close sidebar when clicking nav links on mobile
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setIsExpanded(false)
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 sidebar-full-height w-full bg-black/50 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      )}

      <aside className={`
        ${isExpanded ? 'w-64' : 'w-16 md:w-20'} 
        bg-[#0f0f10] sidebar-full-height fixed left-0 top-0 flex flex-col gap-4 md:gap-6 z-50 
        transition-all duration-300 ease-in-out border-r border-[#222]
        ${isExpanded ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:translate-x-0 p-3 md:p-4
      `}>
        {/* Header Section */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center cursor-pointer flex-shrink-0">
              <span className="text-white font-bold text-sm md:text-base">E</span>
            </div>
            {showText && (
              <div className="overflow-hidden">
                <h2 className="text-white font-bold text-base md:text-lg whitespace-nowrap transform transition-all duration-300 delay-75 opacity-100 translate-x-0">ExpenseTracker</h2>
              </div>
            )}
          </div>
          
          {/* Toggle Button - Desktop Only */}
          <button 
            onClick={toggleSidebar}
            className="hidden lg:flex w-6 md:w-8 h-6 md:h-8 rounded-lg bg-[#1a1a1b] hover:bg-[#222] items-center justify-center text-gray-400 hover:text-white transition-all duration-200 flex-shrink-0"
          >
            {isExpanded ? <ChevronLeft className="w-3 md:w-4 h-3 md:h-4" /> : <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />}
          </button>
        </div>
        
        {/* Add Expense Button */}
        <button 
          onClick={() => {
            dispatch(toggleModal('showExpenseModal'))
            handleNavClick()
          }}
          className={`${isExpanded ? 'w-full justify-start px-3 md:px-4' : 'w-10 md:w-12 justify-center'} h-10 md:h-12 rounded-lg md:rounded-xl bg-orange-500 hover:bg-orange-600 flex items-center text-white transition-all duration-300 shadow-lg hover:shadow-orange-500/25 gap-2 md:gap-3`}
        >
          <Plus className="w-4 md:w-5 h-4 md:h-5 flex-shrink-0" />
          {showText && (
            <span className="font-medium whitespace-nowrap overflow-hidden text-sm md:text-base">Add Expense</span>
          )}
        </button>
        
        {/* Navigation */}
        <nav className="flex flex-col gap-2 md:gap-3 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.id}
                to={item.to}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `relative ${isExpanded ? 'w-full justify-start px-3 md:px-4' : 'w-10 md:w-12 justify-center'} h-10 md:h-12 rounded-lg md:rounded-xl flex items-center transition-all duration-300 gap-2 md:gap-3 group ` +
                  (isActive 
                    ? 'border border-orange-500 text-orange-400 bg-orange-500/5 shadow-[inset_0_0_12px_rgba(255,122,24,0.2)]' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-[#1a1a1b]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && !isExpanded && (
                      <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-0.5 h-4 md:h-6 bg-orange-400 rounded-full"></div>
                    )}
                    <Icon className="w-4 md:w-5 h-4 md:h-5 flex-shrink-0 relative z-10" />
                    {showText && (
                      <span className="font-medium whitespace-nowrap overflow-hidden text-sm md:text-base">
                        {item.label}
                      </span>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {!isExpanded && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-[#111214] border border-[#222] rounded-lg text-xs md:text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
        
        {/* Settings */}
        <div className="mt-auto mb-2">
          <button 
            onClick={() => {
              onSettingsClick()
              handleNavClick()
            }}
            className={`group relative ${isExpanded ? 'w-full justify-start px-3 md:px-4' : 'w-10 md:w-12 justify-center'} h-10 md:h-12 rounded-lg md:rounded-xl flex items-center text-gray-400 hover:text-gray-300 hover:bg-[#1a1a1b] transition-all duration-300 gap-2 md:gap-3`}
          >
            <Settings className="w-4 md:w-5 h-4 md:h-5 flex-shrink-0" />
            {showText && (
              <span className="font-medium whitespace-nowrap overflow-hidden text-sm md:text-base">Settings</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-[#111214] border border-[#222] rounded-lg text-xs md:text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50">
                Settings
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  )
})

export default Sidebar
