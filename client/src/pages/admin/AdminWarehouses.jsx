import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminWarehouses() {
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    adminAPI.getWarehouses().then((r) => setWarehouses(r.data.warehouses));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Warehouses</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {warehouses.map((w) => (
          <div key={w._id} className="card">
            <h3 className="font-bold text-lg">{w.name}</h3>
            <p className="text-sm text-slate-500 font-mono">{w.code}</p>
            <p className="mt-2">{w.location?.city}, {w.location?.state}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <span>Capacity: {w.capacity}</span>
              <span>Inventory: {w.currentInventory}</span>
            </div>
            <p className="text-sm mt-2">Manager: {w.manager?.name || 'Unassigned'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
