import React, { useState } from "react";
import { connect } from "react-redux";
import { setConnectOnlyWithAudio } from "../store/actions";
import JoinRoomInputs from "./JoinRoomInputs";
import OnlyWithAudioCheckBox from "./OnlyWithAudioCheckBox";
import ErrorMessage from "./ErrorMessage";
import JoinRoomButtons from "./JoinRoomButtons";

const JoinRoomContent = (props) => {
    const { isRoomHost, setConnectOnlyWithAudio, connectOnlyWithAudio } = props;

    const [roomIdValue, setRoomIdValue] = useState("");
    const [nameValue, setNameValue] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);

    const handleJoinRoom = () => {
        console.log("Joining the Room");
    };

    return (
        <>
            <JoinRoomInputs
                roomIdValue={roomIdValue}
                setRoomIdValue={setRoomIdValue}
                nameValue={nameValue}
                setNameValue={setNameValue}
                isRoomHost={isRoomHost}
            />
            <OnlyWithAudioCheckBox
                setConnectOnlyWithAudio={setConnectOnlyWithAudio}
                connectOnlyWithAudio={connectOnlyWithAudio}
            />
            <ErrorMessage errorMessage={errorMessage} />
            <JoinRoomButtons
                handleJoinRoom={handleJoinRoom}
                isRoomHost={isRoomHost}
            />
        </>
    );
};

const mapStoreStateToProps = (state) => {
    return {
        ...state,
    };
};

const mapActionsToProps = (dispatch) => {
    return {
        setConnectOnlyWithAudio: (onlyWithAudio) =>
            dispatch(setConnectOnlyWithAudio(onlyWithAudio)),
    };
};

export default connect(
    mapStoreStateToProps,
    mapActionsToProps
)(JoinRoomContent);
