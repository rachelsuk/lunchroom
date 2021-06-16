// https://engineering.universe.com/building-a-google-map-in-react-b103b4ee97f1
// https://stackoverflow.com/questions/15719951/auto-center-map-with-multiple-markers-in-google-maps-api-v3

// TODO: show all restaurants (disable info for other restaurants and show restaurant as different color during quiz) to prevent re-rendering
// on hover: don't open up info window, but show data to the right of the map.
const QuizGoogleMap = React.forwardRef((props, ref) => {
    const businesses = props.businesses;
    const usersLocations = props.usersLocations;
    const [businessMarker, setBusinessMarker] = React.useState(null);
    const [userMarker, setUserMarker] = React.useState(null);
    const [duration, setDuration] = React.useState(null);
    const [distance, setDistance] = React.useState(null);
    const [distanceResponse, setDistanceResponse] = React.useState(null);
    const [businessMarkers, setBusinessMarkers] = React.useState(null);
    const [userMarkers, setUserMarkers] = React.useState(null);
    const [prevBusinessMarker, setPrevBusinessMarker] = React.useState(null);

    const savedCallback = React.useRef();

    React.useImperativeHandle(ref, () => ({
        highlightMarker: (index) => {
            console.log('highlight')
            if (businessMarkers) {
                console.log('bsuinessMarkers is true')
                if (prevBusinessMarker) {
                    prevBusinessMarker.setIcon({
                        url: '/static/img/business-marker.png',
                        scaledSize: {
                            width: 40,
                            height: 40
                        }
                    });
                }
                setPrevBusinessMarker(businessMarkers[index]);
                businessMarkers[index].setIcon({
                    url: '/static/img/business-marker-outline.png',
                    scaledSize: {
                        width: 40,
                        height: 40
                    }
                });
                savedCallback.current(businessMarkers[index], false);
            }
        }
    }));

    function markerCallback(marker, isUser = false) {
        if (isUser) {
            console.log(marker.title)
            setUserMarker({ index: marker.index, name: marker.title });

        } else {
            setBusinessMarker({ index: marker.index, name: marker.title });
        }
    }
    React.useEffect(() => {
        console.log('here')
        if (userMarker && businessMarker && distanceResponse) {
            console.log('true1')
            setDuration(findDistance(userMarker.index, businessMarker.index).durationMinutes);
            setDistance(findDistance(userMarker.index, businessMarker.index).distanceMiles);
        }
        savedCallback.current = markerCallback;
    }, [userMarker, businessMarker, distanceResponse])


    React.useEffect(() => {
        $.get('/get-distances.json', (res) => {
            console.log('get distances')
            if (res.msg == 'success') {
                setDistanceResponse(res.distance_matrix);
                console.log('success')
            } else {
                console.log('fail')
            }
        })

        // create googlemaps map
        const googleMap = new google.maps.Map(
            document.getElementById("google-map-quiz"));


        // create empty lat/lng bounds for the map
        const bounds = new google.maps.LatLngBounds();

        // create marker for each business
        const businessMarkers = [];
        for (const [index, business] of businesses.entries()) {
            businessMarkers.push(new google.maps.Marker({
                index: index,
                position: { lat: business.lat, lng: business.lng },
                title: business.name,
                map: googleMap,
                image_url: business.image_url,
                url: business.url,
                totalScore: business.total_score,
                icon: {
                    url: '/static/img/business-marker.png',
                    scaledSize: {
                        width: 40,
                        height: 40
                    }
                }
            }));
            bounds.extend({ lat: business.lat, lng: business.lng });
        }

        setBusinessMarkers(businessMarkers);

        const firstBusiness = businessMarkers[0];
        savedCallback.current(firstBusiness, false);
        setPrevBusinessMarker(firstBusiness);
        firstBusiness.setIcon({
            url: '/static/img/business-marker-outline.png',
            scaledSize: {
                width: 40,
                height: 40
            }
        });

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
                        url: '/static/img/user-marker.png',
                        scaledSize: {
                            width: 40,
                            height: 40
                        }
                    },
                    me: user.me
                }));
            }
        }

        setUserMarkers(userMarkers);

        let prevUserMarker = false;
        // create infoWindow for each user with info about the user
        for (const marker of userMarkers) {
            bounds.extend(marker.position);

            const markerInfo = (`
                <h6 className='user-name'>${marker.title}</h6>
            `);

            const infoWindow = new google.maps.InfoWindow({
                content: markerInfo,
                maxWidth: 400
            });

            marker.addListener('mouseover', () => {
                infoWindow.open(googleMap, marker);
            });

            marker.addListener('mouseout', () => {
                infoWindow.close(googleMap, marker);
            });

            marker.addListener('click', () => {
                savedCallback.current(marker, true);
                if (prevUserMarker) {
                    prevUserMarker.setIcon({
                        url: '/static/img/user-marker.png',
                        scaledSize: {
                            width: 40,
                            height: 40
                        }
                    });
                }
                prevUserMarker = marker;
                marker.setIcon({
                    url: '/static/img/user-marker-mansae.png',
                    scaledSize: {
                        width: 40,
                        height: 40
                    }
                });
            });
            if (marker.me) {
                google.maps.event.trigger(marker, 'click');
            }
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
            {duration && <div id="distance">It will take {userMarker.name} {Number((duration).toFixed(0))} minutes ({Number((distance).toFixed(1))} miles) to drive to {businessMarker.name}.</div>}
            <div id="google-map-quiz" className="google-map" />
        </React.Fragment>
    )
});

