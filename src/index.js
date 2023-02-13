const express = require('express')
const path = require('path');
const http = require('http')
const socketIO = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('../src/utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('../src/utils/users')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New socket connection!')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage(user.username, 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username,`${user.username} has joined!`))

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

        callback()
    })

    socket.on('emitMessage', (message, cb) => {
        const filter = new Filter()
        const user = getUser(socket.id)

        if (filter.isProfane(message)) {
            return cb('Profanity is not allow')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))

        cb()
    })

    socket.on('emitLocation', (location, cb) => {
        const user = getUser(socket.id)

        io.to(user.room).emit(
            'shareLocation',
            generateLocationMessage(user.username, `https://google.com/maps?q=${location.longitude},${location.latitude}`)
        )

        cb()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage( user.username,`${user.username} has left`))
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
        }
    })
})

server.listen(port, () => {
    console.log(`server is up on port ${port}`)
})
