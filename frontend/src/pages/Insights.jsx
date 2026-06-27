import { useState, useEffect } from 'react'
import axios from 'axios'

function Insights({ token }) {
  const [healthScore, setHealthScore] = useState(null)
  const [aiInsights, setAiInsights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, insightsRes] = await Promise.all([
          axios.get('https://smart-monthly-expense-tracker-1.onrender.com/financial-health', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('https://smart-monthly-expense-tracker-1.onrender.com/ai-insights', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        setHealthScore(healthRes.data)
        setAiInsights(insightsRes.data)
      } catch (err) {
        console.error('Error fetching insights:', err)
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCircleColor = (score) => {
    if (score >= 80) return 'stroke-green-500'
    if (score >= 60) return 'stroke-yellow-500'
    return 'stroke-red-500'
  }

  const getInsightColor = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'alert':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive':
        return '✓'
      case 'warning':
        return '⚠'
      case 'alert':
        return '!'
      default:
        return 'ℹ'
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Financial Insights</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Financial Health Score */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Financial Health Score</h2>
          {healthScore && (
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      strokeLinecap="round"
                      className={getCircleColor(healthScore.score)}
                      strokeWidth="8"
                      strokeDasharray={`${healthScore.score * 2.83} 283`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getScoreColor(healthScore.score)}`}>
                        {healthScore.score}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">out of 100</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-green-700 mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {healthScore.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-red-700 mb-3">Areas to Improve</h3>
                <ul className="space-y-2">
                  {healthScore.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-red-500 mr-2">⚠</span>
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-blue-700 mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {healthScore.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-500 mr-2">💡</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">AI-Powered Insights</h2>
          <div className="space-y-4">
            {aiInsights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start">
                  <span className="text-2xl mr-3">{getInsightIcon(insight.type)}</span>
                  <p className="font-medium">{insight.insight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Insights
