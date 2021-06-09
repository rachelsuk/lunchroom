// https://engineering.universe.com/building-a-google-map-in-react-b103b4ee97f1
// https://stackoverflow.com/questions/15719951/auto-center-map-with-multiple-markers-in-google-maps-api-v3

// TODO: show all restaurants (disable info for other restaurants and show restaurant as different color during quiz) to prevent re-rendering
// on hover: don't open up info window, but show data to the right of the map.
function GoogleMap(props) {
    const businesses = props.businesses;
    const usersLocations = props.usersLocations;
    const [businessMarker, setBusinessMarker] = React.useState(null);
    const [userMarker, setUserMarker] = React.useState(null);
    const [duration, setDuration] = React.useState(null);
    const [distance, setDistance] = React.useState(null);
    const [distanceResponse, setDistanceResponse] = React.useState(null);
    const savedCallback = React.useRef();

    function markerCallback(marker, isUser) {
        if (isUser) {
            setUserMarker({ index: marker.index, name: marker.title });

        } else {
            setBusinessMarker({ index: marker.index, name: marker.title });
        }
    }

    React.useEffect(() => {
        if (userMarker && businessMarker) {
            setDuration(findDistance(userMarker.index, businessMarker.index).durationMinutes);
            setDistance(findDistance(userMarker.index, businessMarker.index).distanceMiles);
        }
        savedCallback.current = markerCallback;
    }, [userMarker, businessMarker])

    React.useEffect(() => {
        $.get('/get-distances.json', (res) => {
            if (res.msg == 'success') {
                setDistanceResponse(res.distance_matrix);
            }
        })
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
                // icon: {  // custom icon
                //     url: '/static/img/hamburger.png',
                //     scaledSize: {
                //         width: 30,
                //         height: 30
                //     }
                // }
            }));
        }

        let prevInfoWindow = false;

        // create infoWindow for each business with info about business
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

            marker.addListener('mouseover', () => {
                if (prevInfoWindow) {
                    prevInfoWindow.close();
                }
                prevInfoWindow = infoWindow;
                infoWindow.open(googleMap, marker);

            });
            marker.addListener('click', () => {
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

            marker.addListener('mouseover', () => {
                if (prevInfoWindow) {
                    prevInfoWindow.close();
                }
                prevInfoWindow = infoWindow;
                infoWindow.open(googleMap, marker);
            });

            marker.addListener('click', () => {
                savedCallback.current(marker, true);
            });
        }

        // auto center map to fit all business and user markers
        googleMap.fitBounds(bounds);
        googleMap.panToBounds(bounds);

        return function cleanup() {
            setDuration(null);
            setDistance(null);
            setBusinessMarker(null);
            setUserMarker(null);
        };
    }, [businesses, usersLocations]);



    function findDistance(user_index, business_index) {
        let durationSeconds = ((distanceResponse.rows[user_index]).elements[business_index]).duration.value;
        let durationMinutes = durationSeconds / 60
        let distanceMeters = ((distanceResponse.rows[user_index]).elements[business_index]).distance.value;
        let distanceMiles = distanceMeters * 0.000621371
        return { 'durationMinutes': durationMinutes, 'distanceMiles': distanceMiles }
    }

    return (
        <React.Fragment>
            {duration && <div id="distance">Driving duration from {userMarker.name} to {businessMarker.name}: {Number((duration).toFixed(0))} minutes ({Number((distance).toFixed(1))} miles).</div>}
            <div id="google-map" className="google-map" />
        </React.Fragment>
    )
}

