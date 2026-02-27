mapboxgl.accessToken = mapBoxToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: spot.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

var marker = new mapboxgl.Marker()  
    .setLngLat(spot.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${spot.title}</h3><p>${spot.location}</p>`
            )
    )
    .addTo(map);
        