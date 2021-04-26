function YelpHelper(props) {
    const [errorMessage, setErrorMessage] = React.useState(null);


    const onSuccess = async () => {
        window.location.replace("/form");
    }

    return (
        <React.Fragment>
            {errorMessage ? <ErrorMessage errorMessage={errorMessage} /> : null}
            <NewUserForm setErrorMesssage={setErrorMessage} onSuccess={onSuccess} />
            <LoginForm setErrorMessage={setErrorMessage} onSuccess={onSuccess} />
        </React.Fragment>
    );
}



ReactDOM.render(
    <YelpHelper />,
    document.querySelector('#root')
);
