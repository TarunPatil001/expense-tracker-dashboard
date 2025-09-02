import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  addTransaction, 
  updateTransaction,
  toggleModal,
  clearEditingTransaction
} from '../store/expenseManagerSlice'

const AddExpenseModal = () => {
  const dispatch = useDispatch()
  const { 
    categories = [], 
    ui = {}, 
    preferences = {} 
  } = useSelector(state => state.expenseManager || {})
  
  const { editingTransaction } = ui
  const isEditing = !!editingTransaction
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    paymentMethod: 'Credit Card',
    date: new Date().toISOString().split('T')[0]
  })

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
    
    dispatch(toggleModal('showExpenseModal'))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    dispatch(toggleModal('showExpenseModal'))
    dispatch(clearEditingTransaction())
    setFormData({
      title: '',
      amount: '',
      category: '',
      description: '',
      paymentMethod: 'Credit Card',
      date: new Date().toISOString().split('T')[0]
    })
  }

  if (!ui.showExpenseModal) return null

  const currencySymbol = preferences?.currency === 'INR' ? '₹' : preferences?.currency === 'USD' ? '$' : preferences?.currency === 'EUR' ? '€' : '₹'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1b] rounded-2xl p-6 w-full max-w-md border border-gray-800 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {isEditing ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {isEditing ? 'Update your expense details' : 'Track your spending'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#0f0f10]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expense Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full bg-[#0f0f10] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="e.g., Grocery shopping"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full bg-[#0f0f10] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category *
            </label>
            {categories.length > 0 ? (
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full bg-[#0f0f10] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full bg-[#0f0f10] border border-gray-700 rounded-xl px-4 py-3 text-center">
                <p className="text-gray-400 text-sm mb-2">No categories available</p>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(toggleModal('showExpenseModal'))
                    dispatch(toggleModal('showCategoryModal'))
                  }}
                  className="text-orange-500 hover:text-orange-400 text-sm font-medium"
                >
                  Create a category first →
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="w-full bg-[#0f0f10] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
              >
                {['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'].map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full bg-[#0f0f10] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full bg-[#0f0f10] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none resize-none transition-colors"
              rows="3"
              placeholder="Add notes about this expense..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title || !formData.amount || !formData.category || categories.length === 0}
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all shadow-lg"
            >
              {categories.length === 0 
                ? 'Create Categories First' 
                : isEditing 
                  ? 'Update Expense' 
                  : 'Add Expense'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddExpenseModal
