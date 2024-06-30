import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Web server is running!");
});

const io = new Server(server, {
  path: "/socket.io/",
  cors: corsOptions,
  allowRequest: (req, callback) => {
    const origin = req.headers.origin;
    if (
      origin === "http://localhost:3000" ||
      origin === "https://gameplay.zeabur.app/"
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
});

server.listen(PORT, () => {
  console.log(`WebSocket server is listening on port ${PORT}`);
});

const messageData = [];
const MAX_CONNECTIONS = 10;
let activeConnections = new Set();

io.on("connection", (socket) => {
  console.log("A user connected");

  if (activeConnections.size < MAX_CONNECTIONS) {
    activeConnections.add(socket.id);
    console.log(`新連接: ${socket.id}. 當前連接數: ${activeConnections.size}`);

    socket.on("firstConnect", () => {
      io.emit("allMessage", messageData);
    });

    socket.on("firstNameConnect", () => {
      io.emit("allName", messageData);
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
      activeConnections.delete(socket.id);
      console.log(
        `連接斷開: ${socket.id}. 當前連接數: ${activeConnections.size}`
      );
    });
  } else {
    console.log("達到最大連接數，拒絕新連接");
    socket.disconnect(true);
  }
});

// 定期清理斷開的連接
setInterval(() => {
  io.sockets.sockets.forEach((socket) => {
    if (!socket.connected) {
      activeConnections.delete(socket.id);
    }
  });
  console.log(`清理後的活躍連接數: ${activeConnections.size}`);
}, 30000); // 每
