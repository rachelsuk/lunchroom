function Footer(props) {
    return (
        // <div id="footer">

        //     <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
        //     <div>Icons made by <a href="https://www.flaticon.com/authors/baianat" title="Baianat">Baianat</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
        //     <a href="https://www.vecteezy.com/free-vector/vector">Vector Vectors by Vecteezy</a>
        // </div>
        <div id="wave-container">
            <div id="wave"></div>
            {/* <div id="footer-links">
                <a id="about-app-link" href="/about-app">About this App</a>
                <a id="credits-link" href="/credits">Credits</a>
            </div> */}
        </div>
    );
}

ReactDOM.render(
    <Footer />,
    document.querySelector('#footer')
);
