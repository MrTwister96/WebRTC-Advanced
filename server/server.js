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

    socket.on("join-room", (data) => {
        joinRoomHandler(data, socket);
    });

    socket.on("disconnect", () => {
        disconnectHandler(socket);
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

const joinRoomHandler = (data, socket) => {
    const { identity, roomId } = data;

    const newUser = {
        identity,
        id: uuidv4(),
        socketId: socket.id,
        roomId,
    };

    // Join room as user with room ID
    const room = rooms.find((room) => room.id === roomId);
    room.connectedUsers = [...room.connectedUsers, newUser];

    // Join Socket IO Room
    socket.join(roomId);

    // Push new user to the connectedUsers
    connectedUsers = [...connectedUsers, newUser];

    io.to(roomId).emit("room-update", { connectedUsers: room.connectedUsers });
};

const disconnectHandler = (socket) => {
    // check if user is registered and remove from room and connected users
    const user = connectedUsers.find((user) => user.socketId === socket.id);

    if (user) {
        // remove user from room n server
        const room = rooms.find((room) => room.id === user.roomId);

        room.connectedUsers = room.connectedUsers.filter(
            (user) => user.socketId !== socket.id
        );

        // Leave Socket IO room
        socket.leave(user.roomId);

        // Close the room is ammount of users left over is 0
        if (room.connectedUsers.length > 0) {
            // emit event to the rest of users new connected users in room
            io.to(room.id).emit("room-update", {
                connectedUsers: room.connectedUsers,
            });
        } else {
            rooms = rooms.filter((r) => r.id !== room.id);
        }
    }
};

server.listen(PORT, () => {
    console.log(`Server Started on TCP/${PORT}`);
});
