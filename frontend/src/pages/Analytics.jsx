import { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

function Analytics({ token }) {
  const [dailyAnalytics, setDailyAnalytics] = useState(null)
  const [monthlyAnalytics, setMonthlyAnalytics] = useState(null)
  const [yearlyAnalytics, setYearlyAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dailyRes, monthlyRes, yearlyRes] = await Promise.all([
          axios.get('https://smart-monthly-expense-tracker-1.onrender.com/analytics/daily', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('https://smart-monthly-expense-tracker-1.onrender.com/analytics/monthly', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('https://smart-monthly-expense-tracker-1.onrender.com/analytics/yearly', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        setDailyAnalytics(dailyRes.data)
        setMonthlyAnalytics(monthlyRes.data)
        setYearlyAnalytics(yearlyRes.data)
      } catch (err) {
        console.error('Error fetching analytics:', err)
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

  const hourlyData = dailyAnalytics?.hourly_trend
    ? Object.entries(dailyAnalytics.hourly_trend).map(([hour, value]) => ({
        hour: `${hour}:00`,
        amount: value,
      }))
    : []

  const monthlyData = yearlyAnalytics?.monthly_expenses
    ? Object.entries(yearlyAnalytics.monthly_expenses).map(([month, value]) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(month) - 1],
        amount: value,
      }))
    : []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Analytics</h1>

      {/* Daily Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Today's Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Expense</div>
            <div className="text-2xl font-bold text-red-600">₹{dailyAnalytics?.total_expense.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Transactions</div>
            <div className="text-2xl font-bold text-blue-600">{dailyAnalytics?.transaction_count}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Highest Category</div>
            <div className="text-2xl font-bold text-purple-600">{dailyAnalytics?.highest_category || '-'}</div>
          </div>
        </div>
        <div className="flex justify-center">
          {hourlyData.length > 0 ? (
            <LineChart width={600} height={300} data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          ) : (
            <div className="text-center text-gray-500 py-12">No data available</div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Monthly Trend</h2>
          {monthlyData.length > 0 ? (
            <BarChart width={500} height={300} data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Bar dataKey="amount" fill="#00C49F" />
            </BarChart>
          ) : (
            <div className="text-center text-gray-500 py-12">No data available</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Monthly Category Breakdown</h2>
          {monthlyAnalytics?.category_breakdown ? (
            <div className="space-y-3">
              {Object.entries(monthlyAnalytics.category_breakdown).map(([category, amount]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{category}</span>
                    <span className="font-medium text-gray-900">₹{amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(amount / monthlyAnalytics.total_spending) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">No data available</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics
