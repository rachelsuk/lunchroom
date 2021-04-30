function Login(props) {
    const url = window.location.href;

    const onSuccess = () => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const redirectUrl = urlParams.get('url');
        window.location.replace(redirectUrl);

    }

    return (
        <React.Fragment>
            <LoginForm onSuccess={onSuccess} />
            <NewUserForm onSuccess={onSuccess} />
        </React.Fragment>
    );
}

ReactDOM.render(
    <Login />,
    document.querySelector('#root')
);