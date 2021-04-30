function CriteriaForm(props) {

    const url = window.location.href;

    return (
        <React.Fragment>
            <Header url={url}/>
            <form method="POST" action="/yelphelpersession-setup">
                Food: <input type="text" name="search_term" />
                Location: <input type="text" name="location" />
                Price Level:
                <select name="price">
                    <option value="1">$</option>
                    <option value="2">$$</option>
                    <option value="3">$$$</option>
                    <option value="4">$$$</option>
                </select>
                <input type="submit" />
            </form>
        </React.Fragment>
    );
}


ReactDOM.render(
    <CriteriaForm />,
    document.querySelector('#root')
);