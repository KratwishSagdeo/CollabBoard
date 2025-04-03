const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: ["https://yourfrontend.com", "http://localhost:3000"],
  methods: ["GET", "POST"],
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://yourfrontend.com", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

let canvasState = [];
const MAX_CANVAS_HISTORY = 5000; // Prevents memory overflow

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Send existing canvas state to new user
  if (canvasState.length > 0) {
    socket.emit("load-canvas", canvasState);
  }

  socket.on("draw", (data) => {
    if (canvasState.length >= MAX_CANVAS_HISTORY) {
      canvasState.shift(); // Remove the oldest entry if limit exceeded
    }
    canvasState.push(data);
    io.emit("draw", data); // Send drawing data to all clients including sender
  });

  socket.on("clear", () => {
    canvasState = [];
    io.emit("clear");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
