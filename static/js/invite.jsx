// https://www.w3schools.com/html/html5_geolocation.asp
// https://web.dev/how-to-use-local-https/

function Invite(props) {
    const [location, setLocation] = React.useState(false);
    const [isHost, setIsHost] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState(null);

    const url = window.location.href;

    React.useEffect(() => {
        $.get('/check-login.json', (res) => {
            if (!res.logged_in) {
                window.location.replace(`/login?url=${url}`);
            } else {
                $.get('/check-host.json', (res) => {
                    if (res.is_host) {
                        setIsHost(true);
                    }
                });
            }
        });
    }, []);

    // TO-DO: Change this to react router

    return (
        <React.Fragment>
            {isHost ? <div id="invite-link">Invite Link: {url}</div> : null}
            {errorMessage ? <ErrorMessage errorMessage={errorMessage} /> : null}
            {!location ? <UserLocationInput setLocation={setLocation} setErrorMessage={setErrorMessage} /> : <CriteriaForm setErrorMessage={setErrorMessage} />}
        </React.Fragment>
    );
}

function UserLocationInput(props) {
    function getExactCoords() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    console.log(position);
                    const positionData = {
                        'lat': position.coords.latitude,
                        'lng': position.coords.longitude
                    }

                    $.post('/add-user-location', positionData, (res) => {
                        if (res.msg == "success") {
                            props.setLocation(true);
                        }
                    });
                },
                function (error) {
                    console.error("Error Code = " + error.code + " - " + error.message);
                    props.setErrorMessage(null)
                    props.setErrorMessage('Could not get location. Please provide zipcode instead.')
                }
            );
        } else {
            props.setErrorMessage(null)
            props.setErrorMessage('Could not get location. Please provide zipcode instead.')
        }
    }

    function getZipCodeCoords(evt) {
        evt.preventDefault();
        const zipCodeInput = $("#zipcode-field").val();
        const zipCodeData = { "zipcode": zipCodeInput }

        if (zipCodeInput.length == 5) {
            $.get('/find-zipcode-coords.json', zipCodeData, (res) => {
                const positionData = {
                    'lat': res.coords.lat,
                    'lng': res.coords.lng
                }
                $.post('/add-user-location', positionData, (res) => {
                    if (res.msg == "success") {
                        props.setLocation(true);
                    }
                });
            })
        } else {
            props.setErrorMessage(null)
            props.setErrorMessage('Not a valid zipcode - must be 5 integers long.')
        }

    }

    return (
        <div id="user-location-form">
            <div className="error-msg"></div>
            <button onClick={getExactCoords}>Allow Access to My Exact Location.</button>
        OR
            <form onSubmit={getZipCodeCoords} id="zipcode-form">
                <label>Zipcode: </label>
                <input type="text" name="zipcode" id="zipcode-field" />
                <input type="submit" />
            </form>
        </div >

    )

}

function CriteriaForm(props) {

    function submitCriteria(evt) {
        evt.preventDefault();

        const criteriaData = $('#criteria-form').serialize();

        $.post('/add-search-criteria.json', criteriaData, (res) => {
            if (res.msg == "success") {
                props.setErrorMessage(null)
                props.setErrorMessage("Your criteria has been added!");
            } else {
                props.setErrorMessage(null)
                props.setErrorMessage("Something went wrong. Try again.");
            }
        });
    }

    function redirectWaitingRoom() {
        window.location.replace('/waiting-room');
    }


    return (
        <React.Fragment>
            <form onSubmit={submitCriteria} id="criteria-form">
                Food: <input type="text" name="search_term" />
                Price Level:
                <select name="price">
                    <option value="1">$</option>
                    <option value="2">$$</option>
                    <option value="3">$$$</option>
                    <option value="4">$$$</option>
                </select>
                <input type="submit" />
            </form>
            <button onClick={redirectWaitingRoom}>I'm finished. Continue to waiting room.</button>
        </React.Fragment>
    );
}

ReactDOM.render(
    <Invite />,
    document.querySelector('#root')
);
