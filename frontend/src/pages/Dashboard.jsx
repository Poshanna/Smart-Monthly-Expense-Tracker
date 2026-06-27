import { useState, useEffect } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

function Dashboard({ token }) {
  const [summary, setSummary] = useState(null)
  const [monthlyAnalytics, setMonthlyAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, analyticsRes] = await Promise.all([
          axios.get('https://smart-monthly-expense-tracker-1.onrender.com/dashboard/summary', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('https://smart-monthly-expense-tracker-1.onrender.com/analytics/monthly', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        setSummary(summaryRes.data)
        setMonthlyAnalytics(analyticsRes.data)
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  const pieData = monthlyAnalytics?.category_breakdown
    ? Object.entries(monthlyAnalytics.category_breakdown).map(([name, value]) => ({ name, value }))
    : []

  const weeklyData = monthlyAnalytics?.weekly_trend
    ? Object.entries(monthlyAnalytics.weekly_trend).map(([week, value]) => ({
        week: `Week ${week}`,
        amount: value,
      }))
    : []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600 mb-1">Today's Expense</div>
          <div className="text-3xl font-bold text-red-600">₹{summary?.today_expense.toFixed(2)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600 mb-1">Monthly Expense</div>
          <div className="text-3xl font-bold text-orange-600">₹{summary?.monthly_expense.toFixed(2)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600 mb-1">Total Expenses</div>
          <div className="text-3xl font-bold text-purple-600">₹{summary?.total_expenses.toFixed(2)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600 mb-1">Total Savings</div>
          <div className="text-3xl font-bold text-green-600">₹{summary?.total_savings.toFixed(2)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
          <div className="text-3xl font-bold text-blue-600">{summary?.total_transactions}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Monthly Category Breakdown</h2>
          {pieData.length > 0 ? (
            <PieChart width={400} height={300}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
            </PieChart>
          ) : (
            <div className="text-center text-gray-500 py-12">No data available</div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Weekly Trend</h2>
          {weeklyData.length > 0 ? (
            <BarChart width={400} height={300} data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Bar dataKey="amount" fill="#0088FE" />
            </BarChart>
          ) : (
            <div className="text-center text-gray-500 py-12">No data available</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
