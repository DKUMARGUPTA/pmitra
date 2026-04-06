import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Bird, Calendar, TrendingUp } from 'lucide-react'

export default function Batches() {
  const [batches, setBatches] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingBatch, setEditingBatch] = useState(null)
  const [formData, setFormData] = useState({
    farmId: '',
    batchName: '',
    birdCount: '',
    startDate: '',
    breed: ''
  })

  // Mock data
  const mockBatches = [
    { id: 1, farmId: 1, farmName: 'Farm A - Delhi', batchName: 'Batch #1', birdCount: 2000, currentCount: 1950, startDate: '2026-03-01', age: 35, avgWeight: 2.35, status: 'active' },
    { id: 2, farmId: 1, farmName: 'Farm A - Delhi', batchName: 'Batch #2', birdCount: 2200, currentCount: 2150, startDate: '2026-03-15', age: 21, avgWeight: 1.25, status: 'active' },
    { id: 3, farmId: 2, farmName: 'Farm B - Gurgaon', batchName: 'Batch #1', birdCount: 2800, currentCount: 2800, startDate: '2026-04-01', age: 5, avgWeight: 0.45, status: 'active' },
    { id: 4, farmId: 3, farmName: 'Farm C - Noida', batchName: 'Batch #1', birdCount: 2500, currentCount: 0, startDate: '2026-01-01', age: 0, avgWeight: 0, status: 'closed' },
  ]

  const mockFarms = [
    { id: 1, name: 'Farm A - Delhi' },
    { id: 2, name: 'Farm B - Gurgaon' },
    { id: 3, name: 'Farm C - Noida' },
  ]

  useEffect(() => {
    setBatches(mockBatches)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const farm = mockFarms.find(f => f.id === parseInt(formData.farmId))
    const newBatch = {
      ...formData,
      id: Date.now(),
      farmName: farm?.name || '',
      currentCount: parseInt(formData.birdCount),
      age: 0,
      avgWeight: 0,
      status: 'active'
    }
    setBatches([...batches, newBatch])
    setShowModal(false)
    setFormData({ farmId: '', batchName: '', birdCount: '', startDate: '', breed: '' })
  }

  const handleDelete = (id) => {
    if (confirm('Delete this batch?')) {
      setBatches(batches.filter(b => b.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Batches</h1>
          <p className="text-gray-500">Manage your flock batches</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> New Batch
        </button>
      </div>

      {/* Batch Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Batch</th>
              <th className="text-left py-3 px-4">Farm</th>
              <th className="text-left py-3 px-4">Birds</th>
              <th className="text-left py-3 px-4">Age</th>
              <th className="text-left py-3 px-4">Weight</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Bird size={18} className="text-primary" />
                    <div>
                      <p className="font-medium">{batch.batchName}</p>
                      <p className="text-xs text-gray-500">{batch.startDate}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">{batch.farmName}</td>
                <td className="py-3 px-4">
                  <p className="font-medium">{batch.currentCount}</p>
                  <p className="text-xs text-gray-500">of {batch.birdCount}</p>
                </td>
                <td className="py-3 px-4">{batch.age} days</td>
                <td className="py-3 px-4">{batch.avgWeight} kg</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    batch.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {batch.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => handleDelete(batch.id)} className="p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Batch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm</label>
                <select
                  value={formData.farmId}
                  onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Farm</option>
                  {mockFarms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
                <input
                  type="text"
                  value={formData.batchName}
                  onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Batch #1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bird Count</label>
                <input
                  type="number"
                  value={formData.birdCount}
                  onChange={(e) => setFormData({ ...formData, birdCount: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="2000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary py-2">
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}