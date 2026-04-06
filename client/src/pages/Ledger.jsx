import { useState } from 'react'
import { Plus, Send, Wallet, ArrowUp, ArrowDown, User } from 'lucide-react'

export default function Ledger() {
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'credit', amount: 50000, description: 'Feed purchase - Dealer A', date: '2026-04-05', party: 'Dealer A' },
    { id: 2, type: 'debit', amount: 25000, description: 'Egg sales', date: '2026-04-04', party: 'Market' },
    { id: 3, type: 'credit', amount: 15000, description: 'Medicine purchase', date: '2026-04-03', party: 'Dealer B' },
    { id: 4, type: 'debit', amount: 10000, description: 'Electricity bill', date: '2026-04-02', party: 'Utility' },
    { id: 5, type: 'debit', amount: 8000, description: 'Labour wages', date: '2026-04-01', party: 'Workers' },
  ])

  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    type: 'credit',
    amount: '',
    description: '',
    party: '',
    date: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setTransactions([{ ...formData, id: Date.now() }, ...transactions])
    setShowModal(false)
    setFormData({ type: 'credit', amount: '', description: '', party: '', date: new Date().toISOString().split('T')[0] })
  }

  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
  const totalDebit = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalCredit - totalDebit

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ledger</h1>
          <p className="text-gray-500">Track your income and expenses</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Transaction
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card bg-green-50 border border-green-200">
          <div className="flex items-center gap-3">
            <ArrowUp size={24} className="text-green-600" />
            <div>
              <p className="text-sm text-green-700">Total Income</p>
              <p className="text-2xl font-bold text-green-700">₹{totalCredit.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-center gap-3">
            <ArrowDown size={24} className="text-red-600" />
            <div>
              <p className="text-sm text-red-700">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700">₹{totalDebit.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <Wallet size={24} className="text-primary" />
            <div>
              <p className="text-sm text-primary">Current Balance</p>
              <p className="text-2xl font-bold text-primary">₹{balance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <h3 className="font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${t.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {t.type === 'credit' ? <ArrowUp size={18} className="text-green-600" /> : <ArrowDown size={18} className="text-red-600" />}
                </div>
                <div>
                  <p className="font-medium">{t.description}</p>
                  <p className="text-sm text-gray-500">{t.party} • {t.date}</p>
                </div>
              </div>
              <p className={`font-semibold ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="flex gap-4">
                  <label className="flex-1 p-3 border-2 rounded-lg cursor-pointer text-center">
                    <input type="radio" name="type" value="credit" onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="sr-only" />
                    <ArrowUp size={20} className="inline mr-1 text-green-600" />
                    Income
                  </label>
                  <label className="flex-1 p-3 border-2 rounded-lg cursor-pointer text-center">
                    <input type="radio" name="type" value="debit" onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="sr-only" />
                    <ArrowDown size={20} className="inline mr-1 text-red-600" />
                    Expense
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="5000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Feed purchase"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Party/Party</label>
                <input
                  type="text"
                  value={formData.party}
                  onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Dealer A"
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