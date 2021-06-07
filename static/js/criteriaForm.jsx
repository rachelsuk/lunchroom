// https://www.w3schools.com/html/html5_geolocation.asp
// https://web.dev/how-to-use-local-https/

// TODO: add criteria form - one restaurant.
// TODO (nice to have): show list of your saved restaurants

function CriteriaFormContainer(props) {
    const [location, setLocation] = React.useState(false);
    const [isHost, setIsHost] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState(null);

    const url = window.location.href;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sharedLink = urlParams.get('url');

    React.useEffect(() => {
        $.get('/check-login.json', (res) => {
            if (!res.logged_in) {
                window.location.assign(`/login?url=${url}`);
            } else {
                $.get('/check-host.json', (res) => {
                    if (res.is_host) {
                        setIsHost(true);
                    }
                });
            }
        });
    }, []);

    function copyLink() {
        const sharedLink = document.querySelector("#shared-link");
        const sharedlinkText = sharedLink.textContent;
        navigator.clipboard.writeText(sharedlinkText);
        setErrorMessage("Link has been copied")
    }
    // TO-DO: Change this to react router

    return (
        <React.Fragment>
            {errorMessage && <ErrorMessage errorMessage={errorMessage} />}
            <div id="criteria-form-container" className="center">
                {isHost && <div id="invite-link"><div>Share this link with everyone participating:</div><div id="shared-link">{sharedLink}</div><button className='btn' onClick={copyLink}>Copy Link</button></div>}
                <hr />
                <CriteriaForm setErrorMessage={setErrorMessage} />
            </div>
        </React.Fragment >
    );
}

function CriteriaForm(props) {
    const [savedBusinesses, setSavedBusinesses] = React.useState([]);
    const [showSavedBusinesses, setShowSavedBusinesses] = React.useState(false);
    const [arrowDirection, setArrowDirection] = React.useState('down');
    const setErrorMessage = props.setErrorMessage;

    React.useEffect(() => {
        $.get('/get-saved-businesses.json', (res) => {
            setSavedBusinesses(res.saved_businesses);
        });
    }, []);

    function submitCriteria(evt) {
        evt.preventDefault();

        // const criteriaData = $('#criteria-form').serialize();

        if ($("#search-term-field").val() && $(".price:checked").val()) {
            const criteriaData = {
                search_term: $("#search-term-field").val(),
                price: $(".price:checked").val()
            }


            $.post('/add-search-criteria.json', criteriaData, (res) => {
                if (res.msg == "success") {
                    props.setErrorMessage("Your preference has been added!");
                } else {
                    props.setErrorMessage("Something went wrong. Try again.");
                }
            });
        } else {
            props.setErrorMessage("Please fill in type of food and price level!")
        }


    }

    // function findBusiness(evt) {
    //     const business = $('#specific-business-input').value
    //     $.get('/get-specific-business.json', { 'business': business }, (res) => {

    //     })
    // }

    function redirectWaitingRoomStart() {
        window.location.assign('/waiting-room-start');
    }


    function toggleSavedBusinesses() {
        setShowSavedBusinesses((stateVar) => { return !stateVar });
        setArrowDirection((stateVar) => {
            if (stateVar == "down") {
                return "up"
            } else {
                return "down"
            }
        });
    }

    const businessesInfo = [];
    for (const [index, business] of savedBusinesses.entries()) {
        businessesInfo.push(
            <div className="business-component" index={index} key={business.alias}>
                <Business business={business} showSaveButton={false} showAddButton={true} setErrorMessage={setErrorMessage} />
                <hr />
            </div>
        );
    }

    const show = (showSavedBusinesses) ? "show" : "";

    return (
        <React.Fragment>
            <div id="criteria-form-component">
                <h3 id="criteria-form-heading">What are you craving?</h3>
                <form id="criteria-form">
                    <div id="search-field-container"><span className="criteria-form-labels">Type of Food: </span><input type="text" name="search_term" id="search-term-field" /></div>
                    <div id="price-level-container">
                        {/* Price Level:
                        <select name="price">
                            <option value="1">$</option>
                            <option value="2">$$</option>
                            <option value="3">$$$</option>
                            <option value="4">$$$</option>
                        </select> */}
                        <div id="price-level-label" className="criteria-form-labels">Price Level:</div>
                        <input type="radio" className="price" name="price" value="1" id="price-1" /><label className="price-label radio-label" htmlFor="price-1">$</label>
                        <input type="radio" className="price" name="price" value="2" id="price-2" /><label className="price-label radio-label" htmlFor="price-2">$$</label>
                        <input type="radio" className="price" name="price" value="3" id="price-3" /><label className="price-label radio-label" htmlFor="price-3">$$$</label>
                        <input type="radio" className="price" name="price" value="4" id="price-4" /><label className="price-label radio-label" htmlFor="price-4">$$$$</label>
                    </div>
                    {/* <input type="submit" /> */}
                    <button className="btn submit-btn" id="submit-criteria-btn" onClick={submitCriteria}>Submit Criteria</button>
                </form>
                {/* <div>
                    Find Specific Restaurant: <input type="text" id="specific-business-input"></input>
                    <button onClick={findBusiness}>Find Restaurant.</button>
                </div> */}
                <button className="btn" type="button" onClick={toggleSavedBusinesses}>
                    Add a saved restaurant <i className={"arrow " + arrowDirection} />
                </button>
                <div className={"collapse " + show}>
                    <div id="choose-saved-businesses" className="overflow-auto">{businessesInfo}</div>
                </div>
            </div>
            <hr />
            <button class="btn" id="go-to-waiting-room-btn" onClick={redirectWaitingRoomStart}>I'm finished. Continue to waiting room <span className="triangle-right"></span></button>
        </React.Fragment>
    );
}

ReactDOM.render(
    <CriteriaFormContainer />,
    document.querySelector('#root')
);
