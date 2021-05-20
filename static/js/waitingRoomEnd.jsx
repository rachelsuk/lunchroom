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

    return (<div>Waiting for all participants to finish...</div>)
}

ReactDOM.render(
    <WaitingRoomEnd />,
    document.querySelector('#root')
);