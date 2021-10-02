import React, { useState } from "react";
import { connect } from "react-redux";
import {
    setConnectOnlyWithAudio,
    setIdentity,
    setRoomId,
} from "../store/actions";
import JoinRoomInputs from "./JoinRoomInputs";
import OnlyWithAudioCheckBox from "./OnlyWithAudioCheckBox";
import ErrorMessage from "./ErrorMessage";
import JoinRoomButtons from "./JoinRoomButtons";
import { getRoomExists } from "../utils/api";
import { useHistory } from "react-router-dom";

const JoinRoomContent = (props) => {
    const {
        isRoomHost,
        setConnectOnlyWithAudio,
        connectOnlyWithAudio,
        setIdentityAction,
        setRoomIdAction,
    } = props;

    const [roomIdValue, setRoomIdValue] = useState("");
    const [nameValue, setNameValue] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);

    const history = useHistory();

    const handleJoinRoom = async () => {
        if (nameValue !== "" && !nameValue.startsWith(" ")) {
            setIdentityAction(nameValue);
            if (isRoomHost) {
                createRoom();
            } else {
                await joinRoom();
            }
        } else {
            setErrorMessage("Enter valid name!");
            setNameValue("");
        }
    };

    const joinRoom = async () => {
        const responseMessage = await getRoomExists(roomIdValue);

        const { roomExists, full } = responseMessage;

        if (roomExists) {
            if (full) {
                setErrorMessage("Meeting is full. Please try again later");
            } else {
                // Join a room!
                setRoomIdAction(roomIdValue);
                history.push("/room");
            }
        } else {
            setErrorMessage("Meeting not found. Check your Meeting ID");
        }
    };

    const createRoom = () => {
        history.push("/room");
    };

    return (
        <>
            <JoinRoomInputs
                roomIdValue={roomIdValue}
                setRoomIdValue={setRoomIdValue}
                nameValue={nameValue}
                setNameValue={setNameValue}
                isRoomHost={isRoomHost}
                handleJoinRoom={handleJoinRoom}
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
        setIdentityAction: (identity) => dispatch(setIdentity(identity)),
        setRoomIdAction: (roomId) => dispatch(setRoomId(roomId)),
    };
};

export default connect(
    mapStoreStateToProps,
    mapActionsToProps
)(JoinRoomContent);
