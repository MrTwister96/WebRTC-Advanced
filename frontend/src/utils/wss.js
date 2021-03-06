import io from "socket.io-client";
import { setParticipants, setRoomId, setSocketId } from "../store/actions";
import store from "../store/store";
import { appendNewMessageToChatHistory } from "./directMessages";
import * as webRTCHandler from "./webRTCHandler";

const SERVER = "http://localhost:5002";

let socket = null;

export const connectWithSocketIOServer = () => {
    socket = io(SERVER);

    socket.on("connect", () => {
        console.log("Successfully connected to Socket IO server");
        console.log(socket.id);
        store.dispatch(setSocketId(socket.id));
    });

    socket.on("room-id", ({ roomId }) => {
        store.dispatch(setRoomId(roomId));
    });

    socket.on("room-update", ({ connectedUsers }) => {
        store.dispatch(setParticipants(connectedUsers));
    });

    socket.on("conn-prepare", ({ connUserSocketId }) => {
        webRTCHandler.prepareNewPeerConnection(connUserSocketId, false);

        socket.emit("conn-init", { connUserSocketId });
    });

    socket.on("conn-signal", (data) => {
        webRTCHandler.handleSignalingData(data);
    });

    socket.on("conn-init", ({ connUserSocketId }) => {
        webRTCHandler.prepareNewPeerConnection(connUserSocketId, true);
    });

    socket.on("user-disconnected", ({ socketId }) => {
        webRTCHandler.removePeerConnection(socketId);
    });

    socket.on("direct-message", (data) => {
        appendNewMessageToChatHistory(data);
    });
};

export const createNewRoom = (identity, onlyAudio) => {
    // Tell server we want to create new room
    const data = {
        identity,
        onlyAudio,
    };

    socket.emit("create-new-room", data);
};

export const joinRoom = (identity, roomId, onlyAudio) => {
    // Tell server we want to join exisiting room
    const data = {
        roomId,
        identity,
        onlyAudio,
    };

    socket.emit("join-room", data);
};

export const signalPeerData = (signalData) => {
    socket.emit("conn-signal", signalData);
};

export const sendDirectMessage = (data) => {
    socket.emit("direct-message", data);
};
