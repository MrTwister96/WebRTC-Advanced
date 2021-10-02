import React, { useState } from "react";
import SendMessageButton from "../../../resources/images/sendMessageButton.svg";
import * as wss from "../../../utils/wss";

const NewMessage = ({ activeConversation, identity }) => {
    const [message, setMessage] = useState("");

    const handleTextChange = (event) => {
        setMessage(event.target.value);
    };

    const sendMessage = () => {
        wss.sendDirectMessage({
            receiverSocketId: activeConversation.socketId,
            identity: identity,
            messageContent: message,
        });
        setMessage("");
    };

    const handleKeyPressed = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="new_message_container new_message_direct_border">
            <input
                className="new_message_input"
                value={message}
                onChange={handleTextChange}
                placeholder={"Type your message..."}
                type={"text"}
                onKeyDown={handleKeyPressed}
            />
            <img
                src={SendMessageButton}
                alt="send message"
                className="new_message_button"
                onClick={sendMessage}
            />
        </div>
    );
};

export default NewMessage;
