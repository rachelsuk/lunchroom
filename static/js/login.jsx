function YelpHelper(props) {
    return (
        <React.Fragment>
            <NewUserForm />
            <LoginForm />
        </React.Fragment>
    );
}

ReactDOM.render(
    <YelpHelper />,
    document.querySelector('#root')
);
