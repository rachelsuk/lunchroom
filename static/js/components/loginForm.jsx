function LoginForm(props) {
    const [errorMessage, setErrorMessage] = React.useState(null);

    function loginHandler(evt) {
        evt.preventDefault();

        const formData = {
            'email': document.querySelector('#login-form').elements.email.value,
            'password': document.querySelector('#login-form').elements.password.value
        };
        $.post('/process-login.json', formData, (res) => {
            if (res.message === "success") {
                props.closeModal();
                props.loggedInSuccess();
            }
            else {
                setErrorMessage(res.message);
            }

        });

    }

    return (
        <div id="login-container" className='center'>
            {errorMessage ? <ErrorMessage errorMessage={errorMessage} /> : null}
            <h2>Login</h2>
            <form id="login-form" className="login-new-user-form">
                <div>Email <input type="text" name="email" /></div>
                <div>Password <input type="password" name="password" /></div>
                <button className="btn submit-btn btn-border" onClick={loginHandler}>Submit</button>
            </form>
        </div>
    );
}