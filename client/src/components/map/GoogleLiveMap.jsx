import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px',
};

const center = {
  lat: 20.5937,
  lng: 78.9629,
};

export default function GoogleLiveMap({ shipment, driverLocation }) {
  const [directions, setDirections] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (map && shipment?.pickup && shipment?.drop) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: shipment.pickup.lat, lng: shipment.pickup.lng },
          destination: { lat: shipment.drop.lat, lng: shipment.drop.lng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
          }
        }
      );
    }
  }, [map, shipment]);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={driverLocation || center}
        zoom={12}
        onLoad={(map) => setMap(map)}
      >
        {/* Pickup Location */}
        {shipment?.pickup && (
          <Marker
            position={{ lat: shipment.pickup.lat, lng: shipment.pickup.lng }}
            label="P"
            title="Pickup Location"
          />
        )}

        {/* Drop Location */}
        {shipment?.drop && (
          <Marker
            position={{ lat: shipment.drop.lat, lng: shipment.drop.lng }}
            label="D"
            title="Drop Location"
          />
        )}

        {/* Driver Location (Live) */}
        {driverLocation && (
          <Marker
            position={driverLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4F46E5',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWidth: 2,
            }}
            title="Driver Location"
          />
        )}

        {/* Route Directions */}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </LoadScript>
  );
}
