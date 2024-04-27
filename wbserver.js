import { createServer } from "http";
import { Server } from "socket.io";

// const app = express();
const server = createServer();

const messageData = [];
const PORT = process.env.PORT || 3001;
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      /^https:\/\/10-hit-game-backend\.vercel\.app\/$/,
    ],
    methods: ["GET", "POST"],
  },
});

server.listen(PORT, () => {
  console.log(`WebSocket server is listening on port ${PORT}`);
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
