const path = require('path');
const http = require('http')
const express = require("express");
const socketio = require("socket.io");
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const { genrateMessage, genrateLocationMessage } = require('./utils/messages');
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users');

const port = process.env.PORT || 3000;

const publicDir = path.join(__dirname, '../public');

app.use(express.static(publicDir));

io.on('connection', (socket) => {
    console.log('new webSocket Connection');


    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }
        socket.join(user.room);
        socket.emit("message", genrateMessage(undefined, 'Welcome!'));
        socket.broadcast.to(user.room).emit("message", genrateMessage(undefined, `${user.username} has joined `));
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('profanity is not allowed')
        }
        io.to(user.room).emit('message', genrateMessage(user.username, message));
        callback()
    })

    socket.on('sendLocation', (coord, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit("locationMessage", genrateLocationMessage(user.username, `${coord.lat},${coord.lng}`))
        callback()
    })


    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user)
            return io.to(user.room).emit("message", genrateMessage(undefined, `${user.username} has left!`))

    })
})




server.listen(port, () => {
    console.log('Server running on port ' + port);
});