function NewUser(props) {
    const [errorMessage, setErrorMessage] = React.useState(null);

    const onSuccess = async () => {
        window.location.replace("/form");
    }

    return (
        <React.Fragment>
            <NewUserForm setErrorMessage={setErrorMessage} errorMessage={errorMessage} onSuccess={onSuccess} />
        </React.Fragment>
    );
}



ReactDOM.render(
    <NewUser />,
    document.querySelector('#root')
);