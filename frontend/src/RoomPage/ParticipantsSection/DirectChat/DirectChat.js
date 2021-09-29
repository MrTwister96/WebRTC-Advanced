import React, { useState } from "react";
import { connect } from "react-redux";
import ConversationNotChosen from "./ConversationNotChosen";
import DirectChatHeader from "./DirectChatHeader";
import MessagesContainer from "./MessagesContainer";
import NewMessage from "./NewMessage";

const DirectChat = ({ activeConversation, directChatHistory }) => {
    const [messages, setMessages] = useState([]);

    return (
        <div className="direct_chat_container">
            <DirectChatHeader activeConversation={activeConversation} />
            <MessagesContainer messages={messages} />
            <NewMessage />
            {!activeConversation && <ConversationNotChosen />}
        </div>
    );
};

const mapStoreStateToProps = (state) => {
    return {
        ...state,
    };
};

export default connect(mapStoreStateToProps)(DirectChat);
