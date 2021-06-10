const ErrorMessage = React.forwardRef((props, ref) => {

    const errorMessage = props.errorMessage;

    React.useImperativeHandle(ref, () => ({
        showErrorMessage: (errorMessage) => {
            const popUp = document.querySelector(".pop-up-msg");

            popUp.innerHTML = errorMessage;

            // Add the "show" class to DIV
            popUp.className = "show pop-up-msg";

            // After 3 seconds, remove the show class from DIV
            setTimeout(function () {
                popUp.className = popUp.className.replace("show pop-up-msg", "pop-up-msg");
            }, 3000);
        }

    }));


    // React.useEffect(() => {
    //     if (errorMessage) {
    //         const popUp = document.querySelector(".pop-up-msg");

    //         // Add the "show" class to DIV
    //         popUp.className = "show pop-up-msg";

    //         // After 3 seconds, remove the show class from DIV
    //         setTimeout(function () {
    //             popUp.className = popUp.className.replace("show pop-up-msg", "pop-up-msg");
    //         }, 3000);

    //         // setErrorMessage(null);

    //     }
    // }, [errorMessage]);
    return (
        <div className="pop-up-msg">{errorMessage}</div>
    );

});