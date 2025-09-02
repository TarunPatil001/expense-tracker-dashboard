// Advanced Budget Calculator with Creative Rebalancing Strategies
// This utility provides intelligent budget management when users exceed their limits

/**
 * Smart Budget Rebalancing Strategies
 * When users exceed their daily/monthly limits, these strategies help them recover
 */

// Strategy 1: Adaptive Daily Limit Reduction
export const calculateAdaptiveDailyLimit = (monthlyBudget, totalSpent, currentDay, daysInMonth) => {
  const daysRemaining = daysInMonth - currentDay
  const budgetRemaining = monthlyBudget - totalSpent
  
  if (daysRemaining <= 0) {
    return {
      strategy: 'month_ended',
      newDailyLimit: 0,
      message: 'Month has ended',
      feasible: false
    }
  }
  
  if (budgetRemaining <= 0) {
    return {
      strategy: 'emergency_mode',
      newDailyLimit: 0,
      message: 'Budget exhausted - Emergency mode activated',
      feasible: false,
      recommendedActions: [
        'Stop all non-essential spending',
        'Find alternative income sources',
        'Use emergency fund if available'
      ]
    }
  }
  
  const newDailyLimit = budgetRemaining / daysRemaining
  const originalDailyLimit = monthlyBudget / daysInMonth
  const reductionPercentage = ((originalDailyLimit - newDailyLimit) / originalDailyLimit) * 100
  
  // Check if reduction is feasible (not more than 70% reduction)
  const feasible = newDailyLimit >= originalDailyLimit * 0.3
  
  return {
    strategy: 'adaptive_reduction',
    newDailyLimit: Math.max(newDailyLimit, 0),
    originalDailyLimit,
    reductionPercentage,
    feasible,
    message: feasible 
      ? `Reduce daily spending to ₹${newDailyLimit.toFixed(0)}/day`
      : `Required reduction (${reductionPercentage.toFixed(0)}%) may be too drastic`,
    recommendedActions: feasible ? [
      'Track every expense',
      'Cut non-essential purchases',
      'Cook at home more often',
      'Use public transport'
    ] : [
      'Consider weekly budget reset',
      'Find additional income',
      'Use emergency strategies'
    ]
  }
}

// Strategy 2: Weekly Budget Rebalancing
export const calculateWeeklyRebalancing = (monthlyBudget, totalSpent, currentDay, daysInMonth) => {
  const daysRemaining = daysInMonth - currentDay
  const budgetRemaining = monthlyBudget - totalSpent
  const weeksRemaining = Math.ceil(daysRemaining / 7)
  
  if (weeksRemaining <= 0) {
    return {
      strategy: 'weekly_ended',
      weeklyBudget: 0,
      message: 'No weeks remaining',
      feasible: false
    }
  }
  
  const weeklyBudget = budgetRemaining / weeksRemaining
  const originalWeeklyBudget = monthlyBudget / Math.ceil(daysInMonth / 7)
  
  return {
    strategy: 'weekly_rebalancing',
    weeklyBudget: Math.max(weeklyBudget, 0),
    originalWeeklyBudget,
    weeksRemaining,
    flexibility: 'High',
    message: `₹${weeklyBudget.toFixed(0)} per week for ${weeksRemaining} weeks`,
    benefits: [
      'More flexibility in daily spending',
      'Can handle irregular expenses better',
      'Easier to track and adjust',
      'Less stress from daily limits'
    ]
  }
}

// Strategy 3: Productive Category Investment
export const calculateProductiveInvestment = (totalSpent, currentDay, daysInMonth, monthlyBudget, categories) => {
  const originalDailyLimit = monthlyBudget / daysInMonth
  const overspendAmount = Math.max(0, totalSpent - (originalDailyLimit * currentDay))
  
  // Define productive categories
  const productiveCategories = categories.filter(cat => 
    ['Education', 'Health', 'Investment', 'Skill Development', 'Books', 'Courses', 'Fitness', 'Medical'].includes(cat.name)
  )
  
  // Calculate ROI potential for productive spending
  const productiveROI = {
    'Education': { multiplier: 3, timeframe: '6-12 months' },
    'Health': { multiplier: 2, timeframe: '3-6 months' },
    'Investment': { multiplier: 1.5, timeframe: '12+ months' },
    'Skill Development': { multiplier: 4, timeframe: '3-9 months' },
    'Books': { multiplier: 2.5, timeframe: '1-3 months' },
    'Courses': { multiplier: 3.5, timeframe: '3-6 months' },
    'Fitness': { multiplier: 2, timeframe: '3-6 months' },
    'Medical': { multiplier: 5, timeframe: 'Immediate' }
  }
  
  return {
    strategy: 'productive_investment',
    overspendAmount,
    productiveCategories: productiveCategories.map(cat => ({
      ...cat,
      roi: productiveROI[cat.name] || { multiplier: 1, timeframe: 'Variable' }
    })),
    recommendations: [
      'Redirect overspend to high-ROI categories',
      'Invest in future earning potential',
      'Health investments save money long-term',
      'Education compounds over time'
    ],
    message: overspendAmount > 0 
      ? `Convert ₹${overspendAmount.toFixed(0)} overspend into productive investment`
      : 'Consider allocating future overspend to growth categories'
  }
}

