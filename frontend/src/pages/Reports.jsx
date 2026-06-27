import Sidebar from '../components/Sidebar'

function Reports({ onLogout }) {
  const handleDownloadPDF = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('https://smart-monthly-expense-tracker-1.onrender.com/reports/daily/pdf', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'daily_report.pdf'
      a.click()
    } catch (err) {
      console.error('Error downloading PDF:', err)
    }
  }

  const handleDownloadCSV = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('https://smart-monthly-expense-tracker-1.onrender.com/reports/daily/csv', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'daily_report.csv'
      a.click()
    } catch (err) {
      console.error('Error downloading CSV:', err)
    }
  }

  return (
    <div className="flex">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Reports</h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Daily Report</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center space-x-3 bg-red-500 text-white px-6 py-4 rounded-lg font-semibold hover:bg-red-600 transition"
            >
              <span className="text-2xl">📄</span>
              <span>Download PDF</span>
            </button>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center justify-center space-x-3 bg-green-500 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              <span className="text-2xl">📊</span>
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
