import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const corsOptions = {
  origin: [
    "http://localhost:3000",
    /^https:\/\/10-hit-game-backend\.vercel\.app\//,
  ],
  methods: ["GET", "POST"],
};

const corsMiddleware = cors(corsOptions);

const server = createServer();
const messageData = [];
const PORT = process.env.PORT || 3002;

const io = new Server(server, {
  cors: corsOptions,
});

// 先暫存請求
const requestQueue = [];

// 註冊中間件
server.on("request", async (req, res) => {
  requestQueue.push({ req, res });
});

server.on("listening", async () => {
  console.log("web connect"); // 在這裡輸出 "web connect"

  for (const { req, res } of requestQueue) {
    try {
      await corsMiddlewareWrapper(req, res);
      // 繼續處理請求
    } catch (err) {
      console.error("CORS錯誤:", err);
      res.statusCode = 500;
      res.end();
    }
  }
  requestQueue.length = 0;
});

const corsMiddlewareWrapper = (req, res) => {
  return new Promise((resolve, reject) => {
    corsMiddleware(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

server.listen(PORT, () => {
  console.log(`WebSocket server is listening on port ${PORT}`);
});

server.listen("https://10-hit-game-backend.vercel.app/", () => {
  console.log(
    `WebSocket server is listening on port https://10-hit-game-backend.vercel.app/`
  );
});

io.on("connection", (socket) => {
  console.log("websocket connect"); // 在這裡輸出 "websocket connect"
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
