function Login(props) {
    const [showNewUserForm, setShowNewUserForm] = React.useState(false);
    const [otherFormMsg, setOtherFormMsg] = React.useState("I'm new here! Create an account.");
    const noCloseBtn = props.noCloseBtn;

    function closeModal() {
        const modal = document.getElementById("login-modal");
        modal.style.display = "none";
    }

    function toggleForms() {
        setShowNewUserForm((stateVar) => { return !stateVar });
        setOtherFormMsg((stateVar) => {
            if (stateVar == "I'm new here! Create an account.") {
                return "I have an account. Login."
            } else {
                return "I'm new here! Create an account."
            }
        });
    }

    return (
        <React.Fragment>
            <div id="login-modal" className="modal">
                <div className="modal-content">
                    {!noCloseBtn && <span className="close" onClick={closeModal}>&times;</span>}
                    {showNewUserForm ? <NewUserForm closeModal={closeModal} loggedInSuccess={props.loggedInSuccess} /> : <LoginForm closeModal={closeModal} loggedInSuccess={props.loggedInSuccess} />}
                    <button className="btn" id="login-new-user-toggle-btn" onClick={toggleForms}>{otherFormMsg}</button>
                </div>
            </div>
        </React.Fragment>
    );
}

ReactDOM.render(
    <Login />,
    document.querySelector('#root')
);