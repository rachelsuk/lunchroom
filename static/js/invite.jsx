const Router = window.ReactRouterDOM.BrowserRouter;
const Route =  window.ReactRouterDOM.Route;
const Link =  window.ReactRouterDOM.Link;

function Invite(props) {
    const [participants, setParticipants] = React.useState([]);
    const [loggedIn, setLoggedIn] = React.useState(false);
    
    React.useEffect(() => {
        const url = window.location.href;
        const interval = setInterval(() => {
            $.get('/yelphelper-session-participants.json', (res) => {
                setParticipants(res.participants);
                if (res.logged_in) {
                    setLoggedIn(true);
                }
                if (res.started) {
                    window.location.replace("/quiz");
                }
            });
        }, 1000);
        return () => clearInterval(interval);
    },[]);

    function onSuccess() {
        pass
    }

    function startQuiz() {
        $.post('/yelphelper-session-participants.json', (res) => {
            if (res.started) {
                window.location.replace("/quiz");
            }
        });
    }

    return (
        <Router>
            {loggedIn ? <ParticipantList participants={participants} /> : null}
            {loggedIn ? <button onClick={startQuiz}>Let's Start!</button> : null}
            {!loggedIn ? <LoginForm onSuccess={onSuccess} /> : null}
            <Route path='/login' exact render={(props) => <LoginForm onSuccess={onSuccess} />} />
            <Route path='/new-user' exact render={(props) => <NewUserForm onSuccess={onSuccess} />} />
        </Router>
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
