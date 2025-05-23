import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'

export default function Home() {
  const [darkMode, setDarkMode] = useState(false)
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  })
  const navigate = useNavigate()

  useEffect(() => {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      const isDark = savedDarkMode === 'true'
      setDarkMode(isDark)
      if (isDark) {
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  const handleStatsUpdate = useCallback((tasks) => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.isCompleted).length
    const pendingTasks = totalTasks - completedTasks
    
    setStats({ totalTasks, completedTasks, pendingTasks })
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary/5 to-secondary/5 dark:from-surface-900 dark:via-surface-800 dark:to-surface-700 transition-all duration-300">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-soft">
                  <ApperIcon name="CheckSquare" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  TaskFlow
                </h1>
                <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400">
                  Organize • Track • Achieve
                </p>
              </div>
            </motion.div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/calendar')}
                className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-xl hover:bg-secondary/20 transition-all duration-200"
              >
                <ApperIcon name="Calendar" className="w-5 h-5" />
                Calendar
              </motion.button>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="neu-light dark:bg-surface-800 dark:shadow-neu-dark p-3 rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                <ApperIcon 
                  name={darkMode ? "Sun" : "Moon"} 
                  className="w-5 h-5 text-surface-700 dark:text-surface-300" 
                />
              </motion.button>
            </div>
          </div>

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
          >
            <div className="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-card border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ApperIcon name="List" className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white">
                    {stats.totalTasks}
                  </p>
                  <p className="text-sm text-surface-600 dark:text-surface-400">Total Tasks</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-card border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <ApperIcon name="CheckCircle" className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white">
                    {stats.completedTasks}
                  </p>
                  <p className="text-sm text-surface-600 dark:text-surface-400">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-card border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <ApperIcon name="Clock" className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white">
                    {stats.pendingTasks}
                  </p>
                  <p className="text-sm text-surface-600 dark:text-surface-400">Pending</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MainFeature onStatsUpdate={handleStatsUpdate} />
        </motion.div>
      </main>

      {/* Floating Elements */}
      <div className="fixed top-1/4 left-4 w-20 h-20 bg-primary/5 rounded-full blur-xl float-animation hidden lg:block"></div>
      <div className="fixed bottom-1/4 right-8 w-32 h-32 bg-secondary/5 rounded-full blur-xl float-animation hidden lg:block" style={{ animationDelay: '1s' }}></div>
    </div>
  )
}
              <ApperIcon name="Calendar" className="w-5 h-5" />
              Calendar
            </motion.button>
                <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400">
                  Organize • Track • Achieve
                </p>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="self-start sm:self-auto neu-light dark:bg-surface-800 dark:shadow-neu-dark p-3 rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              <ApperIcon 
                name={darkMode ? "Sun" : "Moon"} 
                className="w-5 h-5 text-surface-700 dark:text-surface-300" 
              />
            </motion.button>
          </div>

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
          >
            <div className="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-card border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ApperIcon name="List" className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white">
                    {stats.totalTasks}
                  </p>
                  <p className="text-sm text-surface-600 dark:text-surface-400">Total Tasks</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-card border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <ApperIcon name="CheckCircle" className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white">
                    {stats.completedTasks}
                  </p>
                  <p className="text-sm text-surface-600 dark:text-surface-400">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-card border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <ApperIcon name="Clock" className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white">
                    {stats.pendingTasks}
                  </p>
                  <p className="text-sm text-surface-600 dark:text-surface-400">Pending</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MainFeature onStatsUpdate={handleStatsUpdate} />
        </motion.div>
      </main>

      {/* Floating Elements */}
      <div className="fixed top-1/4 left-4 w-20 h-20 bg-primary/5 rounded-full blur-xl float-animation hidden lg:block"></div>
      <div className="fixed bottom-1/4 right-8 w-32 h-32 bg-secondary/5 rounded-full blur-xl float-animation hidden lg:block" style={{ animationDelay: '1s' }}></div>
    </div>
  )
}