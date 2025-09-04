import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Settings as SettingsIcon, 
  User, 
  DollarSign, 
  Palette, 
  Bell, 
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  X
} from 'lucide-react'
import { 
  updatePreferences, 
  setBudget,
  deleteCategory,
  resetAllData
} from '../store/expenseManagerSlice'
import { scrollContainerToTop } from '../utils/scrollUtils'
// Removed CategoryManager from Settings

const Settings = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const { preferences, categories, budget } = useSelector(state => state.expenseManager)
  const [activeTab, setActiveTab] = useState('profile')
  // CategoryManager modal removed from Settings
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const [profileData, setProfileData] = useState({
    name: preferences?.name || '',
    email: preferences?.email || '',
    currency: preferences?.currency || 'INR',
    monthlyIncome: preferences?.monthlyIncome || 0
  })

  const [budgetData, setBudgetData] = useState({
    monthlyBudget: budget?.monthlyLimit || 0,
    savingsGoal: budget?.savingsGoal || 0
  })

  // Sync budgetData with budget when budget changes
  useEffect(() => {
    setBudgetData({
      monthlyBudget: budget?.monthlyLimit || 0,
      savingsGoal: budget?.savingsGoal || 0
    })
  }, [budget?.monthlyLimit, budget?.savingsGoal])

  const handleProfileSave = () => {
    dispatch(updatePreferences(profileData))
    alert('Profile updated successfully!')
  }

  const handleBudgetSave = () => {
    console.log('Saving budget data:', budgetData)
    console.log('Current budget before save:', budgetData)
    dispatch(setBudget({
      monthlyLimit: budgetData.monthlyBudget,
      alertsEnabled: true
    }))
    alert('Budget settings updated successfully!')
  }

  const exportData = () => {
    const data = {
      preferences,
      categories,
      budget,
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expense-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          localStorage.setItem('expenseManagerData', JSON.stringify({
            preferences: data.preferences || data.user, // Handle both old and new formats
            categories: data.categories,
            budget: data.budget || data.settings,
            transactions: data.transactions || [],
            goals: data.goals || [],
            analytics: data.analytics || { currentMonth: { totalIncome: 0, totalExpenses: 0, balance: 0, expensesByCategory: [], dailyExpenses: [] } },
            ui: { isSetupComplete: true, sidebarCollapsed: false, currentView: 'dashboard' }
          }))
          window.location.reload()
        } catch (_error) {
          void _error
          alert('Invalid file format!')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleResetData = () => {
    if (showResetConfirm) {
      dispatch(resetAllData())
      setShowResetConfirm(false)
      alert('All data has been reset successfully!')
    } else {
      setShowResetConfirm(true)
    }
  }

  const handleCancelReset = () => {
    setShowResetConfirm(false)
  }

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? All expenses in this category will also be deleted.')) {
      dispatch(deleteCategory(categoryId))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-hidden">
      <div className="bg-[#0f0f10] rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800 flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Mobile Tab Navigation */}
          <div className="lg:hidden border-b border-gray-800 p-4 flex-shrink-0">
            <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <div className="flex gap-2 min-w-max">
                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'categories', label: 'Categories', icon: Palette },
                  { id: 'budget', label: 'Budget', icon: DollarSign },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'data', label: 'Data', icon: Database }
                ].map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveTab(id)
                      // Scroll to top when tab changes
                      scrollContainerToTop('.overflow-y-auto')
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
                      activeTab === id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-[#2a2a2b]'
                    }`}
                  >
                    {React.createElement(icon, { className: 'w-4 h-4 flex-shrink-0' })}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 bg-[#1a1a1b] p-4 flex-shrink-0 overflow-y-auto">
            <nav className="space-y-2">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'categories', label: 'Categories', icon: Palette },
                { id: 'budget', label: 'Budget & Goals', icon: DollarSign },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'data', label: 'Data Management', icon: Database }
              ].map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id)
                    // Scroll to top when tab changes
                    scrollContainerToTop('.overflow-y-auto')
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-[#2a2a2b]'
                  }`}
                >
                  {React.createElement(icon, { className: 'w-5 h-5' })}
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white">Profile Settings</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[#1a1a1b] border border-gray-700 rounded-lg px-3 py-2.5 sm:py-3 text-white focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-[#1a1a1b] border border-gray-700 rounded-lg px-3 py-2.5 sm:py-3 text-white focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Currency</label>
                    <select
                      value={profileData.currency}
                      onChange={(e) => setProfileData(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full bg-[#1a1a1b] border border-gray-700 rounded-lg px-3 py-2.5 sm:py-3 text-white focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                    >
                      <option value="INR">₹ Indian Rupee</option>
                      <option value="USD">$ US Dollar</option>
                      <option value="EUR">€ Euro</option>
                      <option value="GBP">£ British Pound</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Monthly Income</label>
                    <input
                      type="number"
                      value={profileData.monthlyIncome}
                      onChange={(e) => setProfileData(prev => ({ ...prev, monthlyIncome: e.target.value }))}
                      className="w-full bg-[#1a1a1b] border border-gray-700 rounded-lg px-3 py-2.5 sm:py-3 text-white focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleProfileSave}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all font-medium text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Save Profile
                  </button>
                </div>
              </div>
            )}

            {/* Budget & Goals Tab */}
            {activeTab === 'budget' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white">Budget & Goals Settings</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Monthly Budget</label>
                    <input
                      type="number"
                      value={budgetData.monthlyBudget}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, monthlyBudget: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-[#1a1a1b] border border-gray-700 rounded-lg px-3 py-2.5 sm:py-3 text-white focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                      placeholder="Enter your monthly budget"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Savings Goal</label>
                    <input
                      type="number"
                      value={budgetData.savingsGoal}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, savingsGoal: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-[#1a1a1b] border border-gray-700 rounded-lg px-3 py-2.5 sm:py-3 text-white focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                      placeholder="Enter your savings goal"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleBudgetSave}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all font-medium text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Save Budget
                  </button>
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Categories</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-[#1a1a1b] rounded-xl p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <span className="text-lg sm:text-2xl flex-shrink-0">{category.icon}</span>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-white font-medium text-sm sm:text-base truncate">{category.name}</h4>
                            <p className="text-gray-400 text-xs sm:text-sm">Budget: {preferences?.currency === 'INR' ? '₹' : '$'}{category.budget || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {categories.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-4xl sm:text-6xl mb-4">📝</div>
                    <h4 className="text-lg sm:text-xl font-semibold text-white mb-2">No categories yet</h4>
                    <p className="text-gray-400 text-sm sm:text-base">Categories you create will appear here.</p>
                  </div>
                )}
              </div>
            )}

            {/* Data Management Tab */}
            {activeTab === 'data' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white">Data Management</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Export Data */}
                  <div className="bg-[#1a1a1b] rounded-xl p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-3">Export Data</h4>
                    <p className="text-gray-400 mb-4 text-sm sm:text-base">Download your data as a backup file</p>
                    <button
                      onClick={exportData}
                      className="w-full px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg transition-all font-medium text-sm sm:text-base"
                    >
                      <Download className="w-4 h-4 inline mr-2" />
                      Export Data
                    </button>
                  </div>

                  {/* Import Data */}
                  <div className="bg-[#1a1a1b] rounded-xl p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-3">Import Data</h4>
                    <p className="text-gray-400 mb-4 text-sm sm:text-base">Restore data from a backup file</p>
                    <label className="w-full px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all font-medium cursor-pointer flex items-center justify-center text-sm sm:text-base">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                      <input
                        type="file"
                        accept=".json"
                        onChange={importData}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Reset All Data */}
                  <div className="bg-[#1a1a1b] rounded-xl p-4 sm:p-6 lg:col-span-2">
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-3">Reset All Data</h4>
                    <p className="text-gray-400 mb-4 text-sm sm:text-base">
                      This will permanently delete all your data including categories, expenses, and settings.
                      This action cannot be undone.
                    </p>
                    {!showResetConfirm ? (
                      <button
                        onClick={handleResetData}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg transition-all font-medium text-sm sm:text-base"
                      >
                        <Trash2 className="w-4 h-4 inline mr-2" />
                        Reset All Data
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleResetData}
                          className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium text-sm sm:text-base"
                        >
                          <Trash2 className="w-4 h-4 inline mr-2" />
                          Confirm Reset
                        </button>
                        <button
                          onClick={handleCancelReset}
                          className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all font-medium text-sm sm:text-base"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white">Notification Settings</h3>
                
                <div className="space-y-4">
                  <div className="bg-[#1a1a1b] rounded-xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-white">Budget Alerts</h4>
                        <p className="text-gray-400 text-sm sm:text-base">Get notified when you exceed your budget</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1a1a1b] rounded-xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-white">Weekly Reports</h4>
                        <p className="text-gray-400 text-sm sm:text-base">Receive weekly spending summaries</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
