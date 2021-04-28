const Router = window.ReactRouterDOM.BrowserRouter;
const Route =  window.ReactRouterDOM.Route;
const Link =  window.ReactRouterDOM.Link;

function Homepage(props) {

    function onSuccess() {
        window.location.replace("/");
    }

    return (
        <Router>
            <Header />
            <Route path='/login' exact render={(props) => (
                <LoginForm onSuccess={onSuccess}/>
			)} />
            <Route path='/new-user' exact render={(props) => (
                <NewUserForm onSuccess={onSuccess}/>
			)} />
            <a href="/form">Start</a>
        </Router>
    );
}


ReactDOM.render(
    <Homepage />,
    document.querySelector('#root')
);