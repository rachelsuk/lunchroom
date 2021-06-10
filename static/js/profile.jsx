function Profile(props) {
    const [savedBusinesses, setSavedBusinesses] = React.useState([])
    const errorMsgRef = React.useRef();
    React.useEffect(() => {
        $.get('/get-saved-businesses.json', (res) => {
            setSavedBusinesses(res.saved_businesses);
        })
    }, []);
    // const url = window.location.href;
    return (
        <React.Fragment>
            <Header />
            <ErrorMessage ref={errorMsgRef} />
            {savedBusinesses.length > 0 ? <SavedBusinesses savedBusinesses={savedBusinesses} setSavedBusinesses={setSavedBusinesses} errorMsgRef={errorMsgRef} /> : <div>no saved businesses</div>}
        </React.Fragment>
    );
}

function SavedBusinesses(props) {
    const savedBusinesses = props.savedBusinesses;
    const setSavedBusinesses = props.setSavedBusinesses;
    const businessesInfo = [];

    function removeBusiness(evt) {
        let id = evt.target.parentElement.id
        $.post('/remove-saved-business.json', { 'saved-business-id': id }, (res) => {
            if (res.msg == "success") {
                props.errorMsgRef.current.showErrorMessage("Business has been removed from saved businesses.")
                $.get('/get-saved-businesses.json', (res) => {
                    setSavedBusinesses(res.saved_businesses);
                })
            }
        });
    }

    for (const [index, business] of savedBusinesses.entries()) {
        businessesInfo.push(
            <div className="business" index={index} id={business.saved_business_id} key={business.alias}>
                <Business business={business} showSaveButton={false} />
                <button onClick={removeBusiness}>Remove</button>
            </div>
        );
    }
    return <div>{businessesInfo}</div>
}

ReactDOM.render(
    <Profile />,
    document.querySelector('#root')
);