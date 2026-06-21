import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { shipmentAPI, notificationAPI } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency } from '../../utils/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CustomerDashboard() {
  const [shipments, setShipments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    shipmentAPI.getMy({ limit: 50 }).then((r) => setShipments(r.data.shipments));
    notificationAPI.getAll().then((r) => setNotifications(r.data.notifications.slice(0, 5)));
  }, []);

  const active = shipments.filter((s) => !['delivered', 'cancelled'].includes(s.status));
  const delivered = shipments.filter((s) => s.status === 'delivered');
  const chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({
    day: d,
    count: shipments.filter((_, idx) => idx % 7 === i).length + Math.floor(Math.random() * 2),
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Customer Dashboard</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: FiPackage, label: 'Active', value: active.length, color: 'from-lumina-500 to-lumina-700' },
          { icon: FiCheckCircle, label: 'Delivered', value: delivered.length, color: 'from-green-500 to-emerald-600' },
          { icon: FiTruck, label: 'Total Spent', value: formatCurrency(shipments.reduce((s, x) => s + x.estimatedCost, 0)), color: 'from-accent to-purple-700' },
        ].map((c) => (
          <div key={c.label} className={`card bg-gradient-to-br ${c.color} text-white border-0`}>
            <c.icon className="text-2xl mb-2 opacity-80" />
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-white/80 text-sm">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between mb-4">
            <h2 className="font-bold">Recent Shipments</h2>
            <Link to="/dashboard/customer/book" className="text-lumina-600 text-sm">+ Book New</Link>
          </div>
          <div className="space-y-3">
            {shipments.slice(0, 5).map((s) => (
              <Link key={s._id} to={`/track/${s.trackingId}`} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <span className="font-mono text-sm">{s.trackingId}</span>
                <StatusBadge status={s.status} />
              </Link>
            ))}
            {!shipments.length && <p className="text-slate-500 text-sm">No shipments yet. Book your first!</p>}
          </div>
        </div>
        <div className="card h-64">
          <h2 className="font-bold mb-4">Shipment Activity</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" /><YAxis /><Tooltip />
              <Bar dataKey="count" fill="#1a82f5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold mb-4">Notifications</h2>
        {notifications.map((n) => (
          <div key={n._id} className="py-2 border-b dark:border-slate-700 last:border-0">
            <p className="font-medium text-sm">{n.title}</p>
            <p className="text-slate-500 text-xs">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
