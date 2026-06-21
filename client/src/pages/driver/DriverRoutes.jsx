import { useEffect, useState } from 'react';
import { driverAPI, shipmentAPI } from '../../services/api';

export default function DriverRoutes() {
  const [shipments, setShipments] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    driverAPI.getDeliveries().then((r) => {
      setShipments(r.data.shipments);
      if (r.data.shipments[0]) {
        shipmentAPI.getRoutes(r.data.shipments[0]._id).then((res) => setRoutes(res.data.routes));
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI Route Suggestions</h1>
      <p className="text-slate-500">Optimized routes for your active deliveries</p>
      <div className="grid md:grid-cols-3 gap-4">
        {routes.map((r) => (
          <div key={r.type} className="card border-l-4 border-lumina-500">
            <p className="text-xs uppercase text-lumina-600">{r.type}</p>
            <h3 className="font-bold text-lg">{r.name}</h3>
            <p className="text-2xl font-bold mt-2">{r.distance} km</p>
            <p className="text-slate-500">{r.duration} min est.</p>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="font-bold mb-4">Delivery Stops ({shipments.length})</h2>
        <ol className="list-decimal list-inside space-y-2">
          {shipments.map((s) => (
            <li key={s._id}>{s.trackingId} — {s.receiver?.location?.city}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
