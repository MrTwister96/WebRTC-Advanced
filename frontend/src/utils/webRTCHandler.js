import { setShowOverlay } from "../store/actions";
import store from "../store/store";
import * as wss from "./wss";
import Peer from "simple-peer";

const defaultConstraints = {
    audio: true,
    video: true,
};

let localStream;

export const getLocalPreviewAndInitRoomConnection = async (
    isRoomHost,
    identity,
    roomId = null
) => {
    navigator.mediaDevices
        .getUserMedia(defaultConstraints)
        .then((stream) => {
            console.log("Successfully got local stream");
            localStream = stream;
            showLocalVideoPreview(localStream);

            // dispatch an action to hide overlay
            store.dispatch(setShowOverlay(false));

            isRoomHost
                ? wss.createNewRoom(identity)
                : wss.joinRoom(identity, roomId);
        })
        .catch((err) => {
            console.log(
                "Error occurred when trying to get access to local stream"
            );
            console.log(err);
        });
};

const showLocalVideoPreview = (stream) => {
    // show local video preview
};

let peers = {};
let streams = [];

const getConfiguration = () => {
    return {
        iceServers: [
            {
                urls: "stun:stun.l.google.com:19302",
            },
        ],
    };
};

const addStream = (stream, connUserSocketId) => {
    // Display video steam
};

export const prepareNewPeerConnection = (connUserSocketId, isInitiator) => {
    const configuration = getConfiguration();

    peers[connUserSocketId] = new Peer({
        initiator: isInitiator,
        config: configuration,
        stream: localStream,
    });

    peers[connUserSocketId].on("signal", (data) => {
        const signalData = {
            signal: data,
            connUserSocketId: connUserSocketId,
        };

        wss.signalPeerData(signalData);
    });

    peers[connUserSocketId].on("stream", (stream) => {
        console.log("New Stream Received!");

        addStream(stream, connUserSocketId);

        streams = [...streams, stream];
    });
};

export const handleSignalingData = ({ signal, connUserSocketId }) => {
    peers[connUserSocketId].signal(signal);
};
