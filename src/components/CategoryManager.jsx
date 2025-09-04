import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react'
import { addCategory, updateCategory, deleteCategory, toggleModal } from '../store/expenseManagerSlice'
import { getNextAvailableColor } from '../utils/autoColorAssignment'

// CategoryManager component with arrow function approach
const CategoryManager = (props) => {
  const { isOpen: propIsOpen, onClose: propOnClose, editingCategory: propEditing } = props || {}
  const dispatch = useDispatch()
  
  // Extra defensive Redux state access
  const rawState = useSelector(state => state?.expenseManager)
  
  let state, categories, ui, preferences
  try {
    state = rawState || {}
    categories = state.categories || []
    ui = state.ui || {}
    preferences = state.preferences || { currency: 'INR', name: 'User', theme: 'dark' }
  } catch (error) {
    console.error('Error processing Redux state:', error)
    // Fallback values
    state = {}
    categories = []
    ui = {}
    preferences = { currency: 'INR', name: 'User', theme: 'dark' }
  }

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', icon: '', budget: '', description: '' })

  const isOpen = propIsOpen !== undefined ? propIsOpen : ui.showCategoryModal
  const close = useCallback(() => {
    if (propOnClose) propOnClose(); else dispatch(toggleModal('showCategoryModal'))
    setShowForm(false)
    setEditing(null)
    setForm({ name: '', icon: '', budget: '', description: '' })
  }, [propOnClose, dispatch])

  // Sync when external editing category is provided
  useEffect(() => {
    if (propEditing) {
      setEditing(propEditing)
      setForm({
        name: propEditing.name || '',
        icon: propEditing.icon || '',
        budget: String(propEditing.budget ?? ''),
        description: propEditing.description || ''
      })
      setShowForm(true)
    }
  }, [propEditing])

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  const availableIcons = useMemo(() => [
    '🍽️','🛒','🍕','☕','🍔','🥗',
    '🚗','⛽','🚌','🚕','🚲','✈️',
    '🎬','🎮','📚','🎵','🏃','⚽',
    '⚡','💡','🌊','📱','📶','🔥',
    '💊','🏥','💪','🧘','🏋️','🦷',
    '👕','👠','💍','🎁','🛍️','💻',
    '🏠','🛏️','🪑','🔧','🧹','🌱',
    '🎉','🍰','💐','🎈','🎊','🥳',
    '🐕','🐱','🐠','🐦','🌿','🦮',
    '💰','💳','🏦','📈','💸','🪙',
    '🎯','⭐','🎪','🎭','🎨','🎪'
  ], [])

  // Safer currency symbol with complete null safety
  const getCurrencySymbol = () => {
    try {
      // Double-check preferences exists at execution time
      if (!preferences || typeof preferences !== 'object') {
        console.warn('preferences not available in getCurrencySymbol')
        return '₹'
      }
      
      const currency = preferences.currency // Safe to access now
      if (!currency) return '₹'
      
      switch (currency) {
        case 'USD': return '$'
        case 'EUR': return '€'
        case 'INR': return '₹'
        default: return '₹'
      }
    } catch (error) {
      console.error('Error in getCurrencySymbol:', error)
      return '₹'
    }
  }
  
  const currencySymbol = getCurrencySymbol()

  const onSubmit = (e) => {
    e.preventDefault()
    const name = form.name.trim()
    if (!name || !form.icon) return
    
    // Auto-assign color for new categories
    const autoColor = editing?.color || getNextAvailableColor(categories)
    
    const payload = {
      name,
      icon: form.icon,
      color: autoColor,
      budget: Number(form.budget) || 0,
      description: form.description?.trim() || ''
    }
    if (editing) {
      dispatch(updateCategory({ id: editing.id, ...payload }))
    } else {
      dispatch(addCategory(payload))
    }
    setShowForm(false)
    setEditing(null)
    setForm({ name: '', icon: '', budget: '', description: '' })
  }

  const onEdit = (cat) => {
    setEditing(cat)
    setForm({
      name: cat.name,
      icon: cat.icon,
      budget: String(cat.budget ?? ''),
      description: cat.description || ''
    })
    setShowForm(true)
  }

  const onDelete = (id) => {
    if (window.confirm('Delete this category? This cannot be undone.')) {
      dispatch(deleteCategory(id))
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-hidden"
      onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <div className="bg-[#1a1a1b] rounded-2xl w-full max-w-6xl h-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white truncate">Manage Categories</h2>
              <p className="text-gray-400 mt-1 text-sm sm:text-base truncate">Create and customize your expense categories</p>
            </div>
            <button onClick={close} className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#0f0f10] flex-shrink-0">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Categories List */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-700 lg:border-b-0 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <h3 className="text-lg font-semibold text-white">Your Categories</h3>
                <button
                  onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', icon: '', budget: '', description: '' }) }}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-xl transition-all text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {categories.map((c) => (
                  <div key={c.id} className="bg-[#252527] rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-gray-600 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-lg sm:text-xl flex-shrink-0"
                          style={{ backgroundColor: (c.color || '#FF6B6B') + '20', color: c.color || '#FF6B6B' }}
                        >
                          {c.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white font-medium text-sm sm:text-base truncate">{c.name}</h4>
                          <p className="text-gray-400 text-xs sm:text-sm">Budget: {currencySymbol}{Number(c.budget || 0).toFixed(0)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button onClick={() => onEdit(c)} className="text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-blue-500/10">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(c.id)} className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {c.description ? <p className="text-gray-500 text-sm mt-2 break-words">{c.description}</p> : null}
                  </div>
                ))}

                {categories.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-4xl sm:text-6xl mb-4">📝</div>
                    <h4 className="text-lg sm:text-xl font-semibold text-white mb-2">No categories yet</h4>
                    <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Create your first category to start organizing expenses</p>
                    <button
                      onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', icon: '', budget: '', description: '' }) }}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-xl transition-all font-medium text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Create First Category
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col min-h-0 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-800 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-white">{editing ? 'Edit Category' : 'Add New Category'}</h3>
                  <button onClick={() => { setShowForm(false); setEditing(null) }} className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#0f0f10]">
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Category Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[#1a1a1b] border border-gray-700 rounded-lg px-3 py-2.5 sm:py-3 text-white focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                      placeholder="e.g., Food & Dining"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Choose Icon *</label>
                    <div className="grid grid-cols-8 sm:grid-cols-6 gap-1.5 sm:gap-2 max-h-28 sm:max-h-32 overflow-y-auto p-2 bg-[#0f0f10] rounded-lg border border-gray-700 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                      {availableIcons.map((ic, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, icon: ic }))}
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm sm:text-lg transition-all hover:scale-110 ${form.icon === ic ? 'bg-orange-500 ring-2 ring-orange-400' : 'hover:bg-gray-700'}`}
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Monthly Budget</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.budget}
                      onChange={(e) => setForm(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full bg-[#1a1a1b] border border-gray-700 rounded-lg px-3 py-2.5 sm:py-3 text-white focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                    <textarea
                      rows="3"
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-[#1a1a1b] border border-gray-700 rounded-lg px-3 py-2.5 sm:py-3 text-white focus:border-orange-500 focus:outline-none resize-none text-sm sm:text-base"
                      placeholder="Brief description of this category..."
                    />
                  </div>
                </form>
              </div>

              <div className="p-4 sm:p-6 border-t border-gray-800 flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2.5 sm:py-3 rounded-xl transition-colors text-sm sm:text-base">Cancel</button>
                  <button type="submit" onClick={onSubmit} disabled={!form.name || !form.icon} className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                    <Check className="w-4 h-4" />
                    {editing ? 'Update' : 'Create'} Category
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryManager