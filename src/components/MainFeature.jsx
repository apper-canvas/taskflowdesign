import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday, isTomorrow, isPast, parseISO, addDays, addWeeks, addMonths, isAfter, isBefore } from 'date-fns'
import { useLocation } from 'react-router-dom'
import ApperIcon from './ApperIcon'

export default function MainFeature({ onStatsUpdate }) {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    category: 'personal',
    isRecurring: false,
    recurringPattern: 'daily',
    recurringStartDate: '',
    recurringEndDate: ''
  })
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const location = useLocation()

  const categories = [
    { id: 'personal', name: 'Personal', color: 'bg-blue-500' },
    { id: 'work', name: 'Work', color: 'bg-purple-500' },
    { id: 'shopping', name: 'Shopping', color: 'bg-green-500' },
    { id: 'health', name: 'Health', color: 'bg-red-500' }
  ]

  const priorities = [
    { id: 'low', name: 'Low', color: 'text-green-600' },
    { id: 'medium', name: 'Medium', color: 'text-yellow-600' },
    { id: 'high', name: 'High', color: 'text-red-600' }
  ]

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow-tasks')
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks)
      setTasks(parsed)
    }
  }, [])

  // Save tasks to localStorage and update stats when tasks change
  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks))
    if (onStatsUpdate) {
      onStatsUpdate(tasks)
    }
  }, [tasks, onStatsUpdate])

  // Handle task editing from calendar navigation
  useEffect(() => {
    if (location.state?.editTask) {
      const taskToEdit = location.state.editTask
      setNewTask({
        title: taskToEdit.title,
        description: taskToEdit.description,
        priority: taskToEdit.priority,
        dueDate: taskToEdit.dueDate,
        category: taskToEdit.category,
        isRecurring: taskToEdit.isRecurring || false,
        recurringPattern: taskToEdit.recurringPattern || 'daily',
        recurringStartDate: taskToEdit.recurringStartDate || '',
        recurringEndDate: taskToEdit.recurringEndDate || ''
      })
      setEditingTask(taskToEdit)
      setShowForm(true)
    }
  }, [location.state])

  const generateRecurringTasks = (baseTask) => {
    if (!baseTask.isRecurring || !baseTask.recurringStartDate || !baseTask.recurringEndDate) {
      return [baseTask]
    }

    const generatedTasks = []
    const startDate = parseISO(baseTask.recurringStartDate)
    const endDate = parseISO(baseTask.recurringEndDate)
    let currentDate = startDate
    let taskIndex = 0

    while (isBefore(currentDate, endDate) || format(currentDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
      const taskId = `${baseTask.id || Date.now()}-${taskIndex}`
      const recurringTask = {
        ...baseTask,
        id: taskId,
        dueDate: format(currentDate, 'yyyy-MM-dd'),
        title: `${baseTask.title}${taskIndex > 0 ? ` (#${taskIndex + 1})` : ''}`,
        recurringParentId: baseTask.id || Date.now().toString(),
        recurringIndex: taskIndex,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      generatedTasks.push(recurringTask)
      
      // Calculate next occurrence
      switch (baseTask.recurringPattern) {
        case 'daily':
          currentDate = addDays(currentDate, 1)
          break
        case 'weekly':
          currentDate = addWeeks(currentDate, 1)
          break
        case 'monthly':
          currentDate = addMonths(currentDate, 1)
          break
        default:
          currentDate = addDays(currentDate, 1)
      }
      taskIndex++
    }

    return generatedTasks
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    if (newTask.isRecurring) {
      if (!newTask.recurringStartDate || !newTask.recurringEndDate) {
        toast.error('Please specify start and end dates for recurring tasks')
        return
      }
      if (isAfter(parseISO(newTask.recurringStartDate), parseISO(newTask.recurringEndDate))) {
        toast.error('End date must be after start date')
        return
      }
    }

    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...newTask, updatedAt: new Date().toISOString() }
          : task
      ))
      toast.success('Task updated successfully!')
      setEditingTask(null)
    } else {
      const baseTask = {
        id: Date.now().toString(),
        ...newTask,
        isCompleted: false,
        tags: []
      }
      
      const generatedTasks = generateRecurringTasks(baseTask)
      setTasks([...tasks, ...generatedTasks])
      
      if (newTask.isRecurring) {
        toast.success(`Recurring task created! Generated ${generatedTasks.length} instances.`)
      } else {
        toast.success('Task created successfully!')
      }
    }

    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: 'personal',
      isRecurring: false,
      recurringPattern: 'daily',
      recurringStartDate: '',
      recurringEndDate: ''
    })
    setShowForm(false)
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, isCompleted: !task.isCompleted, updatedAt: new Date().toISOString() }
        : task
    ))
    const task = tasks.find(t => t.id === id)
    if (task && !task.isCompleted) {
      toast.success('Task completed! 🎉')
    }
  }

  const deleteTask = (id) => {
    const taskToDelete = tasks.find(task => task.id === id)
    
    if (taskToDelete?.recurringParentId) {
      const confirmDeleteSeries = window.confirm(
        'This is part of a recurring series. Do you want to delete the entire series?'
      )
      
      if (confirmDeleteSeries) {
        setTasks(tasks.filter(task => task.recurringParentId !== taskToDelete.recurringParentId))
        toast.success('Recurring task series deleted successfully')
      } else {
        setTasks(tasks.filter(task => task.id !== id))
        toast.success('Task deleted successfully')
      }
    } else {
      setTasks(tasks.filter(task => task.id !== id))
      toast.success('Task deleted successfully')
    }
  }

  const disableRecurringSeries = (parentId) => {
    setTasks(tasks.filter(task => task.recurringParentId !== parentId))
    toast.success('Future recurring tasks disabled')
  }

  const editTask = (task) => {
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      category: task.category,
      isRecurring: task.isRecurring || false,
      recurringPattern: task.recurringPattern || 'daily',
      recurringStartDate: task.recurringStartDate || '',
      recurringEndDate: task.recurringEndDate || ''
    })
    setEditingTask(task)
    setShowForm(true)
  }

  const formatDueDate = (dateString) => {
    if (!dateString) return ''
    const date = parseISO(dateString)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM dd, yyyy')
  }

  const getDueDateClass = (dateString) => {
    if (!dateString) return ''
    const date = parseISO(dateString)
    if (isPast(date) && !isToday(date)) return 'text-red-500'
    if (isToday(date)) return 'text-orange-500'
    return 'text-surface-600'
  }

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || 
      (filter === 'completed' && task.isCompleted) ||
      (filter === 'pending' && !task.isCompleted) ||
      (filter === task.priority) ||
      (filter === task.category)
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const recurringPatterns = [
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' }
  ]

  const getRecurringSeries = () => {
    const parentIds = [...new Set(tasks.filter(task => task.recurringParentId).map(task => task.recurringParentId))]
    return parentIds.map(parentId => tasks.find(task => task.recurringParentId === parentId))
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Controls Bar */}
      <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-card border border-white/20 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-100 dark:bg-surface-700 rounded-xl border-0 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['all', 'pending', 'completed', 'high', 'medium', 'low'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    filter === filterOption
                      ? 'bg-primary text-white shadow-soft'
                      : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Add Task Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowForm(!showForm)
              setEditingTask(null)
              setNewTask({
                title: '',
                description: '',
                priority: 'medium',
                dueDate: '',
                category: 'personal',
                isRecurring: false,
                recurringPattern: 'daily',
                recurringStartDate: '',
                recurringEndDate: ''
              })
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-medium shadow-soft hover:shadow-lg transition-all duration-200"
          >
            <ApperIcon name={showForm ? "X" : "Plus"} className="w-5 h-5" />
            {showForm ? 'Cancel' : 'Add Task'}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Task Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="xl:col-span-1"
            >
              <div className="bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-card border border-white/20">
                <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      className="w-full px-4 py-3 bg-surface-100 dark:bg-surface-700 rounded-xl border-0 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                      placeholder="Enter task title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-3 bg-surface-100 dark:bg-surface-700 rounded-xl border-0 focus:ring-2 focus:ring-primary/50 transition-all duration-200 resize-none"
                      placeholder="Add description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                        className="w-full px-4 py-3 bg-surface-100 dark:bg-surface-700 rounded-xl border-0 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                      >
                        {priorities.map(priority => (
                          <option key={priority.id} value={priority.id}>
                            {priority.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Category
                      </label>
                      <select
                        value={newTask.category}
                        onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                        className="w-full px-4 py-3 bg-surface-100 dark:bg-surface-700 rounded-xl border-0 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                      >
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        checked={newTask.isRecurring}
                        onChange={(e) => setNewTask({...newTask, isRecurring: e.target.checked})}
                        className="w-4 h-4 text-primary bg-surface-100 border-surface-300 rounded focus:ring-primary/50"
                      />
                      <label htmlFor="isRecurring" className="text-sm font-medium text-surface-700 dark:text-surface-300">
                        Recurring Task
                      </label>
                    </div>
                  </div>

                  <AnimatePresence>
                    {newTask.isRecurring && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Repeat Pattern
                          </label>
                          <select
                            value={newTask.recurringPattern}
                            onChange={(e) => setNewTask({...newTask, recurringPattern: e.target.value})}
                            className="w-full px-4 py-3 bg-surface-100 dark:bg-surface-700 rounded-xl border-0 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                          >
                            {recurringPatterns.map(pattern => (
                              <option key={pattern.id} value={pattern.id}>
                                {pattern.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={newTask.recurringStartDate}
                              onChange={(e) => setNewTask({...newTask, recurringStartDate: e.target.value})}
                              className="w-full px-4 py-3 bg-surface-100 dark:bg-surface-700 rounded-xl border-0 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={newTask.recurringEndDate}
                              onChange={(e) => setNewTask({...newTask, recurringEndDate: e.target.value})}
                              className="w-full px-4 py-3 bg-surface-100 dark:bg-surface-700 rounded-xl border-0 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!newTask.isRecurring && (
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                        className="w-full px-4 py-3 bg-surface-100 dark:bg-surface-700 rounded-xl border-0 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-medium shadow-soft hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task List */}
        <div className={`${showForm ? 'xl:col-span-2' : 'xl:col-span-3'} transition-all duration-300`}>
          <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-surface-200 dark:border-surface-700">
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white">
                Tasks ({filteredTasks.length})
              </h3>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {filteredTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center"
                  >
                    <div className="w-20 h-20 mx-auto bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mb-4">
                      <ApperIcon name="Inbox" className="w-10 h-10 text-surface-400" />
                    </div>
                    <p className="text-surface-600 dark:text-surface-400">
                      No tasks found. Create your first task to get started!
                    </p>
                  </motion.div>
                ) : (
                  filteredTasks.map((task, index) => {
                    const category = categories.find(c => c.id === task.category)
                    const priority = priorities.find(p => p.id === task.priority)
                    
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 border-b border-surface-100 dark:border-surface-700 last:border-b-0 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-all duration-200 ${
                          task.isCompleted ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all duration-200 ${
                              task.isCompleted
                                ? 'bg-green-500 border-green-500'
                                : 'border-surface-300 dark:border-surface-600 hover:border-primary'
                            }`}
                          >
                            {task.isCompleted && (
                              <ApperIcon name="Check" className="w-full h-full text-white p-0.5" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                              <h4 className={`font-medium text-surface-900 dark:text-white ${
                                task.isCompleted ? 'line-through' : ''
                              }`}>
                                {task.recurringParentId && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 mr-2">
                                    <ApperIcon name="Repeat" className="w-3 h-3 mr-1" />
                                    Recurring
                                  </span>
                                )}
                                {task.title}
                              </h4>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${category?.color} text-white`}>
                                  {category?.name}
                                </span>
                                <span className={`text-xs font-medium ${priority?.color}`}>
                                  {priority?.name}
                                </span>
                              </div>
                            </div>

                            {task.description && (
                              <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">
                                {task.description}
                              </p>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-sm">
                                  <ApperIcon name="Calendar" className="w-4 h-4" />
                                  <span className={getDueDateClass(task.dueDate)}>
                                    {formatDueDate(task.dueDate)}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => editTask(task)}
                                  className="p-2 text-surface-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                                >
                                  <ApperIcon name="Edit2" className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="p-2 text-surface-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200"
                                >
                                  <ApperIcon name="Trash2" className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

        {/* Recurring Tasks Management */}
        {getRecurringSeries().length > 0 && (
          <div className="mt-6">
            <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-4">
                Recurring Task Series
              </h3>
              <div className="grid gap-3">
                {getRecurringSeries().map(task => (
                  <div key={task?.recurringParentId} className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-700/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-surface-900 dark:text-white">
                        {task?.title?.replace(/ \(#\d+\)$/, '')}
                      </h4>
                      <p className="text-sm text-surface-600 dark:text-surface-400">
                        {task?.recurringPattern} • {tasks.filter(t => t.recurringParentId === task?.recurringParentId).length} tasks
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editTask(task)}
                        className="p-2 text-surface-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                      >
                        <ApperIcon name="Edit2" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => disableRecurringSeries(task?.recurringParentId)}
                        className="p-2 text-surface-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      >
                        <ApperIcon name="X" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}