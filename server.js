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
canvas.addEventListener('mousedown', (event) => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
    socket.emit("startDrawing", { x: event.offsetX, y: event.offsetY });
});

canvas.addEventListener('mousemove', (event) => {
    if (!drawing) return;

    let x = event.offsetX;
    let y = event.offsetY;

    if (tool === 'pencil') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);

        // 🔥 Emit event to server for real-time drawing
        socket.emit("draw", { x, y, color });
    } 
    else if (tool === 'eraser') {
        ctx.clearRect(x - eraserSize / 2, y - eraserSize / 2, eraserSize, eraserSize);
    }
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
    ctx.beginPath();
    socket.emit("stopDrawing");
});

// 🎯 Socket Events to Sync Drawing on Other Devices
socket.on("startDrawing", ({ x, y }) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
});

socket.on("draw", ({ x, y, color }) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
});
