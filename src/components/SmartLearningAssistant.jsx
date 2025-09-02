import React, { useState, useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  GraduationCap, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Award,
  BookOpen,
  Lightbulb,
  CheckCircle,
  XCircle,
  Star,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

const SmartLearningAssistant = () => {
  const { transactions = [], budget = {}, categories = [], preferences = {} } = useSelector(state => state.expenseManager || {})
  
  const [completedLessons, setCompletedLessons] = useState(() => {
    const saved = localStorage.getItem('expenseManager_completedLessons')
    return saved ? JSON.parse(saved) : []
  })
  
  const [userLevel, setUserLevel] = useState(() => {
    const saved = localStorage.getItem('expenseManager_userLevel')
    return saved ? JSON.parse(saved) : { level: 1, xp: 0, streak: 0 }
  })

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('expenseManager_completedLessons', JSON.stringify(completedLessons))
    localStorage.setItem('expenseManager_userLevel', JSON.stringify(userLevel))
  }, [completedLessons, userLevel])

  // Dynamic learning curriculum based on user behavior
  const learningCurriculum = useMemo(() => {
    const getCurrencySymbol = () => {
      switch (preferences?.currency) {
        case 'USD': return '$'
        case 'EUR': return '€' 
        case 'INR': return '₹'
        default: return '₹'
      }
    }
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const monthlyExpenses = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear && 
             t.type === 'expense'
    })

    const totalSpent = monthlyExpenses.reduce((sum, t) => sum + t.amount, 0)
    const monthlyBudget = budget?.monthlyLimit || 7000
    const budgetUtilization = (totalSpent / monthlyBudget) * 100

    const lessons = [
      // Beginner Lessons
      {
        id: 'budget-basics',
        level: 1,
        title: 'Budget Fundamentals',
        description: 'Learn the 50/30/20 rule and create your first budget',
        xpReward: 100,
        difficulty: 'Beginner',
        estimatedTime: '5 min',
        icon: Target,
        available: true,
        content: {
          theory: 'The 50/30/20 rule: 50% needs, 30% wants, 20% savings. This creates a balanced approach to money management.',
          practice: `Your current budget is ${getCurrencySymbol()}${monthlyBudget}. According to 50/30/20: Needs: ${getCurrencySymbol()}${(monthlyBudget * 0.5).toFixed(0)}, Wants: ${getCurrencySymbol()}${(monthlyBudget * 0.3).toFixed(0)}, Savings: ${getCurrencySymbol()}${(monthlyBudget * 0.2).toFixed(0)}`,
          actionable: true
        }
      },
      {
        id: 'expense-categorization',
        level: 1,
        title: 'Smart Categorization',
        description: 'Master the art of categorizing expenses for better insights',
        xpReward: 75,
        difficulty: 'Beginner',
        estimatedTime: '3 min',
        icon: BookOpen,
        available: transactions.length >= 5,
        content: {
          theory: 'Proper categorization reveals spending patterns and helps identify areas for optimization.',
          practice: `You have ${categories.length} categories. Categories with most spending: ${
            Object.entries(monthlyExpenses.reduce((acc, t) => {
              const cat = categories.find(c => c.id.toString() === t.category.toString())
              const name = cat?.name || 'Other'
              acc[name] = (acc[name] || 0) + t.amount
              return acc
            }, {})).sort(([,a], [,b]) => b - a).slice(0, 3).map(([name, amount]) => `${name}: ${getCurrencySymbol()}${amount.toFixed(0)}`).join(', ')
          }`,
          actionable: true
        }
      },
      
      // Intermediate Lessons
      {
        id: 'spending-velocity',
        level: 2,
        title: 'Understanding Spending Velocity',
        description: 'Learn how your spending speed affects your financial health',
        xpReward: 150,
        difficulty: 'Intermediate',
        estimatedTime: '7 min',
        icon: TrendingUp,
        available: transactions.length >= 15 && userLevel.level >= 2,
        content: {
          theory: 'Spending velocity is the rate at which you spend money. Consistent velocity is better than erratic patterns.',
          practice: `Your current spending velocity: ${(totalSpent / now.getDate()).toFixed(2)} per day. At this rate, you'll spend ${getCurrencySymbol()}${((totalSpent / now.getDate()) * 30).toFixed(0)} this month.`,
          actionable: budgetUtilization > 80
        }
      },
      {
        id: 'payment-method-optimization',
        level: 2,
        title: 'Payment Method Strategy',
        description: 'Optimize your payment methods for rewards and tracking',
        xpReward: 125,
        difficulty: 'Intermediate',
        estimatedTime: '6 min',
        icon: DollarSign,
        available: monthlyExpenses.length >= 10 && userLevel.level >= 2,
        content: {
          theory: 'Different payment methods offer different benefits: credit cards for rewards, debit for control, cash for small purchases.',
          practice: `Your payment method distribution: ${Object.entries(monthlyExpenses.reduce((acc, t) => {
            acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1
            return acc
          }, {})).map(([method, count]) => `${method}: ${count} transactions`).join(', ')}`,
          actionable: true
        }
      },
      
      // Advanced Lessons
      {
        id: 'behavioral-economics',
        level: 3,
        title: 'Behavioral Finance Hacks',
        description: 'Use psychology to improve your spending habits',
        xpReward: 200,
        difficulty: 'Advanced',
        estimatedTime: '10 min',
        icon: GraduationCap,
        available: userLevel.level >= 3 && monthlyExpenses.length >= 20,
        content: {
          theory: 'Mental accounting, loss aversion, and anchoring bias affect spending decisions. Understanding these helps make better choices.',
          practice: 'Implement the 24-hour rule for purchases over $100, use envelope budgeting for discretionary spending, and set up automatic transfers for savings.',
          actionable: true
        }
      },
      {
        id: 'advanced-analytics',
        level: 3,
        title: 'Financial Data Science',
        description: 'Interpret your spending data like a pro',
        xpReward: 250,
        difficulty: 'Advanced',
        estimatedTime: '12 min',
        icon: Zap,
        available: userLevel.level >= 3 && transactions.length >= 50,
        content: {
          theory: 'Use statistical analysis to identify trends, predict future spending, and optimize budget allocation.',
          practice: `Your spending variance: ${Math.sqrt(monthlyExpenses.reduce((sum, t) => sum + Math.pow(t.amount - (totalSpent / monthlyExpenses.length), 2), 0) / monthlyExpenses.length).toFixed(2)}. Lower variance indicates consistent spending habits.`,
          actionable: true
        }
      }
    ]

    return lessons.filter(lesson => lesson.available)
  }, [transactions, budget, categories, userLevel.level, preferences])

  const availableLessons = learningCurriculum.filter(lesson => !completedLessons.includes(lesson.id))
  const nextLesson = availableLessons[0]

  const completeLesson = (lessonId, xpReward) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons(prev => [...prev, lessonId])
      
      const newXP = userLevel.xp + xpReward
      const newLevel = Math.floor(newXP / 500) + 1
      const newStreak = userLevel.streak + 1
      
      setUserLevel({
        level: newLevel,
        xp: newXP,
        streak: newStreak
      })
      
      toast.success(`🎓 Lesson completed! +${xpReward} XP`, {
        duration: 3000,
        icon: '🎯'
      })
      
      if (newLevel > userLevel.level) {
        toast.success(`🎉 Level Up! You're now Level ${newLevel}`, {
          duration: 4000,
          icon: '🚀'
        })
      }
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'green'
      case 'Intermediate': return 'yellow'
      case 'Advanced': return 'red'
      default: return 'gray'
    }
  }

  const getProgressPercentage = () => {
    return (completedLessons.length / learningCurriculum.length) * 100
  }

  const getXPToNextLevel = () => {
    const nextLevelXP = userLevel.level * 500
    return nextLevelXP - userLevel.xp
  }

  const getLevelProgress = () => {
    const currentLevelXP = (userLevel.level - 1) * 500
    const nextLevelXP = userLevel.level * 500
    const progress = ((userLevel.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    return Math.max(0, Math.min(100, progress))
  }

  return (
    <div className="bg-[#1a1a1b] rounded-xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold">Smart Learning Assistant</h3>
          <p className="text-gray-400 text-sm">Personalized financial education</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-medium">Level {userLevel.level}</span>
          </div>
          <p className="text-gray-400 text-xs">{userLevel.xp} XP</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white text-sm font-medium">Learning Progress</span>
            <span className="text-gray-400 text-sm">{completedLessons.length}/{learningCurriculum.length} completed</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white text-sm font-medium">Level Progress</span>
            <span className="text-gray-400 text-sm">{getXPToNextLevel()} XP to next level</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${getLevelProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Next Lesson */}
      {nextLesson ? (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 bg-${getDifficultyColor(nextLesson.difficulty)}-500/20 rounded-lg flex items-center justify-center flex-shrink-0`}>
              <nextLesson.icon className={`w-4 h-4 text-${getDifficultyColor(nextLesson.difficulty)}-400`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-white font-medium">{nextLesson.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full bg-${getDifficultyColor(nextLesson.difficulty)}-500/20 text-${getDifficultyColor(nextLesson.difficulty)}-400`}>
                  {nextLesson.difficulty}
                </span>
                <span className="text-xs text-gray-400">{nextLesson.estimatedTime}</span>
              </div>
              <p className="text-gray-300 text-sm mb-3">{nextLesson.description}</p>
              
              <div className="bg-gray-900/50 p-3 rounded-lg mb-3">
                <h5 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  Theory
                </h5>
                <p className="text-gray-300 text-sm mb-3">{nextLesson.content.theory}</p>
                
                <h5 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  Your Data
                </h5>
                <p className="text-gray-300 text-sm">{nextLesson.content.practice}</p>
              </div>

              <button
                onClick={() => completeLesson(nextLesson.id, nextLesson.xpReward)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Complete Lesson (+{nextLesson.xpReward} XP)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl text-center">
          <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h4 className="text-white font-medium mb-1">All Lessons Completed!</h4>
          <p className="text-gray-300 text-sm">You've mastered all available lessons. Keep tracking expenses to unlock more!</p>
        </div>
      )}

      {/* Achievements */}
      <div className="space-y-3">
        <h4 className="text-white font-medium flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-400" />
          Recent Achievements
        </h4>
        
        <div className="grid grid-cols-1 gap-2">
          {completedLessons.slice(-3).map(lessonId => {
            const lesson = learningCurriculum.find(l => l.id === lessonId)
            if (!lesson) return null
            
            return (
              <div key={lessonId} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <div className="flex-1">
                  <span className="text-white text-sm font-medium">{lesson.title}</span>
                  <span className="text-gray-400 text-xs ml-2">+{lesson.xpReward} XP</span>
                </div>
              </div>
            )
          })}
        </div>

        {userLevel.streak > 0 && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-medium text-sm">
                {userLevel.streak} Day Learning Streak! 🔥
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SmartLearningAssistant
