import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { driverAPI } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency } from '../../utils/format';

export default function DriverDashboard() {
  const [stats, setStats] = useState({});
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    driverAPI.getStats().then((r) => setStats(r.data.stats));
    driverAPI.getDeliveries().then((r) => setDeliveries(r.data.shipments.slice(0, 5)));
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Driver Dashboard</h1>
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: 'Completed', value: stats.completed },
          { label: 'Rating', value: `${stats.rating || 5} ★` },
          { label: 'Earnings', value: formatCurrency(stats.earnings) },
          { label: 'Delayed', value: stats.delayed },
        ].map((c) => (
          <div key={c.label} className="card text-center">
            <p className="text-2xl font-bold text-lumina-600">{c.value ?? '—'}</p>
            <p className="text-sm text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold">Active Deliveries</h2>
          <Link to="/dashboard/driver/deliveries" className="text-lumina-600 text-sm">View all</Link>
        </div>
        {deliveries.map((s) => (
          <div key={s._id} className="flex justify-between py-3 border-b dark:border-slate-700 last:border-0">
            <span className="font-mono">{s.trackingId}</span>
            <StatusBadge status={s.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
