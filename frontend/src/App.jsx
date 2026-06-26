import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Budget from './pages/Budget'
import Goals from './pages/Goals'
import Analytics from './pages/Analytics'
import Insights from './pages/Insights'
import Navbar from './components/Navbar'
import './index.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {token && <Navbar setToken={setToken} />}
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/" /> : <Login setToken={setToken} />} />
          <Route path="/register" element={token ? <Navigate to="/" /> : <Register setToken={setToken} />} />
          <Route path="/" element={token ? <Dashboard token={token} /> : <Navigate to="/login" />} />
          <Route path="/expenses" element={token ? <Expenses token={token} /> : <Navigate to="/login" />} />
          <Route path="/budget" element={token ? <Budget token={token} /> : <Navigate to="/login" />} />
          <Route path="/goals" element={token ? <Goals token={token} /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={token ? <Analytics token={token} /> : <Navigate to="/login" />} />
          <Route path="/insights" element={token ? <Insights token={token} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
