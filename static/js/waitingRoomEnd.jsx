function WaitingRoomEnd(props) {

    React.useEffect(() => {
        const interval = setInterval(() => {
            $.post('/check-all-completed', (res) => {
                if (res.all_completed) {
                    window.location.replace("/result");
                }
            });
        }, 1000);

        return () => clearInterval(interval);

    }, [])

    return (<React.Fragment>
        <img id="tempura-img" src='/static/img/tempura.svg'></img>
        <div id="waiting-finish-heading" className='center'>Waiting for all participants to finish...</div>
        <img id="egg-img" src='/static/img/egg.svg'></img>
    </React.Fragment>)
}

ReactDOM.render(
    <WaitingRoomEnd />,
    document.querySelector('#root')
);