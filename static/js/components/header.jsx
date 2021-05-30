function Header(props) {
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
        window.location.replace(`/login?url=${props.url}`);
    }

    function redirectProfile() {
        window.location.replace(`/profile`)
    }

    return (
        <div>
            <a href="/">YelpHelper</a>
            {loggedIn ? <button onClick={processLogOut}>Logout</button> : <button onClick={redirectLogIn}>Login</button>}
            {loggedIn ? <button onClick={redirectProfile}>My Profile</button> : null}
        </div>
    );
}