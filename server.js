const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let canvasState = [];

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Send existing canvas state to new user
  socket.emit("load-canvas", canvasState);

  socket.on("draw", (data) => {
    canvasState.push(data);
    socket.broadcast.emit("draw", data);
  });

  socket.on("clear", () => {
    canvasState = [];
    io.emit("clear");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
