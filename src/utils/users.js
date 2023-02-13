const users = []

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return { error: 'Username or room are required!'}
    }

    const existingUser = users.find(user => user.username === username && user.room === room)

    if (existingUser) {
        return { error: 'Username is in use' }
    }

    const user = { id, username, room }
    users.push(user)

    return { user }
}

const removeUser = id => {
    const index = users.findIndex(user => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = id => {
    return users.find(user => user.id === id);
}

const getUsersInRoom = roomName => {
    roomName = roomName.trim().toLowerCase()

    return users.filter(user => user.room === roomName)
}

// addUser({id: 1, username: 'Baby', room: 'Kyiv'})
// addUser({id: 2, username: 'Cock', room: 'Kyiv'})
// addUser({id: 3, username: 'Fish', room: 'v'})

module.exports = { addUser, removeUser, getUser, getUsersInRoom }
