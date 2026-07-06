import User from "./models/user.model.js"
import SupportChat from "./models/supportChat.model.js"

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New socket connected:', socket.id)

    // Register user identity
    socket.on('identity', async ({ userId }) => {
      try {
        await User.findByIdAndUpdate(userId, {
          socketId: socket.id, isOnline: true
        }, { new: true })
      } catch (error) {
        console.log(error)
      }
    })

    // Delivery boy location update
    socket.on('updateLocation', async ({ latitude, longitude, userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          isOnline: true,
          socketId: socket.id
        })

        if (user) {
          io.emit('updateDeliveryLocation', {
            deliveryBoyId: userId,
            latitude,
            longitude
          })
        }
      } catch (error) {
        console.log('updateDeliveryLocation error')
      }
    })

    // ─── Support Chat Events ───────────────────────────────────────

    // Join a support chat room
    socket.on('support:join', ({ chatId }) => {
      socket.join(`support_${chatId}`)
    })

    // Send a message in support chat
    socket.on('support:sendMessage', async ({ chatId, text, senderId, senderRole }) => {
      try {
        const chat = await SupportChat.findById(chatId)
        if (!chat) return

        const newMessage = {
          sender: senderId,
          senderRole,
          text
        }
        chat.messages.push(newMessage)
        await chat.save()

        const savedMsg = chat.messages[chat.messages.length - 1]

        // Broadcast to everyone in the chat room
        io.to(`support_${chatId}`).emit('support:newMessage', {
          chatId,
          message: {
            _id: savedMsg._id,
            sender: senderId,
            senderRole,
            text,
            createdAt: savedMsg.createdAt
          }
        })
      } catch (error) {
        console.log('support:sendMessage error', error)
      }
    })

    // Agent picks up a chat — notify user
    socket.on('support:agentJoined', async ({ chatId, agentName }) => {
      io.to(`support_${chatId}`).emit('support:agentJoined', { agentName })
    })

    // ──────────────────────────────────────────────────────────────

    socket.on('disconnect', async () => {
      try {
        await User.findOneAndUpdate({ socketId: socket.id }, {
          socketId: null,
          isOnline: false
        })
      } catch (error) {
        console.log(error)
      }
    })
  })
}