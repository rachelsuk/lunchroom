function Homepage(props) {

    return (
        <React.Fragment>
            <Header isHomepage={true} />
            <div className="container">
                <div className="row">
                    <div className="col-12 col-md-6" id="homepage-main-div">
                        <h1 id="homepage-brand">LunchRoom</h1>
                        <a className="btn" id="start-link" href="/start-session">Start A Session<span className="arrow right"></span></a>

                    </div>
                    <div id="homepage-blob" className="col-md-6 d-none d-lg-block">
                        <svg width="55em" height="50em" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                            <path fill="#bfced9" d="M41.3,-72C53.3,-64.7,62.6,-53.1,69.8,-40.4C76.9,-27.7,81.8,-13.8,82.1,0.2C82.4,14.2,78,28.3,71.3,41.7C64.5,55.1,55.4,67.7,43.2,73.3C30.9,79,15.4,77.8,-0.2,78.1C-15.8,78.4,-31.6,80.2,-45.2,75.3C-58.8,70.4,-70.2,58.8,-77.8,45.1C-85.4,31.4,-89.2,15.7,-87.1,1.2C-85,-13.3,-76.9,-26.5,-66.7,-35.6C-56.4,-44.7,-44,-49.7,-32.5,-57.3C-21,-64.9,-10.5,-75.2,2.1,-78.8C14.7,-82.4,29.3,-79.3,41.3,-72Z" transform="translate(100 100)" />
                        </svg>
                    </div>
                </div>

            </div>

        </React.Fragment >
    );
}


ReactDOM.render(
    <Homepage />,
    document.querySelector('#root')
);