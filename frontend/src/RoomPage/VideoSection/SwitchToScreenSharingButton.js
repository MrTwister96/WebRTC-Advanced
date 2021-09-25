import React, { useState } from "react";
import SwitchImg from "../../resources/images/switchToScreenSharing.svg";
import LocalScreenSharingPreview from "./LocalScreenSharingPreview";
import * as webRTCHandler from "../../utils/webRTCHandler";

const constraints = {
    audio: false,
    video: true,
};

const SwitchToScreenSharingButton = () => {
    const [isScreenSharingActive, setIsScreenSharingActive] = useState(false);
    const [screenSharingStream, setScreenSharingStream] = useState(null);

    const handleScreenShareToggle = async () => {
        if (!isScreenSharingActive) {
            let stream = null;
            try {
                stream = await navigator.mediaDevices.getDisplayMedia(
                    constraints
                );
            } catch {
                console.log(
                    "Error Occured When Accessing Screen Share Stream!"
                );
            }
            if (stream) {
                setScreenSharingStream(stream);
                webRTCHandler.toggleScreenShare(
                    isScreenSharingActive,
                    stream
                );
                setIsScreenSharingActive(true);
                // Execute Function to switch video track
                
            }
        } else {
            // Switch
            webRTCHandler.toggleScreenShare(
                isScreenSharingActive,
                screenSharingStream
            );
            setIsScreenSharingActive(false);

            // Stop Screenshare stream
            screenSharingStream.getTracks().forEach((t) => t.stop());
            setScreenSharingStream(null);
        }
    };
    return (
        <>
            <div className="video_button_container">
                <img
                    src={SwitchImg}
                    onClick={handleScreenShareToggle}
                    className="video_button_image"
                />
            </div>
            {isScreenSharingActive && (
                <LocalScreenSharingPreview stream={screenSharingStream} />
            )}
        </>
    );
};

export default SwitchToScreenSharingButton;
