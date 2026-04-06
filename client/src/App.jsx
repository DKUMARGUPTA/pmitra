import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/authStore'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Farms from './pages/Farms'
import Batches from './pages/Batches'
import DailyEntry from './pages/DailyEntry'
import Ledger from './pages/Ledger'
import Inventory from './pages/Inventory'
import MarketPrices from './pages/MarketPrices'
import AIChat from './pages/AIChat'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="farms" element={<Farms />} />
          <Route path="batches" element={<Batches />} />
          <Route path="daily-entry" element={<DailyEntry />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="market" element={<MarketPrices />} />
          <Route path="ai-chat" element={<AIChat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}