// TODO: 
// directions service: https://developers.google.com/maps/documentation/javascript/directions
// TODO: save restaurant to profile.

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
            'score': $(".business-score:checked").val()
            // 'score': document.querySelector('#business-score').elements.business_score.value
        };
        $.post('/save-score', businessScoreInput, (res) => {
            if (businessIndex < businesses.length - 1) {
                setBusinessIndex(businessIndex + 1);
            }
            else {
                fetch('/user-completed', { method: 'POST' });
                window.location.assign("/waiting-room-end");
            }
        });

    }

    return (
        <React.Fragment>
            {businesses.length > 0 && <Quiz businesses={businesses} businessIndex={businessIndex}
                usersLocations={usersLocations} submitHandler={submitHandler} />}
        </React.Fragment>
    );
}

function Quiz(props) {
    const businesses = props.businesses;
    const businessIndex = props.businessIndex;
    const business = businesses[businessIndex];
    const usersLocations = props.usersLocations;
    const [errorMessage, setErrorMessage] = React.useState(null);

    return (
        <React.Fragment>
            {errorMessage ? <ErrorMessage errorMessage={errorMessage} /> : null}
            <div id='business-quiz-container' className="center">
                <div id='google-map-container'>
                    {/* <QuizGoogleMap business={business} businessIndex={businessIndex} usersLocations={usersLocations} /> */}
                </div>
                <div id='business-quiz'>
                    <Business business={business} showSaveButton={true} setErrorMessage={setErrorMessage} />
                    <form id='business-score' onSubmit={props.submitHandler}>
                        <div id='business-score-container'>
                            <div id="business-score-label">Do you want to eat here?</div>
                            <div className="business-score-radio-group">
                                <input type="radio" className="business-score radio" name="business-score" value="0" id="business-score-0" />
                                {/* <label className="business-score-label radio-label" htmlFor="business-score-0">Absolutely not</label> */}
                                <label className="business-score-label radio-label" htmlFor="business-score-0">
                                    <img className="business-score-icon" src="/static/img/sad.png"></img>
                                </label>
                                <span className="tooltiptext">Absolutely Not</span>
                            </div>
                            <div className="business-score-radio-group">
                                <input type="radio" className="business-score radio" name="business-score" value="2" id="business-score-2" />
                                {/* <label className="business-score-label radio-label" htmlFor="business-score-2">Maybe</label> */}
                                <label className="business-score-label radio-label" htmlFor="business-score-2">
                                    <img className="business-score-icon" src="/static/img/neutral.png"></img>
                                </label>
                                <span className="tooltiptext">Maybe</span>

                            </div>
                            <div className="business-score-radio-group">
                                <input type="radio" className="business-score radio" name="business-score" value="3" id="business-score-3" />
                                {/* <label className="business-score-label radio-label" htmlFor="business-score-3">Looks Good!</label> */}
                                <label className="business-score-label radio-label" htmlFor="business-score-3">
                                    <img className="business-score-icon" src="/static/img/happy.png"></img>
                                </label>
                                <span className="tooltiptext">Looks Good!</span>
                            </div>
                            <div className="business-score-radio-group">
                                <input type="radio" className="business-score radio" name="business-score" value="5" id="business-score-5" />
                                {/* <label className="business-score-label radio-label" htmlFor="business-score-5">This is the place for sure!!</label> */}
                                <label className="business-score-label radio-label" htmlFor="business-score-5">
                                    <img className="business-score-icon" src="/static/img/very-happy.png"></img>
                                </label>
                                <span className="tooltiptext">This is the place for sure!</span>
                            </div>
                            {/* <select name="business_score">
                            <option value="0">Absolutely not</option>
                            <option value="2">Maybe</option>
                            <option value="3">Looks Good!</option>
                            <option value="5">This is the place for sure!!!</option>
                        </select> */}
                            {/* <input type='submit' /> */}
                        </div>
                        <button className="btn submit-btn" id="submit-business-score-btn" onClick={props.submitHandler}>Go to Next Restaurant</button>
                    </form>
                </div>
            </div>

        </React.Fragment>
    )
}

ReactDOM.render(
    <QuizContainer />,
    document.querySelector('#root')
);