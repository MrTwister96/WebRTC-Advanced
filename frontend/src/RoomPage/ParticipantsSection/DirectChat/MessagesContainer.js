import React, { useEffect, useRef } from "react";
import SingleMessage from "./SingleMessage";

const MessagesContainer = ({ messages }) => {
    const scrollRef = useRef();

    useEffect(() => {
        if (scrollRef) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

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
            <div ref={scrollRef}></div>
        </div>
    );
};

export default MessagesContainer;
