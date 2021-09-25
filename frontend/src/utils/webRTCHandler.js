import { setShowOverlay } from "../store/actions";
import store from "../store/store";
import * as wss from "./wss";
import Peer from "simple-peer";

const defaultConstraints = {
    audio: true,
    video: false,
    // video: {
    //     width: "480",
    //     height: "360",
    // },
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

export const removePeerConnection = (socketId) => {
    const videoContainer = document.getElementById(socketId);

    const videoElement = document.getElementById(`${socketId}-video`);

    if (videoContainer && videoElement) {
        const tracks = videoElement.srcObject.getTracks();

        tracks.forEach((t) => t.stop());

        videoElement.srcObject = null;
        videoContainer.removeChild(videoElement);
        videoContainer.parentNode.removeChild(videoContainer);

        if (peers[socketId]) {
            peers[socketId].destroy();
        }
        delete peers[socketId];
    }
};

/////////////// UI VIDEOS /////////////

const showLocalVideoPreview = (stream) => {
    // show local video preview
    const videosContainer = document.getElementById("videos_portal");
    videosContainer.classList.add("videos_portal_styles");

    const videoContainer = document.createElement("div");
    videoContainer.classList.add("video_track_container");

    const videoElement = document.createElement("video");
    videoElement.autoplay = true;
    videoElement.muted = true;
    videoElement.srcObject = stream;

    videoElement.onloadedmetadata = () => {
        videoElement.play();
    };

    videoContainer.appendChild(videoElement);
    videosContainer.appendChild(videoContainer);
};

const addStream = (stream, connUserSocketId) => {
    // Display video steam
    const videosContainer = document.getElementById("videos_portal");
    const videoContainer = document.createElement("div");
    videoContainer.id = connUserSocketId;

    videoContainer.classList.add("video_track_container");

    const videoElement = document.createElement("video");
    videoElement.autoplay = true;
    videoElement.srcObject = stream;
    videoElement.id = `${connUserSocketId}-video`;

    videoElement.onloadedmetadata = () => {
        videoElement.play();
    };

    videoElement.addEventListener("click", () => {
        if (videoElement.classList.contains("full_screen")) {
            videoElement.classList.remove("full_Screen");
        } else {
            videoElement.classList.add("full_Screen");
        }
    });

    videoContainer.appendChild(videoElement);
    videosContainer.appendChild(videoContainer);
};
