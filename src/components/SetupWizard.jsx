import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { User, DollarSign, Target, Check, ArrowRight, ArrowLeft, Plus, X } from 'lucide-react'
import { completeSetup } from '../store/expenseManagerSlice'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { getNextAvailableColor } from '../utils/autoColorAssignment'

const SetupWizard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // Set page title
  useDocumentTitle('Setup Wizard')
  
  const [currentStep, setCurrentStep] = useState(1)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    currency: 'INR',
    monthlyIncome: ''
  })
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [customCategories, setCustomCategories] = useState([])
  // removed unused showCategoryForm state
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '',
    budget: ''
  })

  // Available icons for custom categories
  const availableIcons = [
    '🍽️', '🛒', '🍕', '☕', '🍔', '🥗', // Food & Dining
    '🚗', '⛽', '🚌', '🚕', '🚲', '✈️', // Transportation
    '🎬', '🎮', '📚', '🎵', '🏃', '⚽', // Entertainment & Sports
    '⚡', '💡', '🌊', '📱', '📶', '🔥', // Utilities
    '💊', '🏥', '💪', '🧘', '🏋️', '🦷', // Health & Fitness
    '👕', '👠', '💍', '🎁', '🛍️', '💻', // Shopping
    '🏠', '🛏️', '🪑', '🔧', '🧹', '🌱', // Home & Garden
    '📚', '✏️', '🎓', '📝', '💼', '📊', // Education & Work
    '🎉', '🍰', '💐', '🎈', '🎊', '🥳', // Celebrations
    '💰', '💳', '🏦', '📈', '💸', '🪙'  // Finance
  ]

  const [categoryBudgets, setCategoryBudgets] = useState({})

  // Safe currency symbol function
  const getCurrencySymbol = () => {
    const currency = profile?.currency
    switch (currency) {
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'INR': return '₹'
      default: return '₹'
    }
  }

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleCategoryBudgetChange = (categoryId, value) => {
    setCategoryBudgets(prev => ({ ...prev, [categoryId]: value }))
  }

  const addCustomCategory = () => {
    if (!newCategory.name || !newCategory.icon) return
    
    // Auto-assign a unique color
    const autoColor = getNextAvailableColor(customCategories)
    
    const category = {
      id: Date.now(),
      name: newCategory.name,
      icon: newCategory.icon,
      color: autoColor,
      budget: parseFloat(newCategory.budget) || 0
    }
    
    setCustomCategories(prev => [...prev, category])
    setCategoryBudgets(prev => ({ ...prev, [category.id]: newCategory.budget }))
    setNewCategory({ name: '', icon: '', budget: '' })
  // no-op; inline category form toggle removed
  }

  const removeCustomCategory = (categoryId) => {
    setCustomCategories(prev => prev.filter(cat => cat.id !== categoryId))
    setCategoryBudgets(prev => {
      const updated = { ...prev }
      delete updated[categoryId]
      return updated
    })
  }

  const handleComplete = () => {
    const customCategoriesWithBudgets = customCategories.map(cat => ({
      ...cat,
      budget: parseFloat(categoryBudgets[cat.id]) || 0
    }))

    const setupData = {
      profile: {
        ...profile,
        monthlyIncome: parseFloat(profile.monthlyIncome) || 0
      },
      budget: parseFloat(monthlyBudget) || 0,
      categories: customCategoriesWithBudgets,
      customCategories: customCategories
    }

    // Save to localStorage
    localStorage.setItem('expenseManagerSetup', JSON.stringify(setupData))
    
    dispatch(completeSetup(setupData))
    
    // Navigate to dashboard after setup completion
    navigate('/')
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const isStep1Valid = profile.name && profile.email && profile.monthlyIncome
  const isStep2Valid = monthlyBudget && parseFloat(monthlyBudget) > 0
  // Step 3 validity is implicit (custom categories optional)
  const isStep4Valid = customCategories.length === 0 || Object.values(categoryBudgets).some(budget => budget && parseFloat(budget) > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0c] via-[#1a1a1b] to-[#0f0f10] flex items-center justify-center p-3 sm:p-4 lg:p-6">
      <div className="bg-[#1a1a1b] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-lg lg:max-w-2xl shadow-2xl border border-gray-800">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg sm:text-2xl">E</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Welcome to ExpenseManager</h1>
          <p className="text-gray-400 text-sm sm:text-base px-2 sm:px-0">Let's set up your personalized expense tracking dashboard</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex items-center min-w-max px-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-medium text-sm sm:text-base ${
                  step <= currentStep 
                    ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step < currentStep ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : step}
                </div>
                {step < 4 && <div className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 ${
                  step < currentStep ? 'bg-gradient-to-r from-orange-500 to-pink-600' : 'bg-gray-700'
                }`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px] sm:min-h-[400px]">
          {/* Step 1: Profile Setup */}
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center mb-4 sm:mb-6">
                <User className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-orange-500" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">Tell us about yourself</h2>
                <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">We'll personalize your experience</p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="w-full bg-[#0f0f10] border border-gray-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full bg-[#0f0f10] border border-gray-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Currency</label>
                    <select
                      value={profile.currency}
                      onChange={(e) => handleProfileChange('currency', e.target.value)}
                      className="w-full bg-[#0f0f10] border border-gray-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Monthly Income *</label>
                    <input
                      type="number"
                      value={profile.monthlyIncome}
                      onChange={(e) => handleProfileChange('monthlyIncome', e.target.value)}
                      className="w-full bg-[#0f0f10] border border-gray-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                      placeholder="5000"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Budget Setup */}
          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center mb-4 sm:mb-6">
                <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-orange-500" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">Set your monthly budget</h2>
                <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">How much do you want to spend each month?</p>
              </div>

              <div className="bg-[#0f0f10] rounded-lg sm:rounded-xl p-4 sm:p-6 text-center">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-3 sm:mb-4">Total Monthly Budget</label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg sm:text-xl">
                    {getCurrencySymbol()}
                  </span>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    className="w-full bg-transparent border-2 border-gray-700 rounded-lg sm:rounded-xl pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-white text-2xl sm:text-3xl font-bold text-center focus:border-orange-500 focus:outline-none"
                    placeholder="3000"
                  />
                </div>
                
                {monthlyBudget && profile.monthlyIncome && (
                  <div className="mt-4 p-4 bg-[#1a1a1b] rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Income</span>
                      <span className="text-green-400">{getCurrencySymbol()}{profile.monthlyIncome}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-400">Budget</span>
                      <span className="text-orange-400">{getCurrencySymbol()}{monthlyBudget}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1 font-semibold">
                      <span className="text-gray-400">Savings</span>
                      <span className="text-blue-400">
                        {getCurrencySymbol()}{(parseFloat(profile.monthlyIncome) - parseFloat(monthlyBudget)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Custom Categories */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Plus className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                <h2 className="text-2xl font-bold text-white">Create Custom Categories</h2>
                <p className="text-gray-400 mt-2">Add your own expense categories with custom icons</p>
              </div>

              {/* Custom Category Form */}
              <div className="bg-[#0f0f10] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Add New Category</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category Name</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[#1a1a1b] border border-gray-700 rounded-lg px-3 py-3 text-white focus:border-purple-500 focus:outline-none"
                      placeholder="e.g., Gym membership, Pet care, Hobbies"
                    />
                  </div>

                  {/* Icon Selection */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Choose Icon</label>
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1 sm:gap-2 max-h-24 sm:max-h-32 overflow-y-auto bg-[#1a1a1b] rounded-lg p-2 sm:p-3">
                      {availableIcons.map((icon, index) => (
                        <button
                          key={index}
                          onClick={() => setNewCategory(prev => ({ ...prev, icon }))}
                          className={`p-1 sm:p-2 rounded-lg text-lg sm:text-xl hover:bg-[#2a2a2b] transition-colors touch-manipulation ${
                            newCategory.icon === icon ? 'bg-purple-600' : 'bg-transparent'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={addCustomCategory}
                    disabled={!newCategory.name || !newCategory.icon}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg py-3 transition-all font-medium"
                  >
                    Add Category
                  </button>
                </div>
              </div>

              {/* Custom Categories List */}
              {customCategories.length > 0 && (
                <div className="bg-[#0f0f10] rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Your Custom Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customCategories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between bg-[#1a1a1b] rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{category.icon}</span>
                          <span className="text-white font-medium">{category.name}</span>
                        </div>
                        <button
                          onClick={() => removeCustomCategory(category.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  You can skip this step if you're happy with the default categories
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Category Budgets */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Target className="w-12 h-12 mx-auto mb-3 text-orange-500" />
                <h2 className="text-2xl font-bold text-white">Allocate budgets for your categories</h2>
                <p className="text-gray-400 mt-2">Set spending limits for your custom categories</p>
              </div>

              {customCategories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No custom categories yet</h3>
                  <p className="text-gray-400 mb-6">Go back to step 3 to create your custom categories first</p>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl transition-all"
                  >
                    Create Categories
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customCategories.map((category) => (
                    <div key={category.id} className="bg-[#0f0f10] rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <h3 className="text-white font-medium">{category.name}</h3>
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          {getCurrencySymbol()}
                        </span>
                        <input
                          type="number"
                          value={categoryBudgets[category.id] || ''}
                          onChange={(e) => handleCategoryBudgetChange(category.id, e.target.value)}
                          className="w-full bg-[#1a1a1b] border border-gray-700 rounded-lg pl-8 pr-3 py-3 text-white focus:border-orange-500 focus:outline-none"
                          placeholder="500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {monthlyBudget && (
                <div className="bg-[#0f0f10] rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Allocated</span>
                    <span className="text-white font-semibold">
                      {getCurrencySymbol()}
                      {Object.values(categoryBudgets).reduce((sum, budget) => sum + (parseFloat(budget) || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-400">Budget Remaining</span>
                    <span className={`font-semibold ${
                      parseFloat(monthlyBudget) - Object.values(categoryBudgets).reduce((sum, budget) => sum + (parseFloat(budget) || 0), 0) >= 0
                        ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {getCurrencySymbol()}
                      {(parseFloat(monthlyBudget) - Object.values(categoryBudgets).reduce((sum, budget) => sum + (parseFloat(budget) || 0), 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base order-2 sm:order-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !isStep1Valid) ||
                (currentStep === 2 && !isStep2Valid)
              }
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl transition-all text-sm sm:text-base order-1 sm:order-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!isStep4Valid}
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl transition-all font-semibold text-sm sm:text-base order-1 sm:order-2"
            >
              <Check className="w-4 h-4" />
              Complete Setup
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SetupWizard
