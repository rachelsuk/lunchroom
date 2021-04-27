function NewUserForm(props) {

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
        $.post('/new-user', formData, (res) => {
            if (res.message === 'success') {
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
            <h2>Create an Account</h2>
            <form onSubmit={registerUserHandler} id="new-user-form">
                First Name <input type="text" name="fname" />
                Last Name <input type="text" name="lname" />
                Phone Number <input type="text" name="phone" />
                Email <input type="text" name="email" />
                Password <input type="password" name="password" />
                <input type="submit" />
            </form>
        </React.Fragment>
    );
}