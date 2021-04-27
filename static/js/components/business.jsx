function Business(props) {
    const business = props.business;
    return (
        <React.Fragment>
            <a className='business-name' href={business.url} target="_blank">{business.name}</a>
            <div>
                <img src={`${business.image_url}`} width="200" height="200"/>
            </div>
            <ul className='business-details'>
                <li>Number of Yelp Reviews: {business.review_count}</li>
                <li>Number of Yelp Stars: {business.yelp_rating}</li>
            </ul>
        </React.Fragment>
    );
}