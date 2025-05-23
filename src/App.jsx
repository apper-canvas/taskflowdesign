import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import CalendarView from './pages/CalendarView'
import ProgressDashboard from './pages/ProgressDashboard'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/dashboard" element={<ProgressDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="text-sm"
        toastClassName="bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
      />
    </div>
  )
}

export default App