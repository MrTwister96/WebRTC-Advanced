import io from "socket.io-client";
import { setparticipants, setRoomId } from "../store/actions";
import store from "../store/store";

const SERVER = "http://localhost:5002";

let socket = null;

export const connectWithSocketIOServer = () => {
    socket = io(SERVER);

    socket.on("connect", () => {
        console.log("Successfully connected to Socket IO server");
        console.log(socket.id);
    });

    socket.on("room-id", ({ roomId }) => {
        store.dispatch(setRoomId(roomId));
    });

    socket.on("room-update", ({ connectedUsers }) => {
        store.dispatch(setparticipants(connectedUsers));
    });
};

export const createNewRoom = (identity) => {
    // Tell server we want to create new room
    const data = {
        identity,
    };

    socket.emit("create-new-room", data);
};

export const joinRoom = (identity, roomId) => {
    // Tell server we want to join exisiting room
    const data = {
        roomId,
        identity,
    };

    socket.emit("join-room", data);
};
