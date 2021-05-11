// https://engineering.universe.com/building-a-google-map-in-react-b103b4ee97f1
// https://stackoverflow.com/questions/15719951/auto-center-map-with-multiple-markers-in-google-maps-api-v3

function GoogleMap(props) {
    const businesses = props.businesses;

    React.useEffect(() => {

        const googleMap = new google.maps.Map(
            document.getElementById("google-map"));

        const bounds = new google.maps.LatLngBounds();


        const businessMarkers = [];
        for (const [index, business] of businesses.entries()) {
            let number = index + 1
            businessMarkers.push(new google.maps.Marker({
                position: {lat: business.lat, lng: business.lng },
                title: business.name,
                map: googleMap,
                image_url: business.image_url,
                url: business.url,
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

        for (const marker of businessMarkers) {

            bounds.extend(marker.position);

            const markerInfo = (`
                <h1><a className='business-name' href=${marker.url} target="_blank">${marker.title}</a></h1>
                <img src=${marker.image_url} width="300" height="300" />
                <p>
                Located at: <code>${marker.position.lat()}</code>,
                <code>${marker.position.lng()}</code>
                </p>
            `);
        
            const infoWindow = new google.maps.InfoWindow({
                content: markerInfo,
                maxWidth: 400
            });
        
            marker.addListener('click', () => {
                infoWindow.open(googleMap, marker);
            });
            }


        googleMap.fitBounds(bounds);
        googleMap.panToBounds(bounds);
    });

   return (
       <div id="google-map" style={{ width: '800px', height: '600px' }} />
   )
}

