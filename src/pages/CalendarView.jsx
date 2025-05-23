import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Calendar from '../components/Calendar'
import ApperIcon from '../components/ApperIcon'

export default function CalendarView() {
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow-tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  const handleTaskEdit = (task) => {
    setSelectedTask(task)
    // Navigate back to home with task editing state
    navigate('/', { state: { editTask: task } })
  }

  const handleTaskUpdate = (updatedTasks) => {
    setTasks(updatedTasks)
    localStorage.setItem('taskflow-tasks', JSON.stringify(updatedTasks))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-surface-100 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white mb-2"
              >
                Task Calendar
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-surface-600 dark:text-surface-400"
              >
                View your tasks organized by deadlines
              </motion.p>
            </div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-soft"
            >
              <ApperIcon name="ArrowLeft" className="w-5 h-5" />
              Back to Tasks
            </motion.button>
          </div>
        </div>

        {/* Calendar Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Calendar tasks={tasks} onTaskEdit={handleTaskEdit} onTaskUpdate={handleTaskUpdate} />
        </motion.div>
      </div>
    </div>
  )
}