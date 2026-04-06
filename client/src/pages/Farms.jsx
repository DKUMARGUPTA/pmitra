import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Edit, Trash2, Warehouse, MapPin, Users } from 'lucide-react'

const API_URL = '/api'

export default function Farms() {
  const [farms, setFarms] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingFarm, setEditingFarm] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: ''
  })

  // Mock data for demo
  const mockFarms = [
    { id: 1, name: 'Farm A - Delhi', address: 'Village: Rampur, District: Delhi', capacity: 5000, birds: 4200, activeBatches: 2 },
    { id: 2, name: 'Farm B - Gurgaon', address: 'Village: Khandsha, District: Gurgaon', capacity: 3000, birds: 2800, activeBatches: 1 },
    { id: 3, name: 'Farm C - Noida', address: 'Sector 62, Noida', capacity: 8000, birds: 7500, activeBatches: 3 },
  ]

  useEffect(() => {
    setFarms(mockFarms)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingFarm) {
      setFarms(farms.map(f => f.id === editingFarm.id ? { ...f, ...formData } : f))
    } else {
      setFarms([...farms, { ...formData, id: Date.now(), birds: 0, activeBatches: 0 }])
    }
    setShowModal(false)
    setFormData({ name: '', address: '', capacity: '' })
    setEditingFarm(null)
  }

  const handleEdit = (farm) => {
    setEditingFarm(farm)
    setFormData({ name: farm.name, address: farm.address, capacity: farm.capacity })
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this farm?')) {
      setFarms(farms.filter(f => f.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Farms</h1>
          <p className="text-gray-500">Manage your poultry farms</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Farm
        </button>
      </div>

      {/* Farm Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {farms.map((farm) => (
          <div key={farm.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Warehouse size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{farm.name}</h3>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(farm)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <Edit size={18} className="text-gray-500" />
                </button>
                <button onClick={() => handleDelete(farm.id)} className="p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} />
                <span>{farm.address}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={16} />
                <span>Capacity: {farm.capacity} birds</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{farm.birds}</p>
                <p className="text-xs text-gray-500">Current Birds</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">{farm.activeBatches}</p>
                <p className="text-xs text-gray-500">Active Batches</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-700">{Math.round(farm.birds / farm.capacity * 100)}%</p>
                <p className="text-xs text-gray-500">Occupancy</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingFarm ? 'Edit Farm' : 'Add New Farm'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Farm A - Delhi"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Village, District..."
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (birds)</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="5000"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary py-2">
                  {editingFarm ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}