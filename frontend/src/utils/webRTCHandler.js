import { setShowOverlay, setMessages } from "../store/actions";
import store from "../store/store";
import * as wss from "./wss";
import Peer from "simple-peer";
import { fetchTURNCredentials, getTURNIceServers } from "./turn";

const defaultConstraints = {
    audio: true,
    video: true,
};
const onlyAudioConstraints = {
    audio: true,
    video: false,
};

let localStream;

export const getLocalPreviewAndInitRoomConnection = async (
    isRoomHost,
    identity,
    roomId = null,
    onlyAudio
) => {
    await fetchTURNCredentials();

    const constraints = onlyAudio ? onlyAudioConstraints : defaultConstraints;

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
            console.log("Successfully got local stream");
            localStream = stream;
            showLocalVideoPreview(localStream);

            // dispatch an action to hide overlay
            store.dispatch(setShowOverlay(false));

            isRoomHost
                ? wss.createNewRoom(identity, onlyAudio)
                : wss.joinRoom(identity, roomId, onlyAudio);
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
    const turnIceServers = getTURNIceServers();

    if (turnIceServers) {
        return {
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302",
                },
                ...turnIceServers,
            ],
        };
    } else {
        console.warn("Using Only STUN Server!");
        return {
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302",
                },
            ],
        };
    }
};

const messengerChannel = "messenger";

export const prepareNewPeerConnection = (connUserSocketId, isInitiator) => {
    const configuration = getConfiguration();

    peers[connUserSocketId] = new Peer({
        initiator: isInitiator,
        config: configuration,
        stream: localStream,
        channelName: messengerChannel,
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

    peers[connUserSocketId].on("data", (data) => {
        const messageData = JSON.parse(data);
        appendNewMessage(messageData);
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

    if (store.getState().connectOnlyWithAudio) {
        videoContainer.appendChild(getAudioOnlyLabel());
    }

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
            videoElement.classList.remove("full_screen");
        } else {
            videoElement.classList.add("full_screen");
        }
    });

    videoContainer.appendChild(videoElement);

    // Check if user connected with Audio Only
    const participants = store.getState().participants;
    const participant = participants.find(
        (p) => p.socketId === connUserSocketId
    );

    if (participant?.onlyAudio) {
        videoContainer.appendChild(getAudioOnlyLabel());
    } else {
        //Fixing zoom bug after only audio labels have been added with relative positioning
        videoContainer.style.position = "static";
    }

    videosContainer.appendChild(videoContainer);
};

const getAudioOnlyLabel = () => {
    const labelContrainer = document.createElement("div");
    labelContrainer.classList.add("label_only_audio_container");

    const label = document.createElement("p");
    label.classList.add("label_only_audio_text");
    label.innerHTML = "Only Audio";

    labelContrainer.appendChild(label);

    return labelContrainer;
};

//////////////////// BUTTONS LOGIC ///////////////

export const toggleMic = (isMuted) => {
    localStream.getAudioTracks()[0].enabled = isMuted ? true : false;
};

export const toggleCamera = (isDisabled) => {
    localStream.getVideoTracks()[0].enabled = isDisabled ? true : false;
};

export const toggleScreenShare = (
    isScreenSharingActive,
    screenSharingStream = null
) => {
    if (isScreenSharingActive) {
        switchVideoTracks(localStream);
    } else {
        switchVideoTracks(screenSharingStream);
    }
};

const switchVideoTracks = (stream) => {
    for (let socket_id in peers) {
        for (let index in peers[socket_id].streams[0].getTracks()) {
            for (let index2 in stream.getTracks()) {
                if (
                    peers[socket_id].streams[0].getTracks()[index].kind ===
                    stream.getTracks()[index2].kind
                ) {
                    peers[socket_id].replaceTrack(
                        peers[socket_id].streams[0].getTracks()[index],
                        stream.getTracks()[index2],
                        peers[socket_id].streams[0]
                    );
                    break;
                }
            }
        }
    }
};

//////////////////////////////// Messages ////////////////////////
const appendNewMessage = (messageData) => {
    const messages = store.getState().messages;
    store.dispatch(setMessages([...messages, messageData]));
};

export const sendMessageUsingDataChannel = (messageContent) => {
    // Append this message locally
    const identity = store.getState().identity;

    const localMessageData = {
        content: messageContent,
        identity: identity,
        messageCreatedByMe: true,
    };

    appendNewMessage(localMessageData);

    const messageData = {
        content: messageContent,
        identity: identity,
    };

    const stringifiedMessageData = JSON.stringify(messageData);
    for (let socketId in peers) {
        peers[socketId].send(stringifiedMessageData);
    }
};
