function Business(props) {
    const business = props.business;
    const showSaveButton = props.showSaveButton;
    const showAddButton = props.showAddButton;
    const showRemoveButton = props.showRemoveButton;
    const showBusinessRanking = props.showBusinessRanking;
    const businessIndex = props.businessIndex;

    function addToSavedBusinesses() {
        $.post('/add-to-saved-businesses.json', { 'business-alias': business.alias }, (res) => {
            if (res.msg == "success") {
                props.errorMsgRef.current.showErrorMessage("Business has been added to your saved businesses.")
            } else if (res.msg == "already entered") {
                props.errorMsgRef.current.showErrorMessage("Business was already previously added.")
            }
        })
    }


    function addBusiness(evt) {
        $.post('/add-saved-business-to-yp-session.json', { 'saved-business-id': business.saved_business_id }, (res) => {
            if (res.msg == "success") {
                props.errorMsgRef.current.showErrorMessage("Business has been added to the session.")
            } else if (res.msg == "already added") {
                props.errorMsgRef.current.showErrorMessage("Business has already been added to the session.")
            }
        });
    }

    function removeBusiness(evt) {
        $.post('/remove-saved-business.json', { 'saved-business-id': business.saved_business_id }, (res) => {
            if (res.msg == "success") {
                props.errorMsgRef.current.showErrorMessage("Business has been removed from saved businesses.")
                $.get('/get-saved-businesses.json', (res) => {
                    props.setSavedBusinesses(res.saved_businesses);
                })
            }
        });
    }

    return (
        <React.Fragment>
            <div className="business-container" id={'business-id-' + business.saved_business_id}>
                <div className="business-info">
                    <a className='business-name' id={'business-name-' + business.alias} href={business.url} target="_blank">
                        {showBusinessRanking && <span>{businessIndex + 1}. </span>}
                        {business.name}</a>
                    <div>
                        <img src={`${business.image_url}`} width="200" height="200" />
                    </div>
                    {(business.review_count && business.yelp_rating) && <div className='business-details'>
                        <div><img src={`/static/img/yelp_stars/small_${business.yelp_rating}@2x.png`}></img><img src="/static/img/yelp-logo.png" width="75px"></img></div>
                        <div>Based on {business.review_count} Reviews</div>

                    </div>}
                </div><div className="business-btns">
                    {showSaveButton && <button className="btn business-btn" onClick={addToSavedBusinesses}>Add to my saved restaurants</button>}
                    {showAddButton && <button className="btn business-btn" onClick={addBusiness}>Add Restaurant</button>}
                    {showRemoveButton && <button className="btn business-btn" onClick={removeBusiness}>Unsave Restaurant</button>}
                </div>
            </div>
        </React.Fragment >
    );
}