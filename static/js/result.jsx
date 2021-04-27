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
            <div>
                <Business business={business}/>
                <p>{business.total_score}</p>
            </div>
        );
    }
    return (
        <React.Fragment>
            <div>{businessesInfo}</div>
        </React.Fragment>
    )
}

ReactDOM.render(
    <ResultsContainer />,
    document.querySelector('#root')
);