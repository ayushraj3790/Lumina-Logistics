import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { driverAPI, shipmentAPI } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import ShipmentMap from '../../components/map/ShipmentMap';

const NEXT_STATUS = {
  picked_up: 'in_transit',
  in_transit: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

export default function DriverDeliveries() {
  const [shipments, setShipments] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = () => driverAPI.getDeliveries().then((r) => setShipments(r.data.shipments));

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await shipmentAPI.updateStatus(id, { status, location: { address: 'Driver update', lat: 19.1, lng: 72.9 } });
      toast.success('Status updated');
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const shareLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        driverAPI.updateLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success('Location shared');
      },
      () => toast.error('Enable location access')
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Deliveries</h1>
        <button onClick={shareLocation} className="btn-primary text-sm">Share Live Location</button>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {shipments.map((s) => (
            <div key={s._id} className={`card cursor-pointer ${selected?._id === s._id ? 'ring-2 ring-lumina-500' : ''}`} onClick={() => setSelected(s)}>
              <div className="flex justify-between">
                <span className="font-mono font-bold">{s.trackingId}</span>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-sm mt-2">{s.receiver?.location?.address}</p>
              {NEXT_STATUS[s.status] && (
                <button
                  onClick={(e) => { e.stopPropagation(); updateStatus(s._id, NEXT_STATUS[s.status]); }}
                  className="mt-3 text-sm text-lumina-600 font-medium"
                >
                  Mark as {NEXT_STATUS[s.status].replace(/_/g, ' ')}
                </button>
              )}
            </div>
          ))}
        </div>
        {selected && (
          <div className="space-y-4">
            <ShipmentMap pickup={selected.sender?.location} drop={selected.receiver?.location} current={selected.currentLocation} height="400px" />
            <input className="input-field" placeholder="Delivery proof URL (optional)" id="proof" />
            <button
              className="btn-secondary w-full"
              onClick={() => {
                const url = document.getElementById('proof')?.value;
                shipmentAPI.uploadProof(selected._id, { imageUrl: url, signedBy: 'Customer' });
                toast.success('Proof uploaded');
              }}
            >
              Upload Delivery Proof
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
