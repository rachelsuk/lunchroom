// https://www.w3schools.com/html/html5_geolocation.asp
// https://web.dev/how-to-use-local-https/

// TODO: add criteria form - one restaurant.
// TODO (nice to have): show list of your saved restaurants

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
                    props.setErrorMessage('Could not get location. Please provide zipcode instead.')
                }
            );
        } else {
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
    const [savedBusinesses, setSavedBusinesses] = React.useState([]);

    React.useEffect(() => {
        $.get('/get-saved-businesses.json', (res) => {
            setSavedBusinesses(res.saved_businesses);
        });
    }, []);

    function submitCriteria(evt) {
        evt.preventDefault();

        const criteriaData = $('#criteria-form').serialize();

        $.post('/add-search-criteria.json', criteriaData, (res) => {
            if (res.msg == "success") {
                props.setErrorMessage("Your criteria has been added!");
            } else {
                props.setErrorMessage("Something went wrong. Try again.");
            }
        });
    }

    function findBusiness(evt) {
        const business = $('#specific-business-input').value
        $.get('/get-specific-business.json', { 'business': business }, (res) => {

        })
    }

    function redirectWaitingRoomStart() {
        window.location.replace('/waiting-room-start');
    }

    function addBusiness(evt) {
        let id = evt.target.parentElement.id
        $.post('/add-saved-business-to-yp-session.json', { 'saved-business-id': id }, (res) => {
            if (res.msg == "success") {
                props.setErrorMessage("Business has been added to the session.")
            } else if (res.msg == "already added") {
                props.setErrorMessage("Business has already been added to the session.")
            }
        });
    }

    const businessesInfo = [];
    for (const [index, business] of savedBusinesses.entries()) {
        businessesInfo.push(
            <div className="business" index={index} id={business.saved_business_id} key={business.alias}>
                <Business business={business} showSaveButton={false} />
                <button onClick={addBusiness}>Add Business.</button>
            </div>
        );
    }

    return (
        <React.Fragment>
            <button onClick={redirectWaitingRoomStart}>I'm finished. Continue to waiting room.</button>
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
            <div>
                Find Specific Restaurant: <input type="text" id="specific-business-input"></input>
                <button onClick={findBusiness}>Find Restaurant.</button>
            </div>
            <div>{businessesInfo}</div>
        </React.Fragment>
    );
}

ReactDOM.render(
    <Invite />,
    document.querySelector('#root')
);
