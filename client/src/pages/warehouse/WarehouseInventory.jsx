import { useEffect, useState } from 'react';
import { warehouseAPI } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';

export default function WarehouseInventory() {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    warehouseAPI.getInventory().then((r) => setShipments(r.data.shipments));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory ({shipments.length})</h1>
      <div className="grid gap-3">
        {shipments.map((s) => (
          <div key={s._id} className="card flex justify-between">
            <div>
              <p className="font-mono font-bold">{s.trackingId}</p>
              <p className="text-sm text-slate-500">{s.customer?.name}</p>
            </div>
            <StatusBadge status={s.status} />
          </div>
        ))}
        {!shipments.length && <p className="text-slate-500">No packages in warehouse</p>}
      </div>
    </div>
  );
}
