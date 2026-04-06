import { useState } from 'react'
import { Plus, Package, AlertTriangle, Edit, Trash2, TrendingDown, TrendingUp } from 'lucide-react'

export default function Inventory() {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Layer Feed', quantity: 1500, unit: 'kg', minStock: 500, price: 32, category: 'feed' },
    { id: 2, name: 'Starter Feed', quantity: 800, unit: 'kg', minStock: 300, price: 35, category: 'feed' },
    { id: 3, name: 'Grower Feed', quantity: 1200, unit: 'kg', minStock: 400, price: 30, category: 'feed' },
    { id: 4, name: 'Vitamin Complex', quantity: 25, unit: 'packets', minStock: 10, price: 450, category: 'medicine' },
    { id: 5, name: 'Antibiotic - Enro', quantity: 15, unit: 'packets', minStock: 5, price: 320, category: 'medicine' },
    { id: 6, name: 'Vaccine (Fowl)', quantity: 50, unit: 'doses', minStock: 20, price: 85, category: 'medicine' },
    { id: 7, name: 'Day-Old Chicks', quantity: 0, unit: 'birds', minStock: 0, price: 45, category: 'chicks' },
    { id: 8, name: 'Disinfectant', quantity: 30, unit: 'liters', minStock: 10, price: 180, category: 'other' },
  ])

  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    minStock: '',
    price: '',
    category: 'feed'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setInventory([{ ...formData, id: Date.now() }, ...inventory])
    setShowModal(false)
    setFormData({ name: '', quantity: '', unit: 'kg', minStock: '', price: '', category: 'feed' })
  }

  const handleDelete = (id) => {
    if (confirm('Delete this item?')) {
      setInventory(inventory.filter(i => i.id !== id))
    }
  }

  const getStockStatus = (item) => {
    if (item.quantity <= item.minStock) return 'danger'
    if (item.quantity <= item.minStock * 1.5) return 'warning'
    return 'ok'
  }

  const totalValue = inventory.reduce((sum, i) => sum + (i.quantity * i.price), 0)
  const lowStockItems = inventory.filter(i => i.quantity <= i.minStock)

  const categories = [...new Set(inventory.map(i => i.category))]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-500">Manage your stock</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <Package size={24} className="text-primary" />
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold">{inventory.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <TrendingUp size={24} className="text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Inventory Value</p>
              <p className="text-2xl font-bold">₹{totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-red-600" />
            <div>
              <p className="text-sm text-red-700">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-700">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="card bg-red-50 border border-red-200">
          <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={20} /> Low Stock Alerts
          </h3>
          <div className="space-y-2">
            {lowStockItems.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded-lg">
                <span className="font-medium">{item.name}</span>
                <span className="text-red-600 text-sm">
                  {item.quantity} {item.unit} (min: {item.minStock})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Item</th>
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-left py-3 px-4">Quantity</th>
              <th className="text-left py-3 px-4">Price</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => {
              const status = getStockStatus(item)
              return (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs capitalize">{item.category}</span>
                  </td>
                  <td className="py-3 px-4">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3 px-4">₹{item.price}/{item.unit}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      status === 'danger' ? 'bg-red-100 text-red-700' :
                      status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {status === 'danger' ? 'Critical' : status === 'warning' ? 'Low' : 'OK'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Inventory Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="kg">kg</option>
                    <option value="liters">liters</option>
                    <option value="packets">packets</option>
                    <option value="doses">doses</option>
                    <option value="birds">birds</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
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
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="feed">Feed</option>
                  <option value="medicine">Medicine</option>
                  <option value="chicks">Chicks</option>
                  <option value="other">Other</option>
                </select>
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