import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);
const corsOptions = {
  origin: [
    "http://localhost:3000",
    /^https:\/\/10-hit-game-backend\.vercel\.app\//,
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("WebSocket server is running!");
});

const io = new Server(server, {
  cors: corsOptions,
});

const messageData = [];

io.on("connection", (socket) => {
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
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`WebSocket server is listening on port ${PORT}`);
});
