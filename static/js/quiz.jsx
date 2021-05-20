// TODO: 
// directions service: https://developers.google.com/maps/documentation/javascript/directions
// distance matrix: https://developers.google.com/maps/documentation/javascript/distancematrix

function QuizContainer(props) {
    const [businesses, setBusinesses] = React.useState([]);
    const [businessIndex, setBusinessIndex] = React.useState(0);
    const [usersLocations, setUsersLocations] = React.useState([]);

    React.useEffect(() => {
        const getBusinesses = async () => {
            const businessesFromServer = await fetchBusinesses();
            setBusinesses(businessesFromServer);
        }

        getBusinesses();

        $.get('/retrieve-users-locations.json', (result) => {
            setUsersLocations(result.users_locations);
        });

    }, [])

    // Fetch Businesses
    const fetchBusinesses = async () => {
        const res = await fetch('/businesses.json');
        const data = await res.json();

        return data.businesses;
    }

    // Upon submission of business score form, send score data to the server.
    function submitHandler(evt) {
        evt.preventDefault();

        const businessScoreInput = {
            'business-index': businessIndex,
            'score': document.querySelector('#business-score').elements.business_score.value
        };
        $.post('/save-score', businessScoreInput, (res) => {
            if (businessIndex < businesses.length - 1) {
                setBusinessIndex(businessIndex + 1);
            }
            else {
                fetch('/user-completed', { method: 'POST' });
                window.location.replace("/waiting-room-end");
            }
        });

    }

    return (
        <React.Fragment>
            {businesses.length > 0 ? <Quiz business=
                {businesses[businessIndex]} usersLocations={usersLocations} submitHandler={submitHandler} /> : null}
        </React.Fragment>
    );
}

function Quiz(props) {
    const business = props.business;
    const usersLocations = props.usersLocations;

    return (
        <React.Fragment>
            <div id='business-quiz'>
                <Business business={business} />
                <form id='business-score' onSubmit={props.submitHandler}>
                    <select name="business_score">
                        <option value="0">Absolutely not</option>
                        <option value="2">Maybe</option>
                        <option value="3">Looks Good!</option>
                        <option value="5">This is the place for sure!!!</option>
                    </select>
                    <input type='submit' />
                </form>
            </div>
            <GoogleMap businesses={[business]} usersLocations={usersLocations} />
        </React.Fragment>
    )
}

ReactDOM.render(
    <QuizContainer />,
    document.querySelector('#root')
);