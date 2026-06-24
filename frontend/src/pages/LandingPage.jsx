import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Smart Finance</h1>
          <div className="space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Register</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Smart Finance Assistant
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Track, Save, and Grow Your Money Smarter
          </p>
          <div className="space-x-4">
            <Link to="/login" className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition inline-block">
              Get Started
            </Link>
            <Link to="/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition inline-block">
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">Features</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Expense Tracking', desc: 'Track all your expenses in one place' },
            { title: 'Receipt Scanning', desc: 'Auto-scan receipts with OCR technology' },
            { title: 'Budget Planning', desc: 'Set and manage your monthly budgets' },
            { title: 'Savings Goals', desc: 'Set goals and track your progress' },
            { title: 'Financial Reports', desc: 'Generate detailed financial reports' },
            { title: 'AI Insights', desc: 'Get smart financial recommendations' }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h4>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>&copy; 2024 Smart Finance Assistant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
