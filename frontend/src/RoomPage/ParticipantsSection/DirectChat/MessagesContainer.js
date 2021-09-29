import React from "react";
import SingleMessage from "./SingleMessage";

const MessagesContainer = ({ messages }) => {
    return (
        <div className="direct_messages_container">
            {messages.map((message) => {
                return (
                    <SingleMessage
                        messageContent={message.messageContent}
                        isAuthor={message.isAuthor}
                        //Need to check this for production as it can cause duplicate
                        key={`${message.messageContent}-${message.identity}`}
                    />
                );
            })}
        </div>
    );
};

export default MessagesContainer;
