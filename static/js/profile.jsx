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
                <div><button className="btn profile-btns" onClick={() => setShowSavedBusinesses(true)}>Saved Businesses</button></div>
                <div><button className="btn profile-btns" onClick={() => setShowSavedBusinesses(false)}>Edit Profile</button></div>
            </div>
            <img id="tempura-img" src='/static/img/tempura.svg'></img>
            {showSavedBusinesses ?
                <SavedBusinesses savedBusinesses={savedBusinesses} setSavedBusinesses={setSavedBusinesses} errorMsgRef={errorMsgRef} />
                : <EditProfile errorMsgRef={errorMsgRef} />
            }
            <img id="egg-img" src='/static/img/egg.svg'></img>
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
            <div className="profile-body">{savedBusinesses.length > 0 ? <div>{businessesInfo}</div> : <div>no saved businesses</div>}</div>
        </div>
    )
}

function EditProfile(props) {
    const [userData, setUserData] = React.useState(null);
    const [editProfile, setEditProfile] = React.useState(false);
    const errorMsgRef = props.errorMsgRef;

    React.useEffect(() => {
        $.get('/get-user-data.json', (res) => {
            setUserData(res);
        })
    }, []);

    return (
        <div id="edit-profile" className="center">
            <h1 id="edit-profile-header" className="profile-headers">Edit Profile</h1>
            {editProfile ? <EditProfileMode setEditProfile={setEditProfile} userData={userData} setUserData={setUserData} errorMsgRef={errorMsgRef} /> : <ViewProfileMode setEditProfile={setEditProfile} userData={userData} setUserData={setUserData} />}
        </div>
    )
}

function EditProfileMode(props) {
    const setEditProfile = props.setEditProfile;
    const userData = props.userData;
    const setUserData = props.setUserData;
    const errorMsgRef = props.errorMsgRef;

    function saveProfile(evt) {
        evt.preventDefault();

        const formData = {
            'fname': document.querySelector('#profile-infos-edit').elements.fname.value,
            'lname': document.querySelector('#profile-infos-edit').elements.lname.value,
            'email': document.querySelector('#profile-infos-edit').elements.email.value,
            'phone': document.querySelector('#profile-infos-edit').elements.phone.value
        };
        $.post('/edit-user-data.json', formData, (res) => {
            if (res.msg === "success") {
                errorMsgRef.current.showErrorMessage("Your profile has been updated!");
                setUserData(res.user);
                setEditProfile(false);
            }
            // else {
            //     errorMsgRef.current.showErrorMessage(res.message);

            // }

        });
    }

    return (
        <div id="profile-info-container" className="profile-body">
            <form id="profile-infos-edit">
                <div className="profile-info-edit">First Name: <input type="text" name="fname" defaultValue={userData.fname} /></div>
                <div className="profile-info-edit">Last Name: <input type="text" name="lname" defaultValue={userData.lname} /></div>
                <div className="profile-info-edit">Email: <input type="text" name="email" defaultValue={userData.email} /></div>
                <div className="profile-info-edit">Phone: <input type="text" name="phone" defaultValue={userData.phone} /></div>
                <button className="btn submit-btn" onClick={saveProfile}>Save Changes</button>
                <button className="btn submit-btn" onClick={() => setEditProfile(false)}>Cancel</button>
            </form>
        </div>
    )
}

function ViewProfileMode(props) {
    const setEditProfile = props.setEditProfile;
    const userData = props.userData;

    return (
        <React.Fragment>
            {userData && <div id="profile-info-container" className="profile-body">
                <div id="profile-infos">
                    <div className="profile-info">First Name: {userData.fname}</div>
                    <div className="profile-info">Last Name: {userData.lname}</div>
                    <div className="profile-info">Email: {userData.email}</div>
                    <div className="profile-info">Phone: {userData.phone}</div>
                    <button className="btn submit-btn" onClick={() => setEditProfile(true)}>Edit Profile</button>
                </div>
            </div>}
        </React.Fragment>
    )
}

ReactDOM.render(
    <Profile />,
    document.querySelector('#root')
);