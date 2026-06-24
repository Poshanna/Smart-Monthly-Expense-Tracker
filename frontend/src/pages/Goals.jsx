import { useState, useEffect } from 'react'
import axios from 'axios'

function Goals({ token }) {
  const [goals, setGoals] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    saved_amount: '0',
  })
  const [loading, setLoading] = useState(true)

  const fetchGoals = async () => {
    try {
      const response = await axios.get('http://localhost:8001/goals/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setGoals(response.data)
    } catch (err) {
      console.error('Error fetching goals:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const goalData = {
        ...formData,
        target_amount: parseFloat(formData.target_amount),
        saved_amount: parseFloat(formData.saved_amount),
      }
      if (editingGoal) {
        await axios.put(`http://localhost:8001/goals/${editingGoal.id}`, goalData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        await axios.post('http://localhost:8001/goals/', goalData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }
      fetchGoals()
      resetForm()
      setShowModal(false)
    } catch (err) {
      console.error('Error saving goal:', err)
    }
  }

  const handleEdit = (goal) => {
    setEditingGoal(goal)
    setFormData({
      goal_name: goal.goal_name,
      target_amount: goal.target_amount.toString(),
      saved_amount: goal.saved_amount.toString(),
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await axios.delete(`http://localhost:8001/goals/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        fetchGoals()
      } catch (err) {
        console.error('Error deleting goal:', err)
      }
    }
  }

  const resetForm = () => {
    setEditingGoal(null)
    setFormData({
      goal_name: '',
      target_amount: '',
      saved_amount: '0',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Savings Goals</h1>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
        >
          Add Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = Math.min((goal.saved_amount / goal.target_amount) * 100, 100)
          return (
            <div key={goal.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{goal.goal_name}</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target</span>
                  <span className="font-semibold text-gray-900">₹{goal.target_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Saved</span>
                  <span className="font-semibold text-green-600">₹{goal.saved_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-semibold text-orange-600">
                    ₹{Math.max(goal.target_amount - goal.saved_amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-center text-sm text-gray-600 mb-4">{progress.toFixed(0)}% complete</div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleEdit(goal)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded-lg text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingGoal ? 'Edit Goal' : 'Add Goal'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Goal Name</label>
                  <input
                    type="text"
                    value={formData.goal_name}
                    onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Target Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Saved Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.saved_amount}
                    onChange={(e) => setFormData({ ...formData, saved_amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    {editingGoal ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Goals
