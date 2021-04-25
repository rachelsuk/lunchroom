function NewUserForm(props) {
    return (
        <React.Fragment>
            <h2>Create an Account</h2>
            <form action="/new-user" method="POST">
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