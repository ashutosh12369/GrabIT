import React from 'react'
import scooter from "../assets/scooter.png"
import home from "../assets/home.png"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
const deliveryBoyIcon = new L.Icon({
    iconUrl: scooter,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
})
const customerIcon = new L.Icon({
    iconUrl: home,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
})
function DeliveryBoyTracking({ data }) {

    const deliveryBoyLat = data.deliveryBoyLocation.lat
    const deliveryBoylon = data.deliveryBoyLocation.lon
    const customerLat = data.customerLocation.lat
    const customerlon = data.customerLocation.lon

    const [path, setPath] = React.useState([
        [deliveryBoyLat, deliveryBoylon],
        [customerLat, customerlon]
    ])

    React.useEffect(() => {
        const fetchRoute = async () => {
            try {
                // OSRM requires coords in lon,lat format
                const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${deliveryBoylon},${deliveryBoyLat};${customerlon},${customerLat}?overview=full&geometries=geojson`);
                const data = await res.json();
                
                if (data.routes && data.routes[0]) {
                    // OSRM returns GeoJSON coordinates as [lon, lat], Leaflet expects [lat, lon]
                    const routeCoordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    setPath(routeCoordinates);
                }
            } catch (error) {
                console.log("Error fetching OSRM route", error);
            }
        };

        if (deliveryBoyLat && deliveryBoylon && customerLat && customerlon) {
            fetchRoute();
        }
    }, [deliveryBoyLat, deliveryBoylon, customerLat, customerlon]);

    const center = [deliveryBoyLat, deliveryBoylon]

    return (
        <div className='w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md'>
            <MapContainer
                className={"w-full h-full"}
                center={center}
                zoom={16}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
             <Marker position={[deliveryBoyLat,deliveryBoylon]} icon={deliveryBoyIcon}>
             <Popup>Delivery Boy</Popup>
             </Marker>
              <Marker position={[customerLat,customerlon]} icon={customerIcon}>
             <Popup>Customer</Popup>
             </Marker>


<Polyline positions={path} color='blue' weight={4}/>

            </MapContainer>
        </div>
    )
}

export default DeliveryBoyTracking
