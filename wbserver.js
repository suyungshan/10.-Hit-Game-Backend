import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;
const corsOptions = {
  origin: ["http://localhost:3000", "https://gameplay.zeabur.app/"],
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Web server is running!");
});

const io = new Server(server, {
  path: "/socket.io/",
  cors: corsOptions,
});

server.listen(PORT, () => {
  console.log(`WebSocket server is listening on port ${PORT}`);
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

  socket.on("enterName", (data) => {
    // Check if messageData already contains an object with the same name
    const existingIndex = messageData.findIndex(
      (item) => item.name === data.name
    );

    if (existingIndex !== -1) {
      // If an object with the same name exists, send a warning message back to the client
      socket.emit("warning", "A user with this name already exists.");
      return; // Exit the function early
    } else {
      // If not, add the new object to messageData
      messageData.push(data);
      io.emit("allName", messageData);
    }
  });

  socket.on("hit", (data) => {
    // 檢查 messageData 中是否已經存在相同 name 的物件
    const existingIndex = messageData.findIndex(
      (item) => item.name === data.name
    );

    if (existingIndex !== -1) {
      // 如果存在，則覆蓋該物件
      messageData[existingIndex] = data;
    } else {
      // 如果不存在，則添加新的物件
      messageData.push(data);
    }
    io.emit("allMessage", messageData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
