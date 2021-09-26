import React, { useEffect } from "react";
import logo from "../resources/images/logo.png";
import ConnectingButtons from "./ConnectingButtons";
import { connect } from "react-redux";
import { setIsRoomHost } from "../store/actions";
import { setConnectOnlyWithAudio } from "../store/actions";

import "./IntroductionPage.css";

const IntroductionPage = ({ setIsRoomHostAction }) => {
    useEffect(() => {
        setIsRoomHostAction(false);
    // eslint-disable-next-line
    }, []);

    return (
        <div className="introduction_page_container">
            <div className="introduction_page_panel">
                <img
                    src={logo}
                    alt="Logo"
                    className="introduction_page_image"
                ></img>
                <ConnectingButtons />
            </div>
        </div>
    );
};

const mapActionsToProps = (dispatch) => {
    return {
        setIsRoomHostAction: (isRoomHost) =>
            dispatch(setIsRoomHost(isRoomHost)),
        setConnectOnlyWithAudio: (onlyWithAudio) =>
            dispatch(setConnectOnlyWithAudio(onlyWithAudio)),
    };
};

export default connect(null, mapActionsToProps)(IntroductionPage);
