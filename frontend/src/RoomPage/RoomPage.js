import React, { useEffect } from "react";
import { connect } from "react-redux";
import ParticipantsSection from "./ParticipantsSection/ParticipantsSection";
import VideoSection from "./VideoSection/VideoSection";
import ChatSection from "./ChatSection/ChatSection";
import RoomLabel from "./RoomLabel";
import Overlay from "./Overlay";
import * as webRTCHandler from "../utils/webRTCHandler";

import "./RoomPage.css";

const RoomPage = ({ roomId, identity, isRoomHost, showOverlay }) => {
    useEffect(() => {
        webRTCHandler.getLocalPreviewAndInitRoomConnection(
            isRoomHost,
            identity,
            roomId
        );
    }, []);

    return (
        <div className="room_container">
            <ParticipantsSection />
            <VideoSection />
            <ChatSection />
            <RoomLabel roomId={roomId} />
            {showOverlay && <Overlay />}
        </div>
    );
};

const mapStoreStateToProps = (state) => {
    return {
        ...state,
    };
};

export default connect(mapStoreStateToProps)(RoomPage);
