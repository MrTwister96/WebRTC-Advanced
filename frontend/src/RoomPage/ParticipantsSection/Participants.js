import React from 'react';

const dummyParticipants = [
    {
        identity: "Schalk"
    },
    {
        identity: "Wilmari"
    },
    {
        identity: "Marike"
    },
    {
        identity: "Willie"
    },
];

const SingleParticipant = ({identity, lastItem, participant}) => {
    return (
        <>
            <p className="participants_paragraph">{identity}</p>
            {!lastItem && <span className="participants_separator_line"></span>}
        </>
    );
};

const Participants = () => {
    return (
        <div className="participants_container">
            {dummyParticipants.map((participant, index) => {
                return (
                    <SingleParticipant
                        key={participant.identity}
                        lastItem={dummyParticipants.length === index + 1}
                        participant={participant}
                        identity={participant.identity}
                    />
                )
            })}
        </div>
    );
};

export default Participants;