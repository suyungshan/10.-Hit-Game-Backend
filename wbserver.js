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
  credentials: true,
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
const MAX_CONNECTIONS = 400;
const MAX_MESSAGE_DATA = 400;
let activeConnections = new Set();

function checkMessageDataLength() {
  console.log(`目前 messageData 共有 ${messageData.length} 筆數據`);
  if (messageData.length >= MAX_MESSAGE_DATA) {
    console.log("messageData 已達到 300 筆數據");
    return true;
  }
  return false;
}

io.on("connection", (socket) => {
  console.log("A user connected");

  if (messageData.length >= MAX_MESSAGE_DATA) {
    console.log("messageData 已滿，拒絕新連接");
    socket.emit("maxDataReached");
    socket.disconnect(true);
    return;
  }

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
      if (checkMessageDataLength()) {
        socket.emit("maxDataReached");
        return;
      }

      const existingIndex = messageData.findIndex(
        (item) => item.name === data.name
      );

      if (existingIndex !== -1) {
        socket.emit("warning", "A user with this name already exists.");
        return;
      } else {
        messageData.push(data);
        io.emit("allName", messageData);
        if (checkMessageDataLength()) {
          io.emit("maxDataReached");
        }
      }
    });

    socket.on("hit", (data) => {
      if (checkMessageDataLength()) {
        socket.emit("maxDataReached");
        return;
      }

      const existingIndex = messageData.findIndex(
        (item) => item.name === data.name
      );

      if (existingIndex !== -1) {
        messageData[existingIndex] = data;
      } else {
        messageData.push(data);
      }
      io.emit("allMessage", messageData);
      if (checkMessageDataLength()) {
        io.emit("maxDataReached");
      }
    });

    socket.on("disconnect", () => {
      activeConnections.delete(socket.id);
      console.log(
        `連接斷開: ${socket.id}. 當前連接數: ${activeConnections.size}`
      );
    });
  } else {
    console.log("達到最大連接數，拒絕新連接");
    socket.emit("maxConnectionsReached");
    socket.disconnect(true);
  }
});

setInterval(() => {
  io.sockets.sockets.forEach((socket) => {
    if (!socket.connected) {
      activeConnections.delete(socket.id);
    }
  });
  console.log(`清理後的活躍連接數: ${activeConnections.size}`);
}, 30000);
