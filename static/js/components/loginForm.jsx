const Link =  window.ReactRouterDOM.Link;

function LoginForm(props) {
    const [errorMessage, setErrorMessage] = React.useState(null);

    function loginHandler(evt) {
        evt.preventDefault();

        const formData = {
            'email': document.querySelector('#login-form').elements.email.value,
            'password': document.querySelector('#login-form').elements.password.value
        };
        $.post('/process-login', formData, (res) => {
            
            if (res.message === "success") {
                props.onSuccess();
            }
            else {
                setErrorMessage(res.message);
            }
            
        });

    }
    
    return (
        <React.Fragment>
            {errorMessage ? <ErrorMessage errorMessage={errorMessage} /> : null}
            <h2>Login</h2>
            <form onSubmit={loginHandler} id="login-form">
                Email <input type="text" name="email" />
                Password <input type="password" name="password" />
                <input type="submit" />
            </form>
            <Link to='/new-user'>I'm new here!</Link>
        </React.Fragment>
    );
}