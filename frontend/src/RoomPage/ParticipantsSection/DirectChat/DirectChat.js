import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import ConversationNotChosen from "./ConversationNotChosen";
import DirectChatHeader from "./DirectChatHeader";
import MessagesContainer from "./MessagesContainer";
import NewMessage from "./NewMessage";

const getDirectChatHistory = (directChatHistory, socketId = null) => {
    if (!socketId || !directChatHistory) {
        return [];
    }

    const history = directChatHistory.find((h) => h.socketId === socketId);

    return history ? history.chatHistory : [];
};

const DirectChat = ({ activeConversation, directChatHistory, identity }) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        setMessages(
            getDirectChatHistory(
                directChatHistory,
                activeConversation ? activeConversation.socketId : null
            )
        );
    }, [activeConversation, directChatHistory]);

    return (
        <div className="direct_chat_container">
            <DirectChatHeader activeConversation={activeConversation} />
            <MessagesContainer messages={messages} />
            <NewMessage
                activeConversation={activeConversation}
                identity={identity}
            />
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
