const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const twilio = require("twilio");

const PORT = process.env.PORT || 5002;

const app = express();

const server = http.createServer(app);

app.use(cors());

let connectedUsers = [];
let rooms = [];

// Create route to check if room exists
app.get("/api/room-exists/:roomId", (req, res) => {
    const { roomId } = req.params;
    const room = rooms.find((room) => room.id === roomId);

    if (room) {
        if (room.connectedUsers.length > 3) {
            return res.send({ roomExists: true, full: true });
        } else {
            return res.send({ roomExists: true, full: false });
        }
    } else {
        return res.send({ roomExists: false });
    }
});

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log(`User Connected ${socket.id}`);

    socket.on("create-new-room", (data) => {
        createNewRoomHandler(data, socket);
    });
});

// Socket IO handlers

const createNewRoomHandler = (data, socket) => {
    const { identity } = data;

    const roomId = uuidv4();

    // Create new user object
    const newUser = {
        identity,
        id: uuidv4(),
        socketId: socket.id,
        roomId,
    };

    // Push new user to the connectedUsers
    connectedUsers = [...connectedUsers, newUser];

    // Create new Room
    const newRoom = {
        id: roomId,
        connectedUsers: [newUser],
    };

    // Join Socker IO Room
    socket.join(roomId);

    rooms = [...rooms, newRoom];

    // emit to client who created room that room roomId
    socket.emit("room-id", { roomId });

    // emit an event to all users connected to that room about
    // new users who are joining the room
    socket.emit("room-update", { connectedUsers: newRoom.connectedUsers });
};

server.listen(PORT, () => {
    console.log(`Server Started on TCP/${PORT}`);
});
