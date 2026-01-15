import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { initDB } from './config/db'
import authRoutes from './routes/auth.routes'
import offerRoutes from './routes/offer.routes'
import tradeRoutes from './routes/trade.routes'
import invoiceRoutes from './routes/invoice.routes'
import walletRoutes from './routes/wallet.routes'
import priceRoutes from './routes/price.routes'
import { setupSocket } from './socket/chat.socket'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/offers', offerRoutes)
app.use('/api/trades', tradeRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/price', priceRoutes)

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Socket.io
setupSocket(io)

// Export io for use in controllers
export { io }

// Start server
const PORT = process.env.PORT || 3000

initDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
})
