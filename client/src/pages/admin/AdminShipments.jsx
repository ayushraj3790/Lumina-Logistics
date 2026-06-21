import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { shipmentAPI, driverAPI } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';

export default function AdminShipments() {
  const [shipments, setShipments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');

  const load = () => {
    shipmentAPI.getAll({ search: search || undefined }).then((r) => setShipments(r.data.shipments));
    driverAPI.getAvailable().then((r) => setDrivers(r.data.drivers));
  };

  useEffect(() => { load(); }, []);

  const assign = async (shipmentId, driverId) => {
    await shipmentAPI.assignDriver(shipmentId, driverId);
    toast.success('Driver assigned');
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Shipments</h1>
      <div className="flex gap-2">
        <input className="input-field max-w-sm" placeholder="Search tracking ID" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button onClick={load} className="btn-primary">Search</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full card text-sm">
          <thead>
            <tr className="text-left border-b dark:border-slate-700">
              <th className="p-3">Tracking</th><th>Customer</th><th>Status</th><th>Driver</th><th>Assign</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s._id} className="border-b dark:border-slate-800">
                <td className="p-3 font-mono">{s.trackingId}</td>
                <td>{s.customer?.name}</td>
                <td><StatusBadge status={s.status} /></td>
                <td>{s.driver?.name || '—'}</td>
                <td>
                  <select className="input-field py-1 text-xs" onChange={(e) => e.target.value && assign(s._id, e.target.value)} defaultValue="">
                    <option value="">Assign driver</option>
                    {drivers.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
