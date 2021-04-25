function LoginForm(props) {
    
    return (
        <React.Fragment>
            <h2>Login</h2>
            <form action="/login" method="POST">
                Email <input type="text" name="email" />
                Password <input type="password" name="password" />
                <input type="submit" />
            </form>
        </React.Fragment>
    );
}