function Homepage(props) {

    const url = window.location.href;

    return (
        <React.Fragment>
            <Header url={url} isHomepage={true} />
            <div className="container">
                <div className="row">
                    <div className="col-12 col-md-6" id="homepage-main-div">
                        <h1 id="homepage-brand">YelpHelper</h1>
                        <a className="btn" id="start-link" href="/start-session">Start A Session</a>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}


ReactDOM.render(
    <Homepage />,
    document.querySelector('#root')
);