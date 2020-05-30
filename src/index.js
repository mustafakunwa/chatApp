const path = require('path');
const http = require('http')
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDir = path.join(__dirname, '../public');

app.use(express.static(publicDir));

io.on('connection', () => {
    console.log('new webSocket Connection')
})

server.listen(port, () => {
    console.log('Server running on port ' + port);
});