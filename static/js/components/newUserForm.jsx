function NewUserForm(props) {
    const errorMsgRef = React.useRef();

    function registerUserHandler(evt) {
        evt.preventDefault();

        const newUserForm = document.querySelector('#new-user-form').elements;

        const formData = {
            'fname': newUserForm.fname.value,
            'lname': newUserForm.lname.value,
            'phone': newUserForm.phone.value,
            'email': newUserForm.email.value,
            'password': newUserForm.password.value
        };
        $.post('/new-user.json', formData, (res) => {
            if (res.message === 'success') {
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
            <div id="new-user-container" className="center">
                <h2>Create an Account</h2>
                <form id="new-user-form" className="login-new-user-form">
                    <div>First Name <input type="text" name="fname" /></div>
                    <div>Last Name <input type="text" name="lname" /></div>
                    <div>Phone Number <input type="text" name="phone" /></div>
                    <div>Email <input type="text" name="email" /></div>
                    <div>Password <input type="password" name="password" /></div>
                    <button className="btn submit-btn btn-border" onClick={registerUserHandler}>Submit</button>
                </form>
            </div>
        </React.Fragment>
    );
}