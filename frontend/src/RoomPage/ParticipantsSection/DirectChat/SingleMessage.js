import React from "react";

const SingleMessage = ({ isAuthor, messageContent }) => {
    const messageStyling = isAuthor
        ? "author_direct_message"
        : "receiver_direct_message";
    const containerStyling = isAuthor
        ? "direct_message_container_author"
        : "direct_message_container_receiver";

    return (
        <div className={containerStyling}>
            <p className={messageStyling}>{messageContent}</p>
        </div>
    );
};

export default SingleMessage;
