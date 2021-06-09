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
                    window.location.assign("/quiz");
                }
            });
            $.get('/retrieve-users-locations.json', (result) => {
                console.log(result.users_locations)
                console.log(usersLocations)

                savedCallback.current(result.users_locations);
            });
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    function startQuiz() {
        $.get('/check-duration.json', { "max-duration": 0 }, (res) => {
            $('#minimum-duration').html(`Maximum duration must at least ${res.min_max_duration} minutes.`)
        });

        setStarted(true);
    }

    function checkDuration(evt) {
        evt.preventDefault();

        const durationData = $('#max-duration-form').serialize();

        $.get('/check-duration.json', durationData, (res) => {
            if (res.msg == "success") {
                setErrorMessage("Maximum duration has been accepted!");
                $.post('/retrieve-businesses.json', (res) => {
                    if (res.msg == 'success') {
                        $.post('/save-distances.json', (res) => {
                            if (res.msg == 'success') {
                                $.post('/start-quiz.json', (res) => {
                                    if (res.started) {
                                        window.location.assign("/quiz");
                                    }
                                });
                            }
                        });

                    } else if (res.msg == "fail") {
                        setErrorMessage('Not enough restaurants within the driving duration range. Try a larger maximum driving duration.')
                    }

                })

            } else if (res.msg == "fail") {
                setErrorMessage(`Invalid maximum duration. Maximum duration must at least ${res.min_max_duration} miles.`)
            }
        });

    }

    return (
        <React.Fragment>
            {errorMessage ? <ErrorMessage errorMessage={errorMessage} /> : null}
            <div className='center'>
                {!started && <div id="waiting-room-start-heading">Waiting for all participants to join..</div>}
                {started && (<React.Fragment>
                    <div id="minimum-duration"></div>
                    <form id="max-duration-form">
                        <label>Maximum driving duration: </label>
                        <input type="text" name="max-duration" id="max-duration-field" />
                        <button className="btn submit-btn" onClick={checkDuration}>Submit</button>
                    </form></React.Fragment>)}
                <hr />
                {(isHost && !started) && <div id='start-quiz-btn-container'><button className="btn" id="start-quiz-btn" onClick={startQuiz}>Everyone In? Let's Start!</button><span className="triangle-right" id="triangle-right-start-quiz"></span></div>}
                {/* 
                <GoogleMap usersLocations={usersLocations} businesses={[]} /> */}
            </div>
        </React.Fragment>
    );
}

ReactDOM.render(
    <WaitingRoomStart />,
    document.querySelector('#root')
);