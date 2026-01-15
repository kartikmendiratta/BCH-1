import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Marketplace from './pages/Marketplace'
import Trade from './pages/Trade'
import Wallet from './pages/Wallet'
import Invoices from './pages/Invoices'
import InvoiceDetail from './pages/InvoiceDetail'
import CreateInvoice from './pages/CreateInvoice'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/trade/:id" element={<Trade />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/create" element={<CreateInvoice />} />
          <Route path="/invoice/:id" element={<InvoiceDetail />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
