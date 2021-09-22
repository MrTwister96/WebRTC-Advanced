import React from 'react';
import ParticipantsLabel from './ParticipantsLabel';
import Participants from './Participants';

const ParticipantsSesion = () => {
    return (
        <div className="participants_section_container">
            <ParticipantsLabel />
            <Participants />
        </div>
    );
};

export default ParticipantsSesion;