import { useState } from 'react'
import { Save, Calendar, TrendingUp, AlertTriangle, Scale, Droplets } from 'lucide-react'

export default function DailyEntry() {
  const [formData, setFormData] = useState({
    batchId: '',
    date: new Date().toISOString().split('T')[0],
    feedConsumed: '',
    mortality: '0',
    avgWeight: '',
    waterConsumed: '',
    notes: ''
  })

  const mockBatches = [
    { id: 1, name: 'Batch #1 - Farm A', age: 35, birds: 1950 },
    { id: 2, name: 'Batch #2 - Farm A', age: 21, birds: 2150 },
    { id: 3, name: 'Batch #1 - Farm B', age: 5, birds: 2800 },
  ]

  const [saved, setSaved] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Save to API
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setFormData({
      ...formData,
      feedConsumed: '',
      mortality: '0',
      avgWeight: '',
      waterConsumed: '',
      notes: ''
    })
  }

  const selectedBatch = mockBatches.find(b => b.id === parseInt(formData.batchId))

  // Calculate FCR
  const feed = parseFloat(formData.feedConsumed) || 0
  const weight = parseFloat(formData.avgWeight) || 0
  const birds = selectedBatch?.birds || 1
  const fcr = weight > 0 ? (feed / (weight * birds)).toFixed(2) : '-'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Daily Entry</h1>
        <p className="text-gray-500">Record daily data for your batches</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Batch Selection */}
        <div className="card">
          <h3 className="font-semibold mb-4">Select Batch</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {mockBatches.map(batch => (
              <label
                key={batch.id}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                  parseInt(formData.batchId) === batch.id 
                    ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="batchId"
                  value={batch.id}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                  className="sr-only"
                />
                <p className="font-medium">{batch.name}</p>
                <p className="text-sm text-gray-500">{batch.age} days • {batch.birds} birds</p>
              </label>
            ))}
          </div>
        </div>

        {/* Data Entry */}
        <div className="card">
          <h3 className="font-semibold mb-4">Daily Data</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Scale size={16} className="inline mr-1" />
                Feed Consumed (kg)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.feedConsumed}
                onChange={(e) => setFormData({ ...formData, feedConsumed: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="350"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <AlertTriangle size={16} className="inline mr-1" />
                Mortality (birds)
              </label>
              <input
                type="number"
                value={formData.mortality}
                onChange={(e) => setFormData({ ...formData, mortality: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <TrendingUp size={16} className="inline mr-1" />
                Average Weight (kg)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.avgWeight}
                onChange={(e) => setFormData({ ...formData, avgWeight: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="2.35"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Droplets size={16} className="inline mr-1" />
                Water Consumed (L)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.waterConsumed}
                onChange={(e) => setFormData({ ...formData, waterConsumed: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Any observations..."
              rows={2}
            />
          </div>
        </div>

        {/* Live Calculations */}
        <div className="card bg-gradient-to-r from-primary/10 to-secondary/10">
          <h3 className="font-semibold mb-4">Live Calculations</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-500">FCR</p>
              <p className="text-2xl font-bold text-primary">{fcr}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-500">Weight Gain</p>
              <p className="text-2xl font-bold text-secondary">+{((weight - 2.05) * 100).toFixed(1)}g</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-500">Feed/Bird</p>
              <p className="text-2xl font-bold text-gray-700">{(feed / birds * 1000).toFixed(1)}g</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-500">Mortality %</p>
              <p className="text-2xl font-bold text-red-600">{((parseInt(formData.mortality) / birds) * 100).toFixed(2)}%</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary flex items-center gap-2 px-8">
            <Save size={20} />
            {saved ? 'Saved!' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  )
}