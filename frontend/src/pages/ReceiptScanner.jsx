import { useState } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'

function ReceiptScanner({ onLogout }) {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Others',
    description: '',
    payment_method: 'Cash',
    expense_date: new Date().toISOString().split('T')[0]
  })

  const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Entertainment', 'Investments', 'Others']

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleScan = async () => {
    if (!file) return
    setLoading(true)
    const token = localStorage.getItem('token')
    const formDataObj = new FormData()
    formDataObj.append('file', file)
    try {
      const response = await axios.post('https://smart-monthly-expense-tracker-1.onrender.com/ocr/scan', formDataObj, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      setResult(response.data)
      setFormData({
        amount: response.data.amount || '',
        category: 'Others',
        description: response.data.merchant_name || '',
        payment_method: 'Cash',
        expense_date: new Date().toISOString().split('T')[0]
      })
    } catch (err) {
      console.error('Error scanning receipt:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const token = localStorage.getItem('token')
    try {
      await axios.post('https://smart-monthly-expense-tracker-1.onrender.com/expenses/', {
        ...formData,
        expense_date: new Date(formData.expense_date).toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Expense saved successfully!')
      setResult(null)
      setFile(null)
    } catch (err) {
      console.error('Error saving expense:', err)
    }
  }

  return (
    <div className="flex">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Receipt Scanner</h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer"
            >
              <div className="text-4xl mb-4">📷</div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Click to upload receipt</p>
              <p className="text-sm text-gray-500">or drag and drop</p>
              {file && <p className="text-blue-600 mt-2">{file.name}</p>}
            </label>
          </div>
          <button
            onClick={handleScan}
            disabled={!file || loading}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Scan Receipt'}
          </button>

          {result && (
            <div className="mt-8 pt-8 border-t dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Review & Save</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Save Expense
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReceiptScanner
