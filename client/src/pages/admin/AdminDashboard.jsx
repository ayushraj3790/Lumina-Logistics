import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminAPI.getStats().then((r) => setStats(r.data.stats));
  }, []);

  if (!stats) return <div>Loading...</div>;

  const chartData = stats.chartData?.map((d) => ({ date: d._id, deliveries: d.count })) || [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers },
          { label: 'Active Shipments', value: stats.activeShipments },
          { label: 'Revenue', value: formatCurrency(stats.revenue) },
          { label: 'Success Rate', value: `${stats.successRate}%` },
        ].map((c) => (
          <div key={c.label} className="card">
            <p className="text-3xl font-bold text-lumina-600">{c.value}</p>
            <p className="text-slate-500 text-sm">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card h-72">
          <h2 className="font-bold mb-4">Deliveries (7 days)</h2>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={chartData}>
              <XAxis dataKey="date" /><YAxis /><Tooltip />
              <Area type="monotone" dataKey="deliveries" stroke="#1a82f5" fill="#1a82f533" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="font-bold mb-4">AI Insights</h2>
          <div className="space-y-3">
            {stats.insights?.map((ins, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-sm">{ins.text}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/dashboard/admin/shipments" className="card hover:ring-2 ring-lumina-500 transition">Manage Shipments →</Link>
        <Link to="/dashboard/admin/users" className="card hover:ring-2 ring-lumina-500 transition">Manage Users →</Link>
        <Link to="/dashboard/admin/analytics" className="card hover:ring-2 ring-lumina-500 transition">Full Analytics →</Link>
      </div>

      {stats.delayed > 0 && (
        <div className="card border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20">
          <p className="font-bold text-red-600">⚠ {stats.delayed} delayed shipments need attention</p>
        </div>
      )}
    </div>
  );
}
