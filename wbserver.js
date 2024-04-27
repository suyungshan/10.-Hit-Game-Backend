import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const messageData = [];

app.get("/", (req, res) => {
  res.send("WebSocket server is running!");
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
