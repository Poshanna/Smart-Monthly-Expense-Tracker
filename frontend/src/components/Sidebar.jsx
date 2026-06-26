import { Link } from 'react-router-dom'

function Sidebar({ onLogout }) {
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/expenses', label: 'Expenses', icon: '💸' },
    { path: '/scanner', label: 'Receipt Scanner', icon: '📷' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/budgets', label: 'Budgets', icon: '📋' },
    { path: '/goals', label: 'Savings Goals', icon: '🎯' },
    { path: '/reports', label: 'Reports', icon: '📄' },
    { path: '/insights', label: 'AI Insights', icon: '🤖' }
  ]

  return (
    <div className="w-64 bg-white dark:bg-gray-800 min-h-screen shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Smart Finance</h2>
      </div>
      <nav className="space-y-2 px-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition mt-4"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </div>
  )
}

export default Sidebar
