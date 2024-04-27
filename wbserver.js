import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);
let isWebSocketConnected = false;
const PORT = process.env.PORT || 3001;
const corsOptions = {
  origin: ["*"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Web server is running!");
  if (isWebSocketConnected) {
    res.send("WebSocket 服务器已连接！");
  } else {
    res.send("Web 服务器正在运行！");
  }
});

const io = new Server(server, {
  cors: corsOptions,
});

const messageData = [];

io.on("connection", (socket) => {
  isWebSocketConnected = true;
  console.log("A user connected");

  socket.on("sendMessage", () => {
    io.emit("allMessage", "hollow");
  });

  socket.on("Start", () => {
    io.emit("redirectToGame");
  });

  socket.on("hit", (data) => {
    // Add the received data to the messageData array
    messageData.push(data);
    io.emit("allMessage", messageData);
  });

  socket.on("disconnect", () => {
    isWebSocketConnected = false;
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server is listening on port ${PORT}`);
});
