function GoogleMap(props) {
    const businesses = props.businesses;

    React.useEffect(() => {

        const sfBayCoords = {
            lat: 37.601773,
            lng: -122.202870
          };

        const googleMap = new google.maps.Map(
            document.getElementById("google-map"),
            {
                center: sfBayCoords,
                zoom: 11
            })
        // const bounds = new google.maps.LatLngBounds();


        const markers = [];

        for (const business of businesses) {
            markers.push(new google.maps.Marker({
                position: {lat: business.lat, lng: business.lng },
                map: googleMap,
                icon: {  // custom icon
                    url: '/static/img/marker.svg',
                    scaledSize: {
                      width: 30,
                      height: 30
                    }
                }
            }));
        }

        // for (const marker of markers) {
        // //     bounds.extend(marker.position);
        // }

        // googleMap.fitBounds(bounds);
        // googleMap.panToBounds(bounds);
    }, []);

   return (
       <div id="google-map" style={{ width: '800px', height: '600px' }} />
   )
}

