// https://www.w3schools.com/html/html5_geolocation.asp
// https://web.dev/how-to-use-local-https/
// https://overreacted.io/making-setinterval-declarative-with-react-hooks/

function WaitingRoom(props) {
    const [isHost, setIsHost] = React.useState(false);
    const [usersLocations, setUsersLocations] = React.useState([]);
    const savedCallback = React.useRef();

    function callback(users_locations) {
        // why users_locations != usersLocations doesn't work?
        if (users_locations.length != usersLocations.length) {
            console.log(users_locations)
            console.log(usersLocations)
            console.log(users_locations.length === usersLocations.length)
            setUsersLocations(users_locations);
            console.log(usersLocations)
        }
    }

    React.useEffect(() => {
        savedCallback.current = callback;
    })

    React.useEffect(() => {
        $.get('/check-host.json', (res) => {
            if (res.is_host) {
                setIsHost(true);
            }
        });
        const interval = setInterval(() => {
            $.get('/start-quiz.json', (res) => {
                if (res.started) {
                    window.location.replace("/quiz");
                }
            });
            $.get('/get-users-locations.json', (result) => {

                savedCallback.current(result.users_locations);
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    function startQuiz() {
        // check that distance makes sense
        // add businesses from yelp api
        $.post('/start-quiz.json', (res) => {
            if (res.started) {
                window.location.replace("/quiz");
            }
        });
    }

    return (
        <React.Fragment>
            <button onClick={startQuiz}>Let's Start!</button>
            <GoogleMap usersLocations={usersLocations} businesses={[]} />
        </React.Fragment>
    );
}

// function ParticipantList(props) {

//     const participants = props.participants;
//     const participantsInfo = [];
//     for (const participant of participants) {
//         participantsInfo.push(
//             <p key={`user${participant.user_id}`}>{participant.fname}</p>
//         );
//     }
//     return (
//         <div>
//             {participantsInfo}
//         </div>
//     );

// }

ReactDOM.render(
    <WaitingRoom />,
    document.querySelector('#root')
);