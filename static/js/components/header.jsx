function Header(props) {
    const isHomepage = props.isHomepage;
    const [loggedIn, setLoggedIn] = React.useState(false);

    React.useEffect(() => {
        $.get('/check-login.json', (res) => {
            setLoggedIn(res.logged_in);
        });
    }, []);

    function processLogOut() {
        $.get('/process-logout', (res) => {
            setLoggedIn(false);
            window.location.replace('/');
        });
    }

    function redirectLogIn() {
        window.location.assign(`/login?url=${props.url}`);
    }

    function redirectProfile() {
        window.location.assign(`/profile`)
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-dark">
            <div className="container-fluid">
                {!isHomepage ? <a className="navbar-brand" id="navbar-brand" href="/">YelpHelper</a> : null}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    {loggedIn ?
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <button className="btn" onClick={redirectProfile}>My Profile</button>
                            </li>
                            <li className="nav-item">
                                <button className="btn" onClick={processLogOut}>Logout</button>
                            </li>
                        </ul> :
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <button className="btn" onClick={redirectLogIn}>Login</button>
                            </li>
                        </ul>}
                </div>
            </div>
        </nav>
    );
}