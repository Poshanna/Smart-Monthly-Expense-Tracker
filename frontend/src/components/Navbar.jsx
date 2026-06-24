import { Link, useNavigate } from 'react-router-dom'

function Navbar({ setToken }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    setToken(null)
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Smart Expense Tracker
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </Link>
            <Link to="/expenses" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Expenses
            </Link>
            <Link to="/budget" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Budget
            </Link>
            <Link to="/goals" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Goals
            </Link>
            <Link to="/analytics" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Analytics
            </Link>
            <Link to="/insights" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Insights
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
