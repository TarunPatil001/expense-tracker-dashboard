import React, { createContext, useContext, useState } from 'react'

const SidebarContext = createContext()

export const SidebarProvider = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    // Initialize based on screen size
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024
    }
    return false
  })

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar, setIsExpanded }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
