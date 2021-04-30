function Invite(props) {
    const [participants, setParticipants] = React.useState([]);
    const [loggedIn, setLoggedIn] = React.useState(false);

    const url = window.location.href;
    
    React.useEffect(() => {
        const interval = setInterval(() => {
            $.get('/yelphelper-session-participants.json', (res) => {
                setParticipants(res.participants);
                if (res.logged_in) {
                    setLoggedIn(true);
                }
                else {
                    window.location.replace(`/login?url=${url}`);
                }

                if (res.started) {
                    window.location.replace("/quiz");
                }
            });
        }, 1000);
        return () => clearInterval(interval);
    },[]);

    function startQuiz() {
        $.post('/yelphelper-session-participants.json', (res) => {
            if (res.started) {
                window.location.replace("/quiz");
            }
        });
    }

    return (
        <React.Fragment>
            <ParticipantList participants={participants} />
            <button onClick={startQuiz}>Let's Start!</button>
        </React.Fragment>
    );
}

function ParticipantList(props) {
    const participants = props.participants;
    const participantsInfo = [];
    for (const participant of participants) {
        participantsInfo.push(
            <p key={`user${participant.user_id}`}>{participant.fname}</p>
        );
    }
    return (
        <div>
            {participantsInfo}
        </div>
    );
    
}

ReactDOM.render(
    <Invite />,
    document.querySelector('#root')
);
