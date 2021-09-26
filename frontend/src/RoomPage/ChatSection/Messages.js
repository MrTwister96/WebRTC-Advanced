import React from "react";
import { connect } from "react-redux";
import Message from "./Message";

const Messages = ({ messages }) => {
    return (
        <div className="messages_container">
            {messages.map((message, index) => {
                const sameAuthor =
                    index > 0 &&
                    message.identity === messages[index - 1].identity;

                return (
                    <Message
                        key={`${message.content}${index}`}
                        author={message.identity}
                        content={message.content}
                        sameAuthor={sameAuthor}
                        messageCreatedByMe={message.messageCreatedByMe}
                    />
                );
            })}
        </div>
    );
};

const mapStoreStateToProps = (state) => {
    return {
        ...state,
    };
};

export default connect(mapStoreStateToProps)(Messages);
