const socketIO = require('socket.io')

let io

const initSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling']
    })

    io.on('connection', (socket) => {
        console.log(`🟢 [Socket] New connection: ${socket.id}`)

        // 🔥 ALL USERS + ADMIN JOIN SAME ROOM
        const ROOM_NAME = "User_room"
        socket.join(ROOM_NAME)

        console.log(`📦 [Socket] ${socket.id} joined room: ${ROOM_NAME}`)

        // ✅ Optional: Identify admin (for debugging / future use)
        socket.on('identify_admin', () => {
            socket.isAdmin = true
            console.log(`👩‍💼 [Socket] Admin identified: ${socket.id}`)
        })

        // ✅ Optional: Identify user (not required but helpful)
        socket.on('identify_user', () => {
            socket.isUser = true
            console.log(`👤 [Socket] User identified: ${socket.id}`)
        })

        // ❌ No need for guestSessionId anymore

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`🔴 [Socket] Disconnected: ${socket.id}`)
        })

        // Error handling
        socket.on('error', (error) => {
            console.error(`❌ [Socket] Error: ${error}`)
        })
    })

    return io
}

// 🔥 Getter
const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized')
    }
    return io
}

module.exports = { initSocket, getIO }