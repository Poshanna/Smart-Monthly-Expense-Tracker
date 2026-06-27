import { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'

function Budgets({ onLogout }) {
  const [budget, setBudget] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [dashboardSummary, setDashboardSummary] = useState(null)

  useEffect(() => {
    fetchBudget()
    fetchSummary()
  }, [])

  const fetchBudget = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await axios.get('https://smart-monthly-expense-tracker-1.onrender.com/budgets/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBudget(response.data)
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Error fetching budget:', err)
      }
    }
  }

  const fetchSummary = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await axios.get('https://smart-monthly-expense-tracker-1.onrender.com/dashboard/summary', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDashboardSummary(response.data)
    } catch (err) {
      console.error('Error fetching summary:', err)
    }
  }

  const handleSave = async () => {
    const token = localStorage.getItem('token')
    try {
      await axios.post('https://smart-monthly-expense-tracker-1.onrender.com/budgets/', {
        monthly_budget: parseFloat(monthlyBudget)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowModal(false)
      fetchBudget()
    } catch (err) {
      console.error('Error saving budget:', err)
    }
  }

  const spent = dashboardSummary?.monthly_expense || 0
  const total = budget?.monthly_budget || 0
  const percentage = total > 0 ? Math.min((spent / total) * 100, 100) : 0
  const remaining = Math.max(total - spent, 0)

  return (
    <div className="flex">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Budgets</h1>
          <button
            onClick={() => {
              setMonthlyBudget(budget?.monthly_budget || '')
              setShowModal(true)
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {budget ? 'Update Budget' : 'Set Budget'}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          {budget ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Monthly Budget</h2>
              <div className="mb-8">
                <div className="flex justify-between text-lg mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Spent</span>
                  <span className="text-red-600 font-semibold">₹{spent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                  <span className="text-green-600 font-semibold">₹{remaining.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg mb-4">
                  <span className="text-gray-600 dark:text-gray-400">Total Budget</span>
                  <span className="text-gray-800 dark:text-white font-semibold">₹{total.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-300 ${
                      percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-center mt-2 text-gray-600 dark:text-gray-400">{percentage.toFixed(1)}% used</p>
              </div>
              {percentage > 80 && (
                <div className={`p-4 rounded-lg ${percentage > 100 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                  <p className={`font-semibold ${percentage > 100 ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                    {percentage > 100 ? '⚠️ Budget Exceeded!' : '⚠️ Approaching Budget Limit!'}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No budget set yet</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Set Your First Budget
              </button>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                {budget ? 'Update Budget' : 'Set Monthly Budget'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Monthly Budget</label>
                  <input
                    type="number"
                    step="0.01"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Budgets
