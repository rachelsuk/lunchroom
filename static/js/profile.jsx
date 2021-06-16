function Profile(props) {
    const [savedBusinesses, setSavedBusinesses] = React.useState([])
    const [showSavedBusinesses, setShowSavedBusinesses] = React.useState(true);
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
            <div id="profile-sidebar">
                <div>My Profile</div>
                <div><button className="btn" onClick={() => setShowSavedBusinesses(true)}>Saved Businesses</button></div>
                <div><button className="btn" onClick={() => setShowSavedBusinesses(false)}>Edit Profile</button></div>
            </div>
            {showSavedBusinesses ?
                <SavedBusinesses savedBusinesses={savedBusinesses} setSavedBusinesses={setSavedBusinesses} errorMsgRef={errorMsgRef} />
                : <EditProfile />
            }
        </React.Fragment>
    );
}

function SavedBusinesses(props) {
    const savedBusinesses = props.savedBusinesses;
    const setSavedBusinesses = props.setSavedBusinesses;
    const businessesInfo = [];



    for (const [index, business] of savedBusinesses.entries()) {
        businessesInfo.push(
            <div className="business" index={index} id={business.saved_business_id} key={business.alias}>
                <Business business={business} showSaveButton={false} showRemoveButton={true} errorMsgRef={props.errorMsgRef} setSavedBusinesses={setSavedBusinesses} />
                <hr />
            </div>
        );
    }
    return (
        <div id="profile-saved-businesses" className="center">
            <h1 id="profile-saved-businesses-header" className="profile-headers">Saved Restaurants</h1>
            {savedBusinesses.length > 0 ? <div>{businessesInfo}</div> : <div>no saved businesses</div>}
        </div>
    )
}

function EditProfile(props) {
    const [userData, setUserData] = React.useState(null);

    React.useEffect(() => {
        $.get('/get-user-data.json', (res) => {
            setUserData(res);
        })
    }, []);
    return (
        <div id="edit-profile" className="center">
            <h1 id="edit-profile-header" className="profile-headers">Edit Profile</h1>
            {userData && <div>
                <div>first name: {userData.fname}</div>
                <div>last name: {userData.lname}</div>
                <div>email: {userData.email}</div>
                <div>phone: {userData.phone}</div>
            </div>}

        </div>
    )
}

ReactDOM.render(
    <Profile />,
    document.querySelector('#root')
);