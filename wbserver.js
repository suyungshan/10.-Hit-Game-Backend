import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;
const messageData = [];
const io = new Server(server, {
  cors: corsOptions,
});

const corsOptions = {
  origin: ["http://localhost:3000", "https://10-hit-game-backend.vercel.app/"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("WebSocket server is running!");
});

// 添加這一行
app.use("/socket.io", (req, res) => {
  res.sendStatus(404);
});

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("sendMessage", () => {
    io.emit("allMessage", "hollow");
  });
  socket.on("Start", () => {
    io.emit("redirectToGame");
  });
  socket.on("hit", (data) => {
    messageData.push(data);
    io.emit("allMessage", messageData);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server is listening on port ${PORT}`);
});
