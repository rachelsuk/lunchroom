function Header(props) {
    const [loggedIn, setLoggedIn] = React.useState(false);

    React.useEffect(() => {
        $.get('/check-login.json', (res) => {
            setLoggedIn(res.logged_in);
        });
    },[]);

    function processLogOut() {
        $.get('/process-logout', (res) => {
            setLoggedIn(false);
        });
    }

    function redirectLogIn() {
        window.location.replace(`/login?url=${props.url}`);
    }

    return (
        <React.Fragment>
           {loggedIn ? <button onClick={processLogOut}>Logout</button> : <button onClick={redirectLogIn}>Login</button>}
        </React.Fragment>
        );
}