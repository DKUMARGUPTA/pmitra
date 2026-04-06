import { useState } from 'react'
import { TrendingUp, TrendingDown, MapPin, Plus, AlertTriangle } from 'lucide-react'

export default function MarketPrices() {
  const [prices, setPrices] = useState([
    { id: 1, district: 'Delhi', item: 'Eggs (Tray)', price: 280, prevPrice: 265, date: '2026-04-05' },
    { id: 2, district: 'Delhi', item: 'Layer Bird (kg)', price: 120, prevPrice: 125, date: '2026-04-05' },
    { id: 3, district: 'Gurgaon', item: 'Eggs (Tray)', price: 275, prevPrice: 280, date: '2026-04-05' },
    { id: 4, district: 'Gurgaon', item: 'Layer Bird (kg)', price: 118, prevPrice: 115, date: '2026-04-05' },
    { id: 5, district: 'Noida', item: 'Eggs (Tray)', price: 282, prevPrice: 270, date: '2026-04-05' },
    { id: 6, district: 'Noida', item: 'Layer Bird (kg)', price: 122, prevPrice: 120, date: '2026-04-05' },
    { id: 7, district: 'Faridabad', item: 'Eggs (Tray)', price: 278, prevPrice: 278, date: '2026-04-05' },
    { id: 8, district: 'Faridabad', item: 'Layer Bird (kg)', price: 115, prevPrice: 118, date: '2026-04-05' },
  ])

  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    district: '',
    item: '',
    price: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setPrices([{ 
      ...formData, 
      id: Date.now(), 
      prevPrice: parseInt(formData.price),
      date: new Date().toISOString().split('T')[0] 
    }, ...prices])
    setShowModal(false)
    setFormData({ district: '', item: '', price: '' })
  }

  const getChange = (price, prevPrice) => {
    const change = ((price - prevPrice) / prevPrice * 100).toFixed(1)
    return { value: change, isUp: price > prevPrice }
  }

  const districts = [...new Set(prices.map(p => p.district))]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Market Prices</h1>
          <p className="text-gray-500">Real-time market rates</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Price
        </button>
      </div>

      {/* Alerts */}
      <div className="card bg-yellow-50 border border-yellow-200">
        <h3 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
          <AlertTriangle size={20} /> Price Alerts
        </h3>
        <p className="text-sm text-yellow-700">
          • Delhi Eggs: +5.7% • Gurgaon Layer Bird: -1.6% • Noida Eggs: +4.4%
        </p>
      </div>

      {/* District Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {districts.map(district => (
          <button
            key={district}
            className="px-4 py-2 bg-white border rounded-lg hover:border-primary whitespace-nowrap"
          >
            {district}
          </button>
        ))}
      </div>

      {/* Prices by District */}
      <div className="grid md:grid-cols-2 gap-6">
        {districts.map(district => {
          const districtPrices = prices.filter(p => p.district === district)
          return (
            <div key={district} className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                {district}
              </h3>
              <div className="space-y-3">
                {districtPrices.map(item => {
                  const change = getChange(item.price, item.prevPrice)
                  return (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.item}</p>
                        <p className="text-xs text-gray-500">{item.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">₹{item.price}</p>
                        <p className={`text-sm flex items-center gap-1 ${change.isUp ? 'text-green-600' : 'text-red-600'}`}>
                          {change.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {change.value}%
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Market Price</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Delhi"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                <input
                  type="text"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Eggs (Tray)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="280"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 btn-primary py-2">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}