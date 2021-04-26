function QuizContainer(props) {
    const [businesses, setBusinesses] = React.useState([]);
    const [businessIndex, setBusinessIndex] = React.useState(0);
    const [allBusinessesScored, setAllBusinessesScored] = React.useState(false);

    // QUESTION: is the useEffect running each time businessIndex is updated? If so, is 
    // there a better way to do this since i really only need to fetch the businesses data once?

    React.useEffect(() => {
        const getBusinesses = async () => {
            const businessesFromServer = await fetchBusinesses();
            setBusinesses(businessesFromServer);
        }

        getBusinesses();
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
            }
            
        });

    }

    return (
        <React.Fragment>
            {(businesses.length > 0 && !allBusinessesScored) ? <Quiz business=
            {businesses[businessIndex]} submitHandler={submitHandler}/> : null}
            {allBusinessesScored ? <ResultsContainer />: null}
        </React.Fragment>
    );
}

function Quiz(props) {
    const business = props.business;

    return (
        <React.Fragment>
            <div id='business-quiz'>
                <Business business={business}/>
                <form id='business-score' onSubmit={props.submitHandler}>
                    <select name="business_score">
                        <option value="0">Absolutely not</option>
                        <option value="2">Maybe</option>
                        <option value="3">Looks Good!</option>
                        <option value="5">This is the place for sure!!!</option>
                    </select>
                    <input type='submit'/>
                </form>
            </div>
        </React.Fragment>
    )
}

function Business(props) {
    const business = props.business;
    return (
        <React.Fragment>
            <b className='business-name'>{business.name}</b>
            <ul className='business-details'>
                <li>Number of Yelp Reviews: {business.review_count}</li>
                <li>Number of Yelp Stars: {business.yelp_rating}</li>
            </ul>
        </React.Fragment>
    )
}

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
    <QuizContainer />,
    document.querySelector('#root')
);