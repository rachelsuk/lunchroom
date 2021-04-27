function Login(props) {
    const [errorMessage, setErrorMessage] = React.useState(null);

    const onSuccess = async () => {
        window.location.replace("/form");
    }

    return (
        <React.Fragment>
            <LoginForm setErrorMessage={setErrorMessage} errorMessage={errorMessage} onSuccess={onSuccess} />
            <a href="/new-user">I'm new here!</a> 
        </React.Fragment>
    );
}



ReactDOM.render(
    <Login />,
    document.querySelector('#root')
);
