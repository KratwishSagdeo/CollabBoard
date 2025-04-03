const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
    }
});

app.use(express.static('public'));

let canvasState = [];

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);
    
    socket.emit('canvasState', canvasState);
    
    socket.on('draw', (data) => {
        canvasState.push(data);
        socket.broadcast.emit('draw', data);
    });

    socket.on('drawShape', (data) => {
        canvasState.push(data);
        socket.broadcast.emit('drawShape', data);
    });

    socket.on('clear', () => {
        canvasState = [];
        io.emit('clear');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});