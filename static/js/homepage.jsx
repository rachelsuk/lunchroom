function Homepage(props) {

    const url = window.location.href;

    return (
        <React.Fragment>
            <Header url={url}/>
            <a href="/start-session">Start</a>
        </React.Fragment>
    );
}


ReactDOM.render(
    <Homepage />,
    document.querySelector('#root')
);