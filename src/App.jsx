import React, { useState, useEffect } from 'react'
import { Provider, useSelector } from 'react-redux'
import { store } from './store'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import SetupWizard from './components/SetupWizard'
import Settings from './components/Settings'
import ExpensesPage from './pages/ExpensesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import { SidebarProvider } from './hooks/useSidebarStore.jsx'

function Shell() {
  const { isSetupComplete } = useSelector(state => state.expenseManager.ui)
  const [showSettings, setShowSettings] = useState(false)

  // Load setup state from localStorage on first render
  useEffect(() => {
    const setupData = localStorage.getItem('expenseManagerSetup')
    if (setupData && !isSetupComplete) {
      // If setup data exists but setup is not complete, mark as complete
      store.dispatch({ type: 'expenseManager/completeSetup', payload: JSON.parse(setupData) })
    }
  }, [isSetupComplete])

  if (!isSetupComplete) {
    return <SetupWizard />
  }

  return (
    <div className="h-screen min-h-screen bg-[#0b0b0c] text-gray-200 font-sans">
      <Sidebar onSettingsClick={() => setShowSettings(true)} />
      <Routes>
        <Route path="/" element={<ExpensesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Settings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <SidebarProvider>
        <BrowserRouter>
          <Shell />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a1b',
                color: '#fff',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </BrowserRouter>
      </SidebarProvider>
    </Provider>
  )
}
