import { useState, useEffect } from 'react'
import { useAuthStore } from '../context/authStore'
import axios from 'axios'

const API_URL = ''

export default function AdminPanel() {
  const { user, token } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          ⚠️ Admin access required
        </div>
      </div>
    )
  }

  const roleIcons = {
    farmer: '🐔',
    dealer: '🏪',
    integrator: '🏭',
    admin: '⚙️'
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">👥 Admin Panel - All Users</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>
      )}
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg">{roleIcons[u.role] || '❓'} {u.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.state || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.district || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-gray-500">No users found</div>
          )}
        </div>
      )}
      
      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">📊 Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(roleIcons).map(([role, icon]) => (
            <div key={role} className="bg-white p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-sm text-gray-600 capitalize">{role}</div>
              <div className="text-xl font-bold text-blue-600">
                {users.filter(u => u.role === role).length}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}