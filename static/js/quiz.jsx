function QuizContainer(props) {
    const [businesses, setBusinesses] = React.useState([]);
    const [businessIndex, setBusinessIndex] = React.useState(0);
    const [allBusinessesScored, setAllBusinessesScored] = React.useState(false);
    const [usersLocations, setUsersLocations] = React.useState([]);

    // QUESTION: is the useEffect running each time businessIndex is updated? If so, is 
    // there a better way to do this since i really only need to fetch the businesses data once?

    React.useEffect(() => {
        const getBusinesses = async () => {
            const businessesFromServer = await fetchBusinesses();
            setBusinesses(businessesFromServer);
        }

        getBusinesses();

        $.get('/retrieve-users-locations.json', (result) => {
            setUsersLocations(result.users_locations);
        });

        const interval = setInterval(() => {
            $.post('/check-all-completed', (res) => {
                if (res.all_completed) {
                    window.location.replace("/result");
                }
            });
        }, 1000);

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
                setAllBusinessesScored(true);
                fetch('/user-completed', { method: 'POST' });
            }
        });

    }

    return (
        <React.Fragment>
            {(businesses.length && !allBusinessesScored) > 0 ? <Quiz business=
                {businesses[businessIndex]} usersLocations={usersLocations} submitHandler={submitHandler} /> : null}
            {allBusinessesScored ? <Wait /> : null}
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

function Wait(props) {
    return (<div>Waiting for all participants to finish...</div>)
}

ReactDOM.render(
    <QuizContainer />,
    document.querySelector('#root')
);