// https://www.w3schools.com/html/html5_geolocation.asp
// https://web.dev/how-to-use-local-https/


function CriteriaFormContainer(props) {
    const [location, setLocation] = React.useState(false);
    const [isHost, setIsHost] = React.useState(false);
    const errorMsgRef = React.useRef();

    // const url = window.location.href;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sharedLink = urlParams.get('url');

    function openModal() {
        const modal = document.getElementById("login-modal");
        modal.style.display = 'block';
    }

    React.useEffect(() => {
        $.get('/check-host.json', (res) => {
            if (res.is_host) {
                setIsHost(true);
            }
        });
    }, []);


    function copyLink() {
        const sharedLink = document.querySelector("#shared-link");
        const sharedlinkText = sharedLink.textContent;
        navigator.clipboard.writeText(sharedlinkText);
        errorMsgRef.current.showErrorMessage("Link has been copied");
    }

    return (
        <React.Fragment>
            <ErrorMessage ref={errorMsgRef} />
            <img id="tempura-img" src='/static/img/tempura.svg'></img>
            <div id="criteria-form-container" className="center">
                {isHost && <div id="invite-link"><div>Share this link with everyone participating:</div><div id="shared-link">{sharedLink}</div><button className='btn' onClick={copyLink}>Copy Link</button></div>}
                <hr />
                <CriteriaForm errorMsgRef={errorMsgRef} />
            </div>
            <img id="egg-img" src='/static/img/egg.svg'></img>
        </React.Fragment>
    );
}

function CriteriaForm(props) {
    const [savedBusinesses, setSavedBusinesses] = React.useState([]);
    const [showSavedBusinesses, setShowSavedBusinesses] = React.useState(false);
    const [arrowDirection, setArrowDirection] = React.useState('down');

    React.useEffect(() => {
        $.get('/get-saved-businesses.json', (res) => {
            setSavedBusinesses(res.saved_businesses);
        });
    }, []);

    function submitCriteria(evt) {
        evt.preventDefault();

        if ($("#search-term-field").val() && $(".price:checked").val()) {
            const criteriaData = {
                search_term: $("#search-term-field").val(),
                price: $(".price:checked").val()
            }


            $.post('/add-search-criteria.json', criteriaData, (res) => {
                if (res.msg == "success") {
                    props.errorMsgRef.current.showErrorMessage("Your preference has been added!");
                } else {
                    props.errorMsgRef.current.showErrorMessage("Something went wrong. Try again.");
                }
            });
        } else {
            props.errorMsgRef.current.showErrorMessage("Please fill in type of food and price level!")
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
            <div className="business-component" index={index} key={business.alias} name={business.name}>
                <Business business={business} showSaveButton={false} showAddButton={true} errorMsgRef={props.errorMsgRef} />
                <hr />
            </div>
        );
    }

    function filterSavedBusinesses() {
        const savedBusinessSearch = $("#saved-businesses-search").val().toLowerCase();
        $('#choose-saved-businesses > .business-component').each(function () {
            if (this.getAttribute('name').toLowerCase().search(savedBusinessSearch) > -1) {
                $(this).show();
            }
            else {
                $(this).hide();
            }
        })
    }

    const show = (showSavedBusinesses) ? "show" : "";

    return (
        <React.Fragment>
            <div id="criteria-form-component">
                <h3 id="criteria-form-heading">What are you craving?</h3>
                <form id="criteria-form">
                    <div id="search-field-container"><span className="criteria-form-labels">Type of Food: </span><input type="text" name="search_term" id="search-term-field" /></div>
                    <div id="price-level-container">
                        <div id="price-level-label" className="criteria-form-labels">Price Level:</div>
                        <input type="radio" className="price" name="price" value="1" id="price-1" /><label className="price-label radio-label" htmlFor="price-1">$</label>
                        <input type="radio" className="price" name="price" value="2" id="price-2" /><label className="price-label radio-label" htmlFor="price-2">$$</label>
                        <input type="radio" className="price" name="price" value="3" id="price-3" /><label className="price-label radio-label" htmlFor="price-3">$$$</label>
                        <input type="radio" className="price" name="price" value="4" id="price-4" /><label className="price-label radio-label" htmlFor="price-4">$$$$</label>
                    </div>
                    <button className="btn submit-btn" id="submit-criteria-btn" onClick={submitCriteria}>Submit Criteria</button>
                </form>
                {/* <div>
                    Find Specific Restaurant: <input type="text" id="specific-business-input"></input>
                    <button onClick={findBusiness}>Find Restaurant.</button>
                </div> */}
                {savedBusinesses.length > 0 && <button className="btn" type="button" onClick={toggleSavedBusinesses}>
                    Add a saved restaurant <i className={"arrow " + arrowDirection} />
                </button>}
                <div className={"collapse " + show}>
                    <div id="saved-businesses-search-form">Search: <input id="saved-businesses-search" type="text" onKeyUp={filterSavedBusinesses}></input></div>
                    <div id="choose-saved-businesses" className="overflow-auto">{businessesInfo}</div>
                </div>
            </div>
            <hr />
            <button className="btn" id="go-to-waiting-room-btn" onClick={redirectWaitingRoomStart}>I'm finished. Continue to waiting room <span className="triangle-right"></span></button>
        </React.Fragment>
    );
}

ReactDOM.render(
    <CriteriaFormContainer />,
    document.querySelector('#root')
);
