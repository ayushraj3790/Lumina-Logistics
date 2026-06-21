import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icons in Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const pickupIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="background:#1a82f5;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>',
  iconSize: [14, 14],
});
const dropIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="background:#8b5cf6;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>',
  iconSize: [14, 14],
});

export default function ShipmentMap({ pickup, drop, current, height = '320px' }) {
  const pLat = pickup?.lat || 19.076;
  const pLng = pickup?.lng || 72.8777;
  const dLat = drop?.lat || 28.6139;
  const dLng = drop?.lng || 77.209;
  const center = [(pLat + dLat) / 2, (pLng + dLng) / 2];
  const route = [
    [pLat, pLng],
    current?.lat ? [current.lat, current.lng] : [(pLat + dLat) / 2, (pLng + dLng) / 2],
    [dLat, dLng],
  ];

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border dark:border-slate-700">
      <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[pLat, pLng]} icon={pickupIcon}>
          <Popup>Pickup</Popup>
        </Marker>
        {current?.lat && (
          <Marker position={[current.lat, current.lng]}>
            <Popup>Current Location</Popup>
          </Marker>
        )}
        <Marker position={[dLat, dLng]} icon={dropIcon}>
          <Popup>Delivery</Popup>
        </Marker>
        <Polyline positions={route} color="#1a82f5" weight={3} dashArray="8 8" />
      </MapContainer>
    </div>
  );
}
