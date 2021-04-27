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
    );
}