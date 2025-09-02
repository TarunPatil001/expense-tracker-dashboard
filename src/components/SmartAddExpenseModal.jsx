import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { X, Calculator, TrendingUp, Lightbulb, MapPin, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  addTransaction, 
  updateTransaction,
  toggleModal,
  clearEditingTransaction
} from '../store/expenseManagerSlice'

const SmartAddExpenseModal = ({ isOpen, onClose, editingTransaction: propEditingTransaction }) => {
  const dispatch = useDispatch()
  const { 
    categories = [], 
    ui = {}, 
    preferences = {},
    transactions = []
  } = useSelector(state => state.expenseManager || {})
  
  // Use prop editingTransaction if provided, otherwise use Redux state
  const editingTransaction = propEditingTransaction || ui.editingTransaction
  const isEditing = !!editingTransaction
  
  // Determine if modal should be shown - use prop isOpen if provided, otherwise Redux state
  const shouldShow = isOpen !== undefined ? isOpen : ui.showExpenseModal
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    paymentMethod: 'Credit Card',
    date: new Date().toISOString().split('T')[0]
  })

  const [smartSuggestions, setSmartSuggestions] = useState({
    categoryPrediction: null,
    amountPrediction: null,
    paymentMethodPrediction: null,
    locationSuggestion: null,
    duplicateWarning: null
  })

  // Intelligent category prediction based on title
  const predictCategory = (title) => {
    if (!title || title.length < 2) return null
    
    const titleLower = title.toLowerCase()
    const categoryKeywords = {
      'Food': ['food', 'restaurant', 'cafe', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger', 'sandwich', 'snack', 'grocery', 'supermarket'],
      'Transportation': ['uber', 'taxi', 'bus', 'metro', 'fuel', 'gas', 'petrol', 'train', 'flight', 'parking'],
      'Shopping': ['amazon', 'flipkart', 'mall', 'store', 'clothing', 'shoes', 'electronics', 'mobile', 'laptop'],
      'Entertainment': ['movie', 'cinema', 'game', 'music', 'netflix', 'spotify', 'concert', 'party'],
      'Health': ['doctor', 'medicine', 'pharmacy', 'hospital', 'clinic', 'medical', 'health'],
      'Utilities': ['electricity', 'water', 'internet', 'phone', 'bill', 'recharge'],
      'Education': ['book', 'course', 'class', 'tuition', 'university', 'college', 'training']
    }

    for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => titleLower.includes(keyword))) {
        const category = categories.find(cat => cat.name === categoryName)
        return category || null
      }
    }
    return null
  }

  // Predict amount based on similar transactions
  const predictAmount = (title, category) => {
    if (!title || !category) return null
    
    const similarTransactions = transactions.filter(t => 
      t.type === 'expense' && 
      (t.category === category || t.title.toLowerCase().includes(title.toLowerCase().split(' ')[0]))
    ).slice(0, 5) // Last 5 similar transactions
    
    if (similarTransactions.length === 0) return null
    
    const avgAmount = similarTransactions.reduce((sum, t) => sum + t.amount, 0) / similarTransactions.length
    return Math.round(avgAmount)
  }

  // Predict payment method based on category and amount
  const predictPaymentMethod = (category, amount) => {
    const numAmount = parseFloat(amount)
    
    // Smart payment method suggestions
    if (numAmount < 100) return 'Cash'
    if (numAmount > 1000) return 'Credit Card'
    if (category === 'Transportation') return 'UPI'
    if (category === 'Food' && numAmount < 500) return 'UPI'
    
    return null
  }

  // Check for potential duplicate transactions
  const checkDuplicates = (title, amount, date) => {
    if (!title || !amount || !date) return null
    
    const today = new Date(date)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const recentSimilar = transactions.filter(t => {
      const tDate = new Date(t.date)
      return t.type === 'expense' &&
             Math.abs(t.amount - parseFloat(amount)) < 10 &&
             t.title.toLowerCase() === title.toLowerCase() &&
             tDate >= yesterday && tDate <= today
    })
    
    return recentSimilar.length > 0 ? recentSimilar[0] : null
  }

  // Update suggestions when form data changes
  useEffect(() => {
    const categoryPrediction = predictCategory(formData.title)
    const amountPrediction = predictAmount(formData.title, formData.category)
    const paymentMethodPrediction = predictPaymentMethod(formData.category, formData.amount)
    const duplicateWarning = checkDuplicates(formData.title, formData.amount, formData.date)
    
    setSmartSuggestions({
      categoryPrediction,
      amountPrediction,
      paymentMethodPrediction,
      locationSuggestion: null, // Could integrate with GPS
      duplicateWarning
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.title, formData.amount, formData.category, formData.date, transactions, categories])

  // Auto-apply suggestions
  const applySuggestion = (type, value) => {
    switch (type) {
      case 'category':
        setFormData(prev => ({ ...prev, category: value.id.toString() }))
        toast.success(`🎯 Category set to ${value.name}`)
        break
      case 'amount':
        setFormData(prev => ({ ...prev, amount: value.toString() }))
        toast.success(`💰 Amount suggested: ₹${value}`)
        break
      case 'paymentMethod':
        setFormData(prev => ({ ...prev, paymentMethod: value }))
        toast.success(`💳 Payment method set to ${value}`)
        break
    }
  }

  // Populate form when editing
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        title: editingTransaction.title || '',
        amount: editingTransaction.amount?.toString() || '',
        category: editingTransaction.category || '',
        description: editingTransaction.notes || '',
        paymentMethod: editingTransaction.paymentMethod || 'Credit Card',
        date: editingTransaction.date || new Date().toISOString().split('T')[0]
      })
    } else {
      setFormData({
        title: '',
        amount: '',
        category: '',
        description: '',
        paymentMethod: 'Credit Card',
        date: new Date().toISOString().split('T')[0]
      })
    }
  }, [editingTransaction])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.amount || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate amount
    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount greater than 0')
      return
    }

    if (isEditing) {
      // Update existing transaction
      dispatch(updateTransaction({
        id: editingTransaction.id,
        title: formData.title,
        amount: amount,
        category: formData.category,
        notes: formData.description,
        paymentMethod: formData.paymentMethod,
        date: formData.date
      }))
      toast.success('💳 Expense updated successfully!')
      dispatch(clearEditingTransaction())
    } else {
      // Add new transaction
      dispatch(addTransaction({
        title: formData.title,
        amount: amount,
        category: formData.category,
        notes: formData.description,
        paymentMethod: formData.paymentMethod,
        date: formData.date,
        type: "expense"
      }))
      toast.success('💳 Expense added successfully!')
    }

    setFormData({
      title: '',
      amount: '',
      category: '',
      description: '',
      paymentMethod: 'Credit Card',
      date: new Date().toISOString().split('T')[0]
    })
    
    // Close modal using the appropriate handler
    if (onClose) {
      onClose()
    } else {
      dispatch(toggleModal('showExpenseModal'))
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      dispatch(toggleModal('showExpenseModal'))
    }
    if (editingTransaction) {
      dispatch(clearEditingTransaction())
    }
    setFormData({
      title: '',
      amount: '',
      category: '',
      description: '',
      paymentMethod: 'Credit Card',
      date: new Date().toISOString().split('T')[0]
    })
  }

  if (!shouldShow) return null

  const currencySymbol = preferences?.currency === 'INR' ? '₹' : preferences?.currency === 'USD' ? '$' : preferences?.currency === 'EUR' ? '€' : '₹'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1b] rounded-2xl p-6 w-full max-w-lg border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              {isEditing ? 'Edit Expense' : 'Smart Add Expense'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {isEditing ? 'Update your expense details' : 'AI-powered expense tracking'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#0f0f10]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Smart Suggestions Panel */}
        {!isEditing && (smartSuggestions.categoryPrediction || smartSuggestions.amountPrediction || smartSuggestions.paymentMethodPrediction || smartSuggestions.duplicateWarning) && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Smart Suggestions
            </h3>
            
            {/* Duplicate Warning */}
            {smartSuggestions.duplicateWarning && (
              <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm font-medium">⚠️ Potential Duplicate</p>
                <p className="text-gray-300 text-xs mt-1">
                  Similar expense found: {smartSuggestions.duplicateWarning.title} - {currencySymbol}{smartSuggestions.duplicateWarning.amount}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {/* Category Suggestion */}
              {smartSuggestions.categoryPrediction && (
                <div className="flex items-center justify-between p-2 bg-[#0f0f10] rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{smartSuggestions.categoryPrediction.icon}</span>
                    <div>
                      <p className="text-white text-sm">Category: {smartSuggestions.categoryPrediction.name}</p>
                      <p className="text-gray-400 text-xs">Based on expense title</p>
                    </div>
                  </div>
                  <button
                    onClick={() => applySuggestion('category', smartSuggestions.categoryPrediction)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}

              {/* Amount Suggestion */}
              {smartSuggestions.amountPrediction && (
                <div className="flex items-center justify-between p-2 bg-[#0f0f10] rounded-lg">
                  <div>
                    <p className="text-white text-sm">Suggested: {currencySymbol}{smartSuggestions.amountPrediction}</p>
                    <p className="text-gray-400 text-xs">Based on similar expenses</p>
                  </div>
                  <button
                    onClick={() => applySuggestion('amount', smartSuggestions.amountPrediction)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}

              {/* Payment Method Suggestion */}
              {smartSuggestions.paymentMethodPrediction && (
                <div className="flex items-center justify-between p-2 bg-[#0f0f10] rounded-lg">
                  <div>
                    <p className="text-white text-sm">Payment: {smartSuggestions.paymentMethodPrediction}</p>
                    <p className="text-gray-400 text-xs">Recommended for this type</p>
                  </div>
                  <button
                    onClick={() => applySuggestion('paymentMethod', smartSuggestions.paymentMethodPrediction)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              What did you spend on? *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Lunch at restaurant"
              className="w-full bg-[#0f0f10] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#0f0f10] border border-gray-700 rounded-xl pl-8 pr-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full bg-[#0f0f10] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              className="w-full bg-[#0f0f10] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Paytm">Paytm</option>
              <option value="PhonePe">PhonePe</option>
              <option value="GPay">GPay</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full bg-[#0f0f10] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
              className="w-full bg-[#0f0f10] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
          >
            {isEditing ? 'Update Expense' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SmartAddExpenseModal
