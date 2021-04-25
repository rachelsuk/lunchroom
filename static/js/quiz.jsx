function QuizContainer(props) {
    const [businesses, setBusinesses] = React.useState([]);
    const [businessIndex, setBusinessIndex] = React.useState(0);
    const [allBusinessesScored, setAllBusinessesScored] = React.useState(false);

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
            {(businesses.length > 0 && !allBusinessesScored) ? <Quiz businesses=
            {businesses} businessIndex={businessIndex} submitHandler={submitHandler}/> : "loading quiz..."}
        </React.Fragment>
    );
}

function Quiz(props) {
    const businesses = props.businesses;
    const businessIndex = props.businessIndex;

    return (
        <React.Fragment>
            <div id='business-quiz'>
                <b id='business-name'>{businesses[businessIndex].name}</b>
                <ul id='business-info'>
                    <li>Number of Yelp Reviews: {businesses[businessIndex].review_count}</li>
                    <li>Number of Yelp Stars: {businesses[businessIndex].yelp_rating}</li>
                </ul>
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

ReactDOM.render(
    <QuizContainer />,
    document.querySelector('#root')
);