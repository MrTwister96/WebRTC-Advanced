import React from "react";

const Input = ({ placeholder, value, changeHandler, handleJoinRoom }) => {
    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleJoinRoom();
        }
    };

    return (
        <input
            value={value}
            onChange={changeHandler}
            className="join_room_input"
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
        />
    );
};

const JoinRoomInputs = (props) => {
    const {
        roomIdValue,
        setRoomIdValue,
        nameValue,
        setNameValue,
        isRoomHost,
        handleJoinRoom,
    } = props;

    const handleRoomIdValueChange = (event) => {
        setRoomIdValue(event.target.value);
    };

    const handleNameValueChange = (event) => {
        setNameValue(event.target.value);
    };

    return (
        <div className="join_room_inputs_container">
            {!isRoomHost && (
                <Input
                    placeholder="Enter Meeting ID"
                    value={roomIdValue}
                    changeHandler={handleRoomIdValueChange}
                    handleJoinRoom={handleJoinRoom}
                />
            )}
            <Input
                placeholder="Enter Your Name"
                value={nameValue}
                changeHandler={handleNameValueChange}
                handleJoinRoom={handleJoinRoom}
            />
        </div>
    );
};

export default JoinRoomInputs;
