function ResultsContainer(props) {
    const [businessesResults, setBusinessesResults] = React.useState([]);
    const [usersLocations, setUsersLocations] = React.useState([]);
    const [businessIndex, setBusinessIndex] = React.useState(0);
    const [selectedBusiness, setSelectedBusiness] = React.useState(null);
    const errorMsgRef = React.useRef();
    const mapRef = React.useRef();
    const businessesInfo = [];

    React.useEffect(() => {
        $.get('/results.json', (result) => {
            setBusinessesResults(result.total_scores);
            setSelectedBusiness(result.total_scores[0]);
        });
        $.get('/retrieve-users-locations.json', (result) => {
            setUsersLocations(result.users_locations);
        });
    }, []);

    React.useEffect(() => {
        mapRef.current.highlightMarker(businessIndex);
    }, [selectedBusiness])

    for (const business of businessesResults) {
        businessesInfo.push(
            <div className="business" key={business.alias}>
                <Business business={business} showSaveButton={true} showBusinessRanking={true} errorMsgRef={errorMsgRef} businessIndex={businessIndex} />
            </div>
        );
    }

    function showPreviousBusiness() {
        setBusinessIndex(businessIndex - 1);
        setSelectedBusiness(businessesResults[businessIndex]);
    }

    function showNextBusiness() {
        setBusinessIndex(businessIndex + 1);
        setSelectedBusiness(businessesResults[businessIndex]);
    }


    const url = window.location.href;
    return (
        <React.Fragment>
            <Header />
            <ErrorMessage ref={errorMsgRef} />
            <div id="result-container" className="center">
                <div id="google-map-result" className="google-map-container">
                    <GoogleMap businesses={businessesResults} usersLocations={usersLocations} ref={mapRef} setBusinessIndex={setBusinessIndex} />
                </div><div className="business-result-container">
                    {businessesInfo && <div>{businessesInfo[businessIndex]}</div>}
                    {businessIndex != 0 && <button className="btn prev-next-btns" onClick={showPreviousBusiness}>&laquo; Previous</button>}
                    {businessIndex < (businessesInfo.length - 1) && <button className="btn prev-next-btns" onClick={showNextBusiness}>Next &raquo;</button>}
                </div>
            </div>
        </React.Fragment>
    )
}

ReactDOM.render(
    <ResultsContainer />,
    document.querySelector('#root')
);

