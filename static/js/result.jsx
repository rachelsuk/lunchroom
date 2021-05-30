function ResultsContainer(props) {
    const [businessesResults, setBusinessesResults] = React.useState([]);
    const [usersLocations, setUsersLocations] = React.useState([]);
    const [businessIndex, setBusinessIndex] = React.useState(0);
    const [errorMessage, setErrorMessage] = React.useState(null);
    const businessesInfo = [];

    React.useEffect(() => {
        $.get('/results.json', (result) => {
            setBusinessesResults(result.total_scores);
        });
        $.get('/retrieve-users-locations.json', (result) => {
            setUsersLocations(result.users_locations);
        });
    }, []);

    for (const business of businessesResults) {
        businessesInfo.push(
            <div className="business" key={business.alias}>
                <h2>{businessIndex + 1}.</h2>
                <Business business={business} showSaveButton={true} setErrorMessage={setErrorMessage} />
                <p>{business.total_score}</p>
            </div>
        );
    }

    function showPreviousBusiness() {
        setBusinessIndex(businessIndex - 1);
    }

    function showNextBusiness() {
        setBusinessIndex(businessIndex + 1);
    }
    const url = window.location.href;
    return (
        <React.Fragment>
            <Header url={url} />
            {errorMessage ? <ErrorMessage errorMessage={errorMessage} /> : null}
            <GoogleMap businesses={businessesResults} usersLocations={usersLocations} />
            {businessesInfo ? <div>{businessesInfo[businessIndex]}</div> : null}
            {businessIndex != 0 ? <button onClick={showPreviousBusiness}>Back</button> : null}
            {businessIndex < (businessesInfo.length - 1) ? <button onClick={showNextBusiness}>Next</button> : null}
        </React.Fragment>
    )
}

ReactDOM.render(
    <ResultsContainer />,
    document.querySelector('#root')
);

