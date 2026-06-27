import { useState, useEffect } from 'react'
import axios from 'axios'

function Budget({ token }) {
  const [budget, setBudget] = useState(null)
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [monthlyExpense, setMonthlyExpense] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [budgetRes, summaryRes] = await Promise.all([
        axios.get('https://smart-monthly-expense-tracker-1.onrender.com/budgets/', {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: null })),
        axios.get('https://smart-monthly-expense-tracker-1.onrender.com/dashboard/summary', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      setBudget(budgetRes.data)
      if (budgetRes.data) {
        setMonthlyBudget(budgetRes.data.monthly_budget.toString())
      }
      setMonthlyExpense(summaryRes.data.monthly_expense)
    } catch (err) {
      console.error('Error fetching budget:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(
        'https://smart-monthly-expense-tracker-1.onrender.com/budgets/',
        { monthly_budget: parseFloat(monthlyBudget) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      fetchData()
    } catch (err) {
      console.error('Error saving budget:', err)
    }
  }

  const progress = budget ? Math.min((monthlyExpense / budget.monthly_budget) * 100, 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Budget Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Set Budget */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Set Monthly Budget</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Monthly Budget (₹)</label>
              <input
                type="number"
                step="0.01"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Save Budget
            </button>
          </form>
        </div>

        {/* Budget Overview */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Budget Overview</h2>
          {budget ? (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Monthly Budget</span>
                  <span className="font-semibold text-gray-900">₹{budget.monthly_budget.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Spent This Month</span>
                  <span className="font-semibold text-red-600">₹{monthlyExpense.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-semibold text-green-600">
                    ₹{Math.max(budget.monthly_budget - monthlyExpense, 0).toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-300 ${
                      progress > 90 ? 'bg-red-500' : progress > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-center mt-2 text-sm text-gray-600">{progress.toFixed(0)}% used</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">No budget set yet</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Budget
