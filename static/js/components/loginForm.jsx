function LoginForm(props) {
    const errorMsgRef = React.useRef();

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
                errorMsgRef.current.showErrorMessage(res.message);

            }

        });

    }

    return (
        <React.Fragment>
            <ErrorMessage ref={errorMsgRef} />
            <div id="login-container" className='center'>
                <h2>Login</h2>
                <form id="login-form" className="login-new-user-form">
                    <div>Email <input type="text" name="email" /></div>
                    <div>Password <input type="password" name="password" /></div>
                    <button className="btn submit-btn btn-border" onClick={loginHandler}>Submit</button>
                </form>
            </div>
        </React.Fragment>
    );
}