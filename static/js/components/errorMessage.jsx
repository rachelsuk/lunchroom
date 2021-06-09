function ErrorMessage(props) {
    const errorMessage = props.errorMessage;

    React.useEffect(() => {
        if (errorMessage) {
            const popUp = document.querySelector(".pop-up-msg");

            // Add the "show" class to DIV
            popUp.className = "show pop-up-msg";

            // After 3 seconds, remove the show class from DIV
            setTimeout(function () { popUp.className = popUp.className.replace("show pop-up-msg", "pop-up-msg"); }, 3000);

        }
    }, [errorMessage]);
    return (
        <div className="pop-up-msg">{errorMessage}</div>
    );

}