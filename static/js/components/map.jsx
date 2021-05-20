// https://engineering.universe.com/building-a-google-map-in-react-b103b4ee97f1
// https://stackoverflow.com/questions/15719951/auto-center-map-with-multiple-markers-in-google-maps-api-v3

function GoogleMap(props) {
    const businesses = props.businesses;
    const usersLocations = props.usersLocations;
    const [businessMarker, setBusinessMarker] = React.useState(null);
    const [userMarker, setUserMarker] = React.useState(null);
    const [distance, setDistance] = React.useState(null);
    const [distanceResponse, setDistanceResponse] = React.useState(null);
    const savedCallback = React.useRef();

    function markerCallback(marker, isUser) {
        console.log("callback function.");
        console.log(marker)
        console.log(isUser)
        if (isUser) {
            setUserMarker({ index: marker.index, name: marker.title });
        } else {
            console.log("setting business marker...")
            console.log(marker.title)
            setBusinessMarker({ index: marker.index, name: marker.title });
        }
        console.log(userMarker);
        console.log(businessMarker);

        if (userMarker && businessMarker) {
            setDistance(findDistance(userMarker.index, businessMarker.index));
        }
    }

    React.useEffect(() => {
        savedCallback.current = markerCallback;
    })

    React.useEffect(() => {

        setDistance(null);
        setBusinessMarker(null);
        setUserMarker(null);

        // create googlemaps map
        const googleMap = new google.maps.Map(
            document.getElementById("google-map"));

        // create empty lat/lng bounds for the map
        const bounds = new google.maps.LatLngBounds();

        // create marker for each business
        const businessMarkers = [];
        for (const [index, business] of businesses.entries()) {
            let number = index + 1
            businessMarkers.push(new google.maps.Marker({
                index: index,
                position: { lat: business.lat, lng: business.lng },
                title: business.name,
                map: googleMap,
                image_url: business.image_url,
                url: business.url,
                totalScore: business.total_score,
                label: number.toString(),
                icon: {  // custom icon
                    url: '/static/img/hamburger.png',
                    scaledSize: {
                        width: 30,
                        height: 30
                    }
                }
            }));
        }

        let prevInfoWindow = false;

        // create infoWindow for each business with info about business
        const destinations = [];
        for (const marker of businessMarkers) {
            bounds.extend(marker.position);

            const markerInfo = (`
                <h1><a className='business-name' href=${marker.url} target="_blank">#${marker.label}. ${marker.title}</a></h1>
                <img src=${marker.image_url} width="150" height="150" />
                <p>
                <div>Total Score of <b>${marker.totalScore}</b></div>
                Located at: <code>${marker.position.lat()}</code>,
                <code>${marker.position.lng()}</code>
                </p>
            `);

            const infoWindow = new google.maps.InfoWindow({
                content: markerInfo,
                maxWidth: 200
            });

            destinations.push(new google.maps.LatLng(marker.position.lat(), marker.position.lng()))

            marker.addListener('mouseover', () => {
                if (prevInfoWindow) {
                    prevInfoWindow.close();
                }
                prevInfoWindow = infoWindow;
                infoWindow.open(googleMap, marker);
            });
            marker.addListener('click', () => {
                console.log("business clicked.")

                savedCallback.current(marker, false);


            });
        }

        // create markers for each user
        const userMarkers = [];
        for (const [index, user] of usersLocations.entries()) {
            if (user.lat && user.lng) {
                userMarkers.push(new google.maps.Marker({
                    index: index,
                    position: { lat: user.lat, lng: user.lng },
                    title: user.fname,
                    map: googleMap,
                    icon: {  // custom icon
                        url: '/static/img/person-marker.png',
                        scaledSize: {
                            width: 30,
                            height: 30
                        }
                    }
                }));
            }
        }

        const origins = [];
        // create infoWindow for each user with info about the user
        for (const marker of userMarkers) {
            bounds.extend(marker.position);

            const markerInfo = (`
                <h1 className='user-name'>${marker.title}</h1>
                Located at: <code>${marker.position.lat()}</code>,
                <code>${marker.position.lng()}</code>
                </p>
            `);

            const infoWindow = new google.maps.InfoWindow({
                content: markerInfo,
                maxWidth: 400
            });

            origins.push(new google.maps.LatLng(marker.position.lat(), marker.position.lng()))

            marker.addListener('mouseover', () => {
                if (prevInfoWindow) {
                    prevInfoWindow.close();
                }
                prevInfoWindow = infoWindow;
                infoWindow.open(googleMap, marker);
            });

            marker.addListener('click', () => {
                console.log("user clicked.")
                savedCallback.current(marker, true);

            });
        }

        const service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
            {
                origins: origins,
                destinations: destinations,
                travelMode: 'DRIVING',
                unitSystem: google.maps.UnitSystem.IMPERIAL
            }, distanceCallback);

        function distanceCallback(res, status) {
            console.log(res)
            if (status == "OK") {
                setDistanceResponse(res);
            } else {
                console.log(status)
            }

        }

        // auto center map to fit all business and user markers
        googleMap.fitBounds(bounds);
        googleMap.panToBounds(bounds);
    }, [businesses, usersLocations]);

    function findDistance(user_index, business_index) {
        console.log(user_index)
        console.log(distanceResponse.rows[user_index])
        let distance_meters = ((distanceResponse.rows[user_index]).elements[business_index]).distance.value;
        let distance_miles = distance_meters * 0.000621371
        return distance_miles

    }

    return (
        <React.Fragment>
            {distance ? <div id="distance">Distance from {userMarker.name} to {businessMarker.name}: {distance} miles.</div> : null}
            <div id="google-map" style={{ width: '800px', height: '600px' }} />
        </React.Fragment>
    )
}

