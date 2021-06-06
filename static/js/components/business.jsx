function Business(props) {
    const business = props.business;
    const showSaveButton = props.showSaveButton;
    const setErrorMessage = props.setErrorMessage;
    const showAddButton = props.showAddButton;

    function addToSavedBusinesses() {
        $.post('/add-to-saved-businesses.json', { 'business-alias': business.alias }, (res) => {
            if (res.msg == "success") {
                setErrorMessage("Business has been added to your saved businesses.")
            } else if (res.msg == "already entered") {
                setErrorMessage("Business was already previously added.")
            }
        })
    }


    function addBusiness(evt) {
        let id = evt.target.parentElement.parentElement.id
        $.post('/add-saved-business-to-yp-session.json', { 'saved-business-id': id }, (res) => {
            if (res.msg == "success") {
                props.setErrorMessage("Business has been added to the session.")
            } else if (res.msg == "already added") {
                props.setErrorMessage("Business has already been added to the session.")
            }
        });
    }

    return (
        <React.Fragment>
            <div className="business-container" id={business.saved_business_id}>
                <div className="business-info">
                    <a className='business-name' id={'business-name' + business.alias} href={business.url} target="_blank">{business.name}</a>
                    <div>
                        <img src={`${business.image_url}`} width="200" height="200" />
                    </div>
                    {(business.review_count && business.yelp_rating) && <ul className='business-details'>
                        <li>Number of Yelp Reviews: {business.review_count}</li>
                        <li>Number of Yelp Stars: {business.yelp_rating}</li>
                    </ul>}
                </div>
                <div className="business-btns">
                    {showSaveButton && <button onClick={addToSavedBusinesses}>Add to my saved restaurants.</button>}
                    {showAddButton && <button className="btn add-restaurant-btn" onClick={addBusiness}>Add Restaurant</button>}
                </div>
            </div>
            <hr />

        </React.Fragment >
    );
}