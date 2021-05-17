// https://www.w3schools.com/html/html5_geolocation.asp
// https://web.dev/how-to-use-local-https/

function Invite(props) {
    const [location, setLocation] = React.useState(false);
    const [host, setHost] = React.useState(false);

    const url = window.location.href;
    
    React.useEffect(() => {
        $.get('/check-login.json', (res) => {
            if (!res.logged_in) {
                window.location.replace(`/login?url=${url}`);
            } else {
                $.get('/check-host.json', (res) => {
                    if (res.host) {
                        setHost(true);
                    }
                });
            }
        });
    },[]);

    return (
        <React.Fragment>
            {host ? <div id="invite-link">Invite Link: {url}</div> : null}
            {!location ? <UserLocationInput />: <div></div>}  
        </React.Fragment>
    );
}

function UserLocationInput(props) {
    function getExactCoords() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    console.log(position);
                    const positionData = {
                        'lat': position.coords.latitude,
                        'lng': position.coords.longitude
                    }
            
                    $.post('/add-user-location', positionData, (res) => {
                        if (res.msg == "success") {
                            setLocation(true);
                        }
                    });
                  },
                  function(error) {
                    console.error("Error Code = " + error.code + " - " + error.message);
                    const errorMsg = document.querySelector('#error-msg');
                    errorMsg.innerHTML = 'Could not get location. Please provide zipcode instead.'
                  }
            );   
        } else {
            const errorMsg = document.querySelector('#error-msg');
            errorMsg.innerHTML = 'Could not get location. Please provide zipcode instead.'
        }        
    }

    function getZipCodeCoords() {
        const zipCodeInput = document.querySelector('input[name="zipcode"]');
        const zipCodeData = {'zipcode': zipCodeInput}
        if (zipCodeInput.length == 5) {
            $.get('/find-zipcode-coords.json', zipCodeData, (res) => {
                const positionData = {
                    'lat': res.coords.lat,
                    'lng': res.coords.lng
                }
                $.post('/add-user-location', positionData, (res) => {
                    if (res.msg == "success") {
                        setLocation(true);
                    }
                });
            })
        } else {
            errorMsg.innerHTML = 'Not a valid zipcode - must be 5 integers long.'
        }

    }

    return (
    <div id="user-location-form">
        <div className="error-msg"></div> 
        <button onClick={getExactCoords}>Allow Access to My Exact Location.</button>
        OR
        <form onSubmit={getZipCodeCoords}>
            <label>Zipcode: </label>
            <input type="text" name="zipcode" />
            <input type="submit" />
        </form>
    </div>

    )

}

ReactDOM.render(
    <Invite />,
    document.querySelector('#root')
);
