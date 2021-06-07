// https://engineering.universe.com/building-a-google-map-in-react-b103b4ee97f1
// https://stackoverflow.com/questions/15719951/auto-center-map-with-multiple-markers-in-google-maps-api-v3

// TODO: show all restaurants (disable info for other restaurants and show restaurant as different color during quiz) to prevent re-rendering
// on hover: don't open up info window, but show data to the right of the map.
function QuizGoogleMap(props) {
    const business = props.business;
    const businessIndex = props.businessIndex
    const usersLocations = props.usersLocations;
    const [businessMarker, setBusinessMarker] = React.useState(null);
    const [userMarker, setUserMarker] = React.useState(null);
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
            setDistance(findDistance(userMarker.index, businessMarker.index));
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
            document.getElementById("google-map-quiz"));


        // create empty lat/lng bounds for the map
        const bounds = new google.maps.LatLngBounds();

        // create marker for each business
        const businessMarker = new google.maps.Marker({
            index: businessIndex,
            position: { lat: business.lat, lng: business.lng },
            title: business.name,
            map: googleMap,
            image_url: business.image_url,
            url: business.url,
        });

        bounds.extend(businessMarker.position);

        businessMarker.addListener('click', () => {
            savedCallback.current(businessMarker, false);
        });

        setBusinessMarker({ index: businessMarker.index, name: businessMarker.title });

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

        let prevInfoWindow = false;
        // create infoWindow for each user with info about the user
        for (const marker of userMarkers) {
            bounds.extend(marker.position);

            const markerInfo = (`
                <h1 className='user-name'>${marker.title}</h1>
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
            setDistance(null);
            setBusinessMarker(null);
            setUserMarker(null);
        };
    }, [business, usersLocations]);



    function findDistance(user_index, business_index) {
        let distance_meters = ((distanceResponse.rows[user_index]).elements[business_index]).distance.value;
        let distance_miles = distance_meters * 0.000621371
        return distance_miles

    }

    return (
        <React.Fragment>
            {distance ? <div id="distance">Distance from {userMarker.name} to {businessMarker.name}: {distance} miles.</div> : null}
            <div id="google-map-quiz" className="google-map" />
        </React.Fragment>
    )
}
