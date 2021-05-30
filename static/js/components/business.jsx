function Business(props) {
    const business = props.business;
    const showSaveButton = props.showSaveButton;
    const setErrorMessage = props.setErrorMessage;

    function addToSavedBusinesses() {
        $.post('/add-to-saved-businesses.json', { 'business-alias': business.alias }, (res) => {
            if (res.msg == "success") {
                setErrorMessage("Business has been added to your saved businesses.")
            } else if (res.msg == "already entered") {
                setErrorMessage("Business was already previously added.")
            }
        })
    }

    return (
        <React.Fragment>
            <a className='business-name' href={business.url} target="_blank">{business.name}</a>
            <div>
                <img src={`${business.image_url}`} width="200" height="200" />
            </div>
            <ul className='business-details'>
                <li>Number of Yelp Reviews: {business.review_count}</li>
                <li>Number of Yelp Stars: {business.yelp_rating}</li>
            </ul>
            {showSaveButton ? <button onClick={addToSavedBusinesses}>Add to my saved businesses.</button> : null}
        </React.Fragment>
    );
}