// Strategy 4: Income Generation Plan
export const calculateIncomeGeneration = (overspendAmount, daysRemaining) => {
  const dailyIncomeTarget = daysRemaining > 0 ? overspendAmount / daysRemaining : overspendAmount
  
  // Income generation suggestions based on amount needed
  const getIncomeSuggestions = (amount) => {
    if (amount <= 500) {
      return [
        { method: 'Sell unused items', potential: '₹200-500', effort: 'Low' },
        { method: 'Freelance gigs', potential: '₹300-800', effort: 'Medium' },
        { method: 'Food delivery', potential: '₹400-600/day', effort: 'Medium' },
        { method: 'Online surveys', potential: '₹100-300', effort: 'Low' }
      ]
    } else if (amount <= 2000) {
      return [
        { method: 'Part-time work', potential: '₹500-1000/day', effort: 'High' },
        { method: 'Skill-based freelancing', potential: '₹1000-3000', effort: 'Medium' },
        { method: 'Tutoring/Teaching', potential: '₹300-800/hour', effort: 'Medium' },
        { method: 'Digital services', potential: '₹500-2000', effort: 'Medium' }
      ]
    } else {
      return [
        { method: 'Consulting work', potential: '₹2000-5000', effort: 'High' },
        { method: 'Project-based work', potential: '₹3000-10000', effort: 'High' },
        { method: 'Emergency freelancing', potential: '₹1000-3000/day', effort: 'High' },
        { method: 'Sell valuable items', potential: '₹2000-10000', effort: 'Medium' }
      ]
    }
  }
  
  return {
    strategy: 'income_generation',
    targetAmount: overspendAmount,
    dailyIncomeTarget,
    suggestions: getIncomeSuggestions(overspendAmount),
    timeline: `${daysRemaining} days to generate ₹${overspendAmount.toFixed(0)}`,
    tips: [
      'Start with lowest effort, highest return options',
      'Leverage existing skills and resources',
      'Consider recurring income opportunities',
      'Track income generation progress daily'
    ]
  }
}

// Strategy 5: Emergency Cost Cutting
export const calculateEmergencyCutting = (totalSpent, monthlyBudget, currentDay, daysInMonth, transactions) => {
  const budgetRemaining = monthlyBudget - totalSpent
  const daysRemaining = daysInMonth - currentDay
  
  // Analyze spending patterns to find cuts
  const categorySpending = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'expense') {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
    }
    return acc
  }, {})
  
  // Define cutting priorities (higher priority = easier to cut)
  const cuttingPriority = {
    'Entertainment': { priority: 9, potential: 80 },
    'Dining Out': { priority: 8, potential: 70 },
    'Shopping': { priority: 7, potential: 60 },
    'Transportation': { priority: 6, potential: 40 },
    'Subscriptions': { priority: 8, potential: 90 },
    'Miscellaneous': { priority: 7, potential: 50 },
    'Food': { priority: 4, potential: 30 },
    'Health': { priority: 2, potential: 10 },
    'Utilities': { priority: 3, potential: 20 }
  }
  
  const cuttingSuggestions = Object.entries(categorySpending)
    .map(([category, amount]) => ({
      category,
      currentSpending: amount,
      priority: cuttingPriority[category]?.priority || 5,
      potentialSavings: amount * (cuttingPriority[category]?.potential || 30) / 100,
      suggestions: getCuttingSuggestions(category)
    }))
    .sort((a, b) => b.priority - a.priority)
  
  const totalPotentialSavings = cuttingSuggestions.reduce((sum, item) => sum + item.potentialSavings, 0)
  
  return {
    strategy: 'emergency_cutting',
    budgetShortfall: Math.abs(budgetRemaining),
    daysRemaining,
    cuttingSuggestions: cuttingSuggestions.slice(0, 5), // Top 5 categories
    totalPotentialSavings,
    feasible: totalPotentialSavings >= Math.abs(budgetRemaining) * 0.8,
    urgency: budgetRemaining <= 0 ? 'Critical' : 'High'
  }
}

// Helper function for category-specific cutting suggestions
const getCuttingSuggestions = (category) => {
  const suggestions = {
    'Entertainment': [
      'Use free entertainment options',
      'Share subscriptions with family',
      'Look for discount deals',
      'Choose home entertainment'
    ],
    'Dining Out': [
      'Cook meals at home',
      'Pack lunch for work',
      'Use discount coupons',
      'Choose budget restaurants'
    ],
    'Shopping': [
      'Make a shopping list and stick to it',
      'Wait 24 hours before purchases',
      'Compare prices online',
      'Buy only necessities'
    ],
    'Transportation': [
      'Use public transport',
      'Carpool with colleagues',
      'Walk for short distances',
      'Combine multiple trips'
    ]
  }
  
  return suggestions[category] || [
    'Review necessity of expenses',
    'Look for alternatives',
    'Negotiate better deals',
    'Delay non-urgent purchases'
  ]
}

// Master function to get all rebalancing strategies
export const getAllRebalancingStrategies = (params) => {
  const { monthlyBudget, totalSpent, currentDay, daysInMonth, categories = [], transactions = [] } = params
  
  return {
    adaptiveLimit: calculateAdaptiveDailyLimit(monthlyBudget, totalSpent, currentDay, daysInMonth),
    weeklyReset: calculateWeeklyRebalancing(monthlyBudget, totalSpent, currentDay, daysInMonth),
    productiveInvestment: calculateProductiveInvestment(totalSpent, currentDay, daysInMonth, monthlyBudget, categories),
    incomeGeneration: calculateIncomeGeneration(Math.max(0, totalSpent - (monthlyBudget * currentDay / daysInMonth)), daysInMonth - currentDay),
    emergencyCutting: calculateEmergencyCutting(totalSpent, monthlyBudget, currentDay, daysInMonth, transactions)
  }
}

// Utility to determine the best strategy based on user situation
export const recommendBestStrategy = (strategies, userPreferences = {}) => {
  const { adaptiveLimit, productiveInvestment, incomeGeneration, emergencyCutting } = strategies
  
  // Score each strategy based on feasibility and user situation
  const scores = {
    adaptiveLimit: adaptiveLimit.feasible ? 8 : 3,
    weeklyReset: 7, // Always moderately good option
    productiveInvestment: productiveInvestment.productiveCategories.length > 0 ? 9 : 5,
    incomeGeneration: incomeGeneration.targetAmount < 2000 ? 6 : 4,
    emergencyCutting: emergencyCutting.feasible ? 7 : 5
  }
  
  // Adjust scores based on user preferences
  if (userPreferences.riskTolerance === 'low') {
    scores.adaptiveLimit += 2
    scores.emergencyCutting += 2
  } else if (userPreferences.riskTolerance === 'high') {
    scores.incomeGeneration += 2
    scores.productiveInvestment += 2
  }
  
  // Find the highest scoring strategy
  const bestStrategy = Object.entries(scores).reduce((best, [strategy, score]) => 
    score > best.score ? { strategy, score } : best
  , { strategy: 'adaptiveLimit', score: 0 })
  
  return {
    recommended: bestStrategy.strategy,
    allScores: scores,
    reasoning: getStrategyReasoning(bestStrategy.strategy)
  }
}

const getStrategyReasoning = (strategy) => {
  const reasonings = {
    adaptiveLimit: 'Best for maintaining strict budget control with manageable daily limits',
    weeklyReset: 'Provides flexibility while maintaining overall budget discipline',
    productiveInvestment: 'Turns overspending into future financial growth opportunities',
    incomeGeneration: 'Actively addresses budget shortfall through additional earnings',
    emergencyCutting: 'Immediate cost reduction to prevent further budget damage'
  }
  
  return reasonings[strategy] || 'Balanced approach to budget management'
}
