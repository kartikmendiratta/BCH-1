import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { supabase } from '../config/db'

export function setupSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Join trade room
    socket.on('join_trade', (tradeId: string) => {
      socket.join(`trade_${tradeId}`)
      console.log(`Socket ${socket.id} joined trade_${tradeId}`)
    })

    // Leave trade room
    socket.on('leave_trade', (tradeId: string) => {
      socket.leave(`trade_${tradeId}`)
    })

    // Send message
    socket.on('send_message', async (data: { tradeId: string; content: string; token?: string }) => {
      try {
        const { tradeId, content, token } = data

        // Get user from token (passed from client or handshake)
        const authToken = token || socket.handshake.auth.token
        if (!authToken) {
          socket.emit('error', { message: 'Not authenticated' })
          return
        }

        const decoded = jwt.verify(authToken, process.env.JWT_SECRET || 'secret') as { userId: number }
        const userId = decoded.userId

        // Save message
        const { data: message, error } = await supabase
          .from('messages')
          .insert({
            trade_id: parseInt(tradeId),
            sender_id: userId,
            content
          })
          .select('id, trade_id, sender_id, content, created_at')
          .single()

        if (error) {
          console.error('Message save error:', error)
          socket.emit('error', { message: 'Failed to send message' })
          return
        }

        // Broadcast to trade room
        io.to(`trade_${tradeId}`).emit('new_message', message)
      } catch (err) {
        console.error('Message error:', err)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })
}

// Helper to emit trade updates from controllers
export function emitTradeUpdate(io: Server, tradeId: number, status: string) {
  io.to(`trade_${tradeId}`).emit('trade_update', { tradeId, status })
}
