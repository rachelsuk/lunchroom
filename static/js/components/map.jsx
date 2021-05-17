// https://engineering.universe.com/building-a-google-map-in-react-b103b4ee97f1
// https://stackoverflow.com/questions/15719951/auto-center-map-with-multiple-markers-in-google-maps-api-v3

function GoogleMap(props) {
    const businesses = props.businesses;
    const usersLocations = props.usersLocations;

    React.useEffect(() => {

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
                position: {lat: business.lat, lng: business.lng },
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
            }

        // create markers for each user
        const userMarkers = [];
        for (const user of usersLocations) {
            if (user.lat && user.lng) {
                userMarkers.push(new google.maps.Marker({
                    position: {lat: user.lat, lng: user.lng },
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
                infoWindow.open(googleMap, marker);
            });
            }

        // auto center map to fit all business and user markers
        googleMap.fitBounds(bounds);
        googleMap.panToBounds(bounds);
    },[businesses, usersLocations]);

   return (
       <div id="google-map" style={{ width: '800px', height: '600px' }} />
   )
}

