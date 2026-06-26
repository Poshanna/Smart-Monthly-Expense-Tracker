import { useState, useEffect } from 'react'
import axios from 'axios'

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other']
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking']
const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP']

function Expenses({ token }) {
  const [expenses, setExpenses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'INR',
    category: 'Food',
    description: '',
    payment_method: 'Cash',
    expense_date: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(true)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [receiptFile, setReceiptFile] = useState(null)

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('http://localhost:8001/expenses/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setExpenses(response.data)
    } catch (err) {
      console.error('Error fetching expenses:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [token])

  const handleOCRUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setOcrLoading(true)
    setReceiptFile(file)
    
    try {
      const formDataOCR = new FormData()
      formDataOCR.append('file', file)
      
      const response = await axios.post('http://localhost:8001/ocr/scan', formDataOCR, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      const ocrResult = response.data
      console.log('OCR Result:', ocrResult)
      
      // Update form with OCR results
      setFormData(prev => {
        let parsedDate = prev.expense_date
        if (ocrResult.date) {
          // Handle dd/mm/yyyy format
          const dateParts = ocrResult.date.split(/[-/]/)
          if (dateParts.length === 3) {
            if (dateParts[0].length === 4) {
              // yyyy-mm-dd
              parsedDate = ocrResult.date.replace(/\//g, '-')
            } else if (dateParts[2].length === 4) {
              // dd-mm-yyyy or mm-dd-yyyy, assume dd-mm-yyyy
              parsedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`
            } else if (dateParts[2].length === 2) {
              // dd-mm-yy or mm-dd-yy, assume dd-mm-yy
              const year = parseInt(dateParts[2]) < 50 ? 2000 + parseInt(dateParts[2]) : 1900 + parseInt(dateParts[2])
              parsedDate = `${year}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`
            }
          }
        }
        
        return {
          ...prev,
          amount: ocrResult.amount !== null ? String(ocrResult.amount) : prev.amount,
          currency: ocrResult.currency || prev.currency,
          description: ocrResult.merchant_name || prev.description,
          expense_date: parsedDate
        }
      })
    } catch (err) {
      console.error('Error scanning receipt:', err)
      if (err.response) {
        console.error('Response data:', err.response.data)
        console.error('Response status:', err.response.status)
        console.error('Response headers:', err.response.headers)
      } else if (err.request) {
        console.error('Request:', err.request)
      } else {
        console.error('Error message:', err.message)
      }
      alert('Failed to scan receipt. Please enter details manually.')
    } finally {
      setOcrLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    alert('Submit button clicked!')
    console.log('Submitting expense...')
    console.log('Form data:', formData)
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        expense_date: new Date(formData.expense_date).toISOString(),
      }
      console.log('Expense data to send:', expenseData)
      console.log('Token:', token ? 'exists' : 'missing')
      
      if (editingExpense) {
        console.log('Updating existing expense...')
        await axios.put(`http://localhost:8001/expenses/${editingExpense.id}`, expenseData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        console.log('Creating new expense...')
        await axios.post('http://localhost:8001/expenses/', expenseData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }
      alert('Expense saved successfully!')
      fetchExpenses()
      resetForm()
      setShowModal(false)
    } catch (err) {
      console.error('Error saving expense:', err)
      alert('Error saving expense! Check console for details.')
      if (err.response) {
        console.error('Error response:', err.response.data)
        console.error('Error status:', err.response.status)
      }
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setFormData({
      amount: expense.amount,
      currency: expense.currency || 'INR',
      category: expense.category,
      description: expense.description,
      payment_method: expense.payment_method,
      expense_date: new Date(expense.expense_date).toISOString().split('T')[0],
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`http://localhost:8001/expenses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        fetchExpenses()
      } catch (err) {
        console.error('Error deleting expense:', err)
      }
    }
  }

  const resetForm = () => {
    setEditingExpense(null)
    setReceiptFile(null)
    setFormData({
      amount: '',
      currency: 'INR',
      category: 'Food',
      description: '',
      payment_method: 'Cash',
      expense_date: new Date().toISOString().split('T')[0],
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Expenses</h1>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
        >
          Add Expense
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(expense.expense_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.payment_method}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                  {expense.currency === 'INR' ? '₹' : expense.currency === 'EUR' ? '€' : expense.currency === 'GBP' ? '£' : '$'}{expense.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Receipt Upload */}
                {!editingExpense && (
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Upload Receipt (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleOCRUpload}
                      disabled={ocrLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    {ocrLoading && <p className="text-sm text-gray-500 mt-1">Scanning receipt...</p>}
                    {receiptFile && !ocrLoading && <p className="text-sm text-green-600 mt-1">Receipt scanned!</p>}
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    onClick={() => console.log('Add button clicked!')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    {editingExpense ? 'Update' : 'Add'}
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

export default Expenses
