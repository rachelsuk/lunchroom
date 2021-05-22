// https://www.w3schools.com/html/html5_geolocation.asp
// https://web.dev/how-to-use-local-https/
// https://overreacted.io/making-setinterval-declarative-with-react-hooks/

function WaitingRoomStart(props) {
    const [isHost, setIsHost] = React.useState(false);
    const [usersLocations, setUsersLocations] = React.useState([]);
    const [errorMessage, setErrorMessage] = React.useState(null);
    const [started, setStarted] = React.useState(false);
    const savedCallback = React.useRef();

    function callback(users_locations) {
        // why users_locations != usersLocations doesn't work?
        if (users_locations.length != usersLocations.length) {
            console.log(users_locations)
            console.log(usersLocations)
            // console.log(users_locations.length === usersLocations.length)
            console.log(typeof (users_locations[0]) === typeof (usersLocations[0]))
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
            $.get('/retrieve-users-locations.json', (result) => {
                console.log(result.users_locations)
                console.log(usersLocations)

                savedCallback.current(result.users_locations);
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    function startQuiz() {
        setStarted(true);
    }

    function checkDistance(evt) {
        evt.preventDefault();

        const distanceData = $('#max-distance-form').serialize();

        $.get('/check-distance.json', distanceData, (res) => {
            if (res.msg == "success") {
                setErrorMessage("Maximum distance has been accepted!");
                $.post('/retrieve-businesses.json', (res) => {
                    if (res.msg == 'success') {
                        $.post('/save-distances.json', (res) => {
                            if (res.msg == 'success') {
                                $.post('/start-quiz.json', (res) => {
                                    if (res.started) {
                                        window.location.replace("/quiz");
                                    }
                                });
                            }
                        });

                    } else if (res.msg == "fail") {
                        setErrorMessage('Not enough restaurants within the distance range. Try a larger maximum distance.')
                    }

                })

            } else if (res.msg == "fail") {
                setErrorMessage(`Invalid maximum distance. Maximum distance must at least ${res.min_max_distance} miles.`)
            }
        });

    }

    return (
        <React.Fragment>
            {isHost && !started ? <button onClick={startQuiz}>Let's Start!</button> : null}
            {errorMessage ? <ErrorMessage errorMessage={errorMessage} /> : null}
            {started ? (<form onSubmit={checkDistance} id="max-distance-form">
                <label>Maximum Distance: </label>
                <input type="text" name="max-distance" id="max-distance-field" />
                <input type="submit" />
            </form>) : null}
            <GoogleMap usersLocations={usersLocations} businesses={[]} />
        </React.Fragment>
    );
}

ReactDOM.render(
    <WaitingRoomStart />,
    document.querySelector('#root')
);