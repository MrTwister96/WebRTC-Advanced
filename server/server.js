const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const twilio = require("twilio");
require("dotenv").config();

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

app.get("/api/get-turn-credentials", (req, res) => {
    const client = twilio(
        process.env.TWILLIO_ACCOUNT_SID,
        process.env.TWILLIO_AUTH_TOKEN
    );

    try {
        client.tokens.create().then((token) => {
            res.send({ token });
        });
    } catch (err) {
        console.log("Error Occured when fetching TURN server credentials");
        console.log(err);
        res.send({ token: null });
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

    socket.on("conn-signal", (signalData) => {
        signalingHandler(signalData, socket);
    });
    socket.on("conn-init", (data) => {
        initConnectionHandler(data, socket);
    });
});

// Socket IO handlers

const createNewRoomHandler = ({ identity, onlyAudio }, socket) => {
    const roomId = uuidv4();

    // Create new user object
    const newUser = {
        identity,
        id: uuidv4(),
        socketId: socket.id,
        roomId,
        onlyAudio,
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

const joinRoomHandler = ({ identity, roomId, onlyAudio }, socket) => {
    const newUser = {
        identity,
        id: uuidv4(),
        socketId: socket.id,
        roomId,
        onlyAudio,
    };

    // Join room as user with room ID
    const room = rooms.find((room) => room.id === roomId);
    room.connectedUsers = [...room.connectedUsers, newUser];

    // Join Socket IO Room
    socket.join(roomId);

    // Push new user to the connectedUsers
    connectedUsers = [...connectedUsers, newUser];

    // Emit to all users in room that they should prepare for peer conneciton
    room.connectedUsers.forEach((user) => {
        if (user.socketId !== socket.id) {
            const data = {
                connUserSocketId: socket.id,
            };

            io.to(user.socketId).emit("conn-prepare", data);
        }
    });

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
            // Emit to all users still in room that user disconnected
            io.to(room.id).emit("user-disconnected", { socketId: socket.id });

            // emit event to the rest of users new connected users in room
            io.to(room.id).emit("room-update", {
                connectedUsers: room.connectedUsers,
            });
        } else {
            rooms = rooms.filter((r) => r.id !== room.id);
        }
    }
};

const signalingHandler = ({ signal, connUserSocketId }, socket) => {
    const signalingData = {
        signal,
        connUserSocketId: socket.id,
    };

    io.to(connUserSocketId).emit("conn-signal", signalingData);
};

const initConnectionHandler = ({ connUserSocketId }, socket) => {
    const initData = {
        connUserSocketId: socket.id,
    };
    io.to(connUserSocketId).emit("conn-init", initData);
};

server.listen(PORT, () => {
    console.log(`Server Started on TCP/${PORT}`);
});
