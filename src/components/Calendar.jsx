import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  parseISO,
  isToday,
  isPast 
} from 'date-fns'
import ApperIcon from './ApperIcon'

export default function Calendar({ tasks, onTaskEdit, onTaskUpdate }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      return isSameDay(parseISO(task.dueDate), date)
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-blue-500'
    }
  }

  const getStatusColor = (task) => {
    if (task.isCompleted) return 'bg-gray-400'
    if (task.dueDate && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate))) {
      return 'bg-red-600'
    }
    return getPriorityColor(task.priority)
  }

  const handleTaskClick = (task) => {
    if (onTaskEdit) {
      onTaskEdit(task)
    }
  }

  const toggleTaskCompletion = (taskId, event) => {
    event.stopPropagation()
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, isCompleted: !task.isCompleted, updatedAt: new Date().toISOString() }
        : task
    )
    if (onTaskUpdate) {
      onTaskUpdate(updatedTasks)
    }
    const task = tasks.find(t => t.id === taskId)
    if (task && !task.isCompleted) {
      toast.success('Task completed! 🎉')
    } else {
      toast.info('Task marked as incomplete')
    }
  }

  return (
    <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/20 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth(-1)}
            className="p-2 text-surface-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
          >
            <ApperIcon name="ChevronLeft" className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
          >
            Today
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth(1)}
            className="p-2 text-surface-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
          >
            <ApperIcon name="ChevronRight" className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-surface-600 dark:text-surface-400">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {calendarDays.map((day, index) => {
          const dayTasks = getTasksForDate(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isTodayDate = isToday(day)
          
          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              onClick={() => setSelectedDate(selectedDate && isSameDay(selectedDate, day) ? null : day)}
              className={`
                min-h-[100px] p-2 border border-surface-200 dark:border-surface-700 cursor-pointer
                transition-all duration-200 hover:bg-surface-50 dark:hover:bg-surface-700/50
                ${!isCurrentMonth ? 'opacity-40' : ''}
                ${isTodayDate ? 'bg-primary/10 border-primary/30' : ''}
                ${selectedDate && isSameDay(selectedDate, day) ? 'ring-2 ring-primary/50' : ''}
              `}
            >
              {/* Day Number */}
              <div className={`
                text-sm font-medium mb-1
                ${isTodayDate ? 'text-primary font-bold' : 'text-surface-900 dark:text-surface-100'}
                ${!isCurrentMonth ? 'text-surface-400' : ''}
              `}>
                {format(day, 'd')}
              </div>
              
              {/* Tasks for this day */}
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <motion.div
                    key={task.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTaskClick(task)
                    }}
                    className={`
                      ${getStatusColor(task)} text-white text-xs px-2 py-1 rounded
                      cursor-pointer hover:opacity-80 transition-all duration-200
                      flex items-center justify-between gap-1
                      ${task.isCompleted ? 'opacity-60 line-through' : ''}
                    `}
                  >
                    <span className="truncate flex-1">{task.title}</span>
                    <button
                      onClick={(e) => toggleTaskCompletion(task.id, e)}
                      className="flex-shrink-0 w-3 h-3 rounded-full border border-white/50 hover:bg-white/20 transition-all duration-200"
                    >
                      {task.isCompleted && (
                        <ApperIcon name="Check" className="w-full h-full p-0.5" />
                      )}
                    </button>
                  </motion.div>
                ))}
                
                {dayTasks.length > 3 && (
                  <div className="text-xs text-surface-500 dark:text-surface-400 px-2">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Selected Date Tasks */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-surface-200 dark:border-surface-700 pt-4"
          >
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-3">
              Tasks for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            
            <div className="space-y-2">
              {getTasksForDate(selectedDate).map(task => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className={`
                    p-3 rounded-lg border cursor-pointer transition-all duration-200
                    hover:shadow-soft ${getStatusColor(task).replace('bg-', 'border-l-4 border-l-')}
                    bg-surface-50 dark:bg-surface-700/50 border-surface-200 dark:border-surface-600
                    ${task.isCompleted ? 'opacity-60' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${task.isCompleted ? 'line-through' : ''}`}>
                      {task.title}
                    </span>
                    <span className="text-xs text-surface-500 capitalize">
                      {task.priority} priority
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                      {task.description}
                    </p>
                  )}
                </div>
              ))}
              
              {getTasksForDate(selectedDate).length === 0 && (
                <p className="text-surface-500 dark:text-surface-400 text-center py-4">
                  No tasks scheduled for this date
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}