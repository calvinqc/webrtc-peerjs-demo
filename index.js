// Import dependencies
const express = require('express');
const { v4: uuidV4 } = require('uuid');

// Init Node.js app
const app = express();

// Build the server
const server = require('http').Server(app);

// Connect server with Socket
const io = require('socket.io')(server);

// Config Express app
app.set('view engine', 'ejs');
app.use(express.static('public'));

/**
 * Route Handler
 */
app.get('/', (req, res) => res.redirect(`/${uuidV4()}`));
app.get('/:room', (req, res) =>
    res.render('room', { roomId: req.params.room })
);

io.on('connection', (socket) => {
    // Join the room whenever there is new socket
    socket.on('join', (roomId, socketID) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('new-user-connected', socketID);
        socket.on('disconnect', () => {
            console.log('user disconnected', socketID);
            socket.to(roomId).broadcast.emit('user-disconnected', socketID);
        });
    });
});

server.listen(3000);
