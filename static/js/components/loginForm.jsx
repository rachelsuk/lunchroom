function LoginForm(props) {

    function loginHandler(evt) {
        evt.preventDefault();

        const formData = {
            'email': document.querySelector('#login-form').elements.email.value,
            'password': document.querySelector('#login-form').elements.password.value
        };
        $.post('/login', formData, (res) => {
            if (res.message === "success") {
                props.onSuccess();
            }
            else {
                props.setErrorMessage(res.message);
            }
            
        });

    }
    
    return (
        <React.Fragment>
            {props.errorMessage ? <ErrorMessage errorMessage={props.errorMessage} /> : null}
            <h2>Login</h2>
            <form onSubmit={loginHandler} id="login-form">
                Email <input type="text" name="email" />
                Password <input type="password" name="password" />
                <input type="submit" />
            </form>
        </React.Fragment>
    );
}