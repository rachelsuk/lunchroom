function ResultsContainer(props) {
    const [businessesResults, setBusinessesResults] = React.useState([]);
    const businessesInfo = [];

    React.useEffect(() => {
		$.get('/results.json', (result) => {
			setBusinessesResults(result.total_scores);
		});
	},[]);

    for (const business of businessesResults) {
        businessesInfo.push(
            <div className="business" key={business.alias}>
                <Business business={business}/>
                <p>{business.total_score}</p>
            </div>
        );
    }

    return (
        <React.Fragment>
            <a href={'/'}>Return to Homepage</a>
            <GoogleMap businesses = {businessesResults}/>
            <div>{businessesInfo}</div>
        </React.Fragment>
    )
}

ReactDOM.render(
    <ResultsContainer />,
    document.querySelector('#root')
);

