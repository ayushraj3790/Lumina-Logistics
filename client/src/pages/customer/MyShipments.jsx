import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shipmentAPI } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/format';

export default function MyShipments() {
  const [shipments, setShipments] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    shipmentAPI.getMy({ status: filter || undefined }).then((r) => setShipments(r.data.shipments));
  }, [filter]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Shipments</h1>
      <select className="input-field max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="in_transit">In Transit</option>
        <option value="delivered">Delivered</option>
      </select>
      <div className="grid gap-4">
        {shipments.map((s) => (
          <div key={s._id} className="card flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="font-mono font-bold">{s.trackingId}</p>
              <p className="text-sm text-slate-500">{s.receiver?.name} — {formatDate(s.createdAt)}</p>
            </div>
            <StatusBadge status={s.status} />
            <p className="font-semibold">{formatCurrency(s.estimatedCost)}</p>
            <Link to={`/track/${s.trackingId}`} className="text-lumina-600 text-sm">Track →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
