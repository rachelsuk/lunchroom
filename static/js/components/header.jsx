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

    return (
        <React.Fragment>
           {loggedIn ? <button onClick={processLogOut}>Logout</button> : <a href={`/login?url=${props.url}`}>Login</a>}
        </React.Fragment>
        );
}