// https://www.w3schools.com/html/html5_geolocation.asp
// https://web.dev/how-to-use-local-https/
// https://overreacted.io/making-setinterval-declarative-with-react-hooks/

function WaitingRoomStart(props) {
    const [isHost, setIsHost] = React.useState(false);
    const [usersLocations, setUsersLocations] = React.useState([]);
    const [started, setStarted] = React.useState(false);
    const [waitingRoomCount, setWaitingRoomCount] = React.useState(0);
    const [allUsersCount, setAllUsersCount] = React.useState(0);
    const [percent, setPercent] = React.useState(0)
    const savedCallback = React.useRef();
    const errorMsgRef = React.useRef();

    function callback(users_locations) {
        // why users_locations != usersLocations doesn't work?
        if (users_locations.length != usersLocations.length) {
            setUsersLocations(users_locations);
        }
        setAllUsersCount(users_locations.length)
        let count = 0;
        for (const user of users_locations) {
            if (user.in_waiting_room) {
                count += 1;
            }
        }
        setWaitingRoomCount(count);
        setPercent((waitingRoomCount / allUsersCount) * 100)
        const startQuizBtn = document.getElementById("start-quiz-btn");
        if (percent == 100) {
            startQuizBtn.disabled = false;
        } else {
            startQuizBtn.disabled = true;
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
                savedCallback.current(result.users_locations);
            });
        }, 300);
        return () => clearInterval(interval);
    }, []);

    function startQuiz() {
        $.get('/initial-check-duration.json', { "max-duration": 0 }, (res) => {
            $('#minimum-duration').html(`Maximum duration must at least ${Number((res.min_max_duration).toFixed(0))} minutes.`)
        });

        setStarted(true);
    }

    function checkDuration(evt) {
        evt.preventDefault();
        const submitBtn = document.querySelector(".submit-btn");
        submitBtn.innerHTML = 'loading..';

        const durationData = $('#max-duration-form').serialize();

        $.get('/check-duration.json', durationData, (res) => {

            if (res.msg == "success") {
                $.post('/retrieve-businesses.json', (res) => {
                    if (res.msg == 'success') {
                        errorMsgRef.current.showErrorMessage("Maximum duration has been accepted!");
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
                        errorMsgRef.current.showErrorMessage('Not enough restaurants within the driving duration range. Try a larger maximum driving duration.')
                        submitBtn.innerHTML = 'Submit';
                    }

                })

            } else if (res.msg == "fail") {
                errorMsgRef.current.showErrorMessage(`Invalid maximum duration. Maximum duration must at least ${res.min_max_duration} miles.`)
                submitBtn.innerHTML = 'Submit';
            }
        });

    }

    return (
        <React.Fragment>
            <ErrorMessage ref={errorMsgRef} />
            <img id="tempura-img" src='/static/img/tempura.svg'></img>
            <div className='center'>
                {!started && <div id="waiting-room-start-heading">Waiting for all participants to join..</div>}
                {!started && <div><div className="w3-light-grey w3-round-xlarge" style={{ width: "50%", margin: "auto" }}>
                    <div className="w3-container w3-red w3-round-xlarge" style={{ height: "24px", width: `${percent}%` }}>{waitingRoomCount}/{allUsersCount}</div>
                </div><div style={{ margin: "1em" }}>participants are in the waiting room</div></div>}
                {started && (<React.Fragment>
                    <div id="minimum-duration"></div>
                    <form id="max-duration-form">
                        <label>How far is everyone willing to drive? </label>
                        <input type="text" name="max-duration" id="max-duration-field" /> minutes
                        <button className="btn submit-btn" onClick={checkDuration}>Submit</button>
                    </form></React.Fragment>)}
                <hr />
                {(isHost && !started) && <div id='start-quiz-btn-container'><button className="btn" id="start-quiz-btn" onClick={startQuiz}>Everyone In? Let's Start!</button><span className="triangle-right" id="triangle-right-start-quiz"></span></div>}

                <GoogleMap usersLocations={usersLocations} businesses={[]} />
            </div>
            <img id="egg-img" src='/static/img/egg.svg'></img>
        </React.Fragment >
    );
}

ReactDOM.render(
    <WaitingRoomStart />,
    document.querySelector('#root')
);