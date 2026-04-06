import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Bird, Warehouse, TrendingUp, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react'
import axios from 'axios'

const API_URL = '/api'

// Mock data for demo
const mockStats = {
  totalBirds: 15420,
  activeBatches: 8,
  feedConsumed: 2450,
  mortality: 42,
  fcr: 1.72,
  avgWeight: 2.35
}

const mockGrowthData = [
  { day: 1, weight: 0.45 },
  { day: 7, weight: 0.85 },
  { day: 14, weight: 1.25 },
  { day: 21, weight: 1.65 },
  { day: 28, weight: 2.05 },
  { day: 35, weight: 2.35 },
]

const mockFeedData = [
  { day: 'Mon', feed: 320 },
  { day: 'Tue', feed: 345 },
  { day: 'Wed', feed: 310 },
  { day: 'Thu', feed: 380 },
  { day: 'Fri', feed: 360 },
  { day: 'Sat', feed: 390 },
  { day: 'Sun', feed: 345 },
]

export default function Dashboard() {
  const [stats, setStats] = useState(mockStats)
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'Low feed stock in Farm A', time: '2 hours ago' },
    { id: 2, type: 'danger', message: 'Abnormal mortality in Batch #3', time: '5 hours ago' },
    { id: 3, type: 'info', message: 'Market price increased by 12%', time: '1 day ago' },
  ])

  const StatCard = ({ icon: Icon, label, value, unit, trend }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold mt-1">
            {value.toLocaleString()}
            <span className="text-sm text-gray-400 ml-1">{unit}</span>
          </p>
        </div>
        <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-green-100' : trend === 'down' ? 'bg-red-100' : 'bg-gray-100'}`}>
          <Icon size={24} className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's your farm overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Bird} label="Total Birds" value={stats.totalBirds} unit="birds" trend="up" />
        <StatCard icon={Warehouse} label="Feed Consumed" value={stats.feedConsumed} unit="kg" trend="up" />
        <StatCard icon={TrendingUp} label="FCR" value={stats.fcr} unit="" trend="down" />
        <StatCard icon={AlertTriangle} label="Mortality" value={stats.mortality} unit="birds" trend="down" />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Growth Curve</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#FF6B35" strokeWidth={2} dot={{ fill: '#FF6B35' }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-2 text-center">Average Bird Weight (kg)</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Feed Consumption</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockFeedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="feed" fill="#2E7D32" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-2 text-center">Daily Feed (kg)</p>
        </div>
      </div>

      {/* Alerts */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg flex items-center justify-between ${
                alert.type === 'danger' ? 'bg-red-50' :
                alert.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle 
                  size={20} 
                  className={
                    alert.type === 'danger' ? 'text-red-500' :
                    alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  } 
                />
                <span className="text-gray-700">{alert.message}</span>
              </div>
              <span className="text-sm text-gray-500">{alert.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}