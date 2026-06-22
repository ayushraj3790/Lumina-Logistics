import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { driverAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency } from '../../utils/format';

export default function DriverDashboard() {
  const [stats, setStats] = useState({});
  const [deliveries, setDeliveries] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // Only fetch data if driver is approved
    if (user?.driverStatus === 'approved') {
      driverAPI.getStats().then((r) => setStats(r.data.stats));
      driverAPI.getDeliveries().then((r) => setDeliveries(r.data.shipments.slice(0, 5)));
    }
  }, [user]);

  // Show approval status message if not approved
  if (!user || user.driverStatus !== 'approved') {
    const statusMessages = {
      pending: 'Your driver application is pending approval from the admin.',
      under_review: 'Your driver application is under review.',
      rejected: `Your driver application was rejected. Reason: ${user.driverRejectionReason || 'Not specified'}`,
      suspended: 'Your driver account has been suspended. Please contact support.',
    };

    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
    };

    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <div className="card">
          <div className="text-center py-12">
            <div className={`inline-block px-4 py-2 rounded-full text-lg font-medium mb-4 ${statusColors[user.driverStatus] || 'bg-gray-100 text-gray-800'}`}>
              Status: {user.driverStatus?.replace('_', ' ') || 'Unknown'}
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              {statusMessages[user.driverStatus] || 'Your account status is unknown.'}
            </p>
            {user.driverStatus === 'rejected' && (
              <Link to="/register/driver" className="btn-primary">
                Submit New Application
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

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
