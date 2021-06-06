// https://www.w3schools.com/html/html5_geolocation.asp
// https://web.dev/how-to-use-local-https/

// TODO: add criteria form - one restaurant.
// TODO (nice to have): show list of your saved restaurants

function Invite(props) {
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

    function copyLink() {
        const sharedLink = document.querySelector("#shared-link");
        const sharedlinkText = sharedLink.textContent;
        navigator.clipboard.writeText(sharedlinkText);
        setErrorMessage("Link has been copied")
    }

    return (
        <React.Fragment>
            {errorMessage && <ErrorMessage errorMessage={errorMessage} />}
            <div id="invite-component" className="center">
                {isHost && <div id="invite-link"><div>Invite Link:</div><div id="shared-link">{url}</div><button className='btn' onClick={copyLink}>Copy Link</button></div>}
                <hr />
                <UserLocationInput setErrorMessage={setErrorMessage} url={url} />
            </div>
        </React.Fragment >
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
                            window.location.assign(`${props.url}/criteria-form?url=${props.url}`);
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
                        window.location.assign(`${props.url}/criteria-form?url=${props.url}`);
                    }
                });
            })
        } else {
            props.setErrorMessage('Not a valid zipcode - must be 5 integers long.')
        }

    }

    return (
        <div id="user-location-form">
            <div id='provide-your-location'>Provide Your Location:</div>
            <button className="btn" id="exact-location-btn" onClick={getExactCoords}>Share My Location</button>
        OR
            <form id="zipcode-form">
                <label>Zipcode:</label>
                <input type="text" name="zipcode" id="zipcode-field" />
                <button className="btn submit-btn" onClick={getZipCodeCoords}>Submit</button>
            </form>
        </div >

    )

}

ReactDOM.render(
    <Invite />,
    document.querySelector('#root')
);
