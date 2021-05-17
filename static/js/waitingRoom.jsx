// https://www.w3schools.com/html/html5_geolocation.asp
// https://web.dev/how-to-use-local-https/

function WaitingRoom(props) {
    const [participants, setParticipants] = React.useState([]);
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [location, setLocation] = React.useState(false);
    const [usersLocations, setUsersLocations] = React.useState([]);

    const url = window.location.href;
    
    React.useEffect(() => {
        const interval = setInterval(() => {
            $.get('/yelphelper-session-participants.json', (res) => {
                if (res.started) {
                    window.location.replace("/quiz");
                } else if (!res.logged_in) {
                    window.location.replace(`/login?url=${url}`);
                } else if (res.participants != participants) {
                    setParticipants(res.participants);
                }
            });
            $.get('/get-users-locations.json', (result) => {
                if (result.users_locations != usersLocations) {
                    setUsersLocations(result.users_locations);
                }
            });
        }, 300);
        return () => clearInterval(interval);
    },[]);

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    console.log(position);
                    const positionData = {
                        'lat': position.coords.latitude,
                        'lng': position.coords.longitude
                    }
            
                    $.post('/add-user-location', positionData, (res) => {
                        setLocation(true);
                    });
                  },
                  function(error) {
                    console.error("Error Code = " + error.code + " - " + error.message);
                  }
            );   
        } else {
            const currentPosition = {'coords': {'latitude': null, 'longitude': null}};
        }

        
    }

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
            {location ? <div>Your location has been added.</div>: <button onClick={getLocation}>Allow Access to My Location.</button>}
            <button onClick={startQuiz}>Let's Start!</button>
            <GoogleMap usersLocations = {usersLocations} businesses={[]}/>
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
    <WaitingRoom />,
    document.querySelector('#root')
);