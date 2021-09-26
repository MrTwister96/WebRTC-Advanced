import React from "react";

const Message = ({ author, content, sameAuthor, messageCreatedByMe }) => {
    const alignClass = messageCreatedByMe
        ? "message_align_right"
        : "message_align_left";

    const authorText = messageCreatedByMe ? "You" : author;

    const contentAdditionalStyles = messageCreatedByMe
        ? "message_right_styles"
        : "message_left_styles";

    return (
        <div className={`message_container ${alignClass}`}>
            {!sameAuthor && <p className="message_title">{authorText}</p>}
            <p className={`message_content ${contentAdditionalStyles}`}>
                {content}
            </p>
        </div>
    );
};

export default Message;
