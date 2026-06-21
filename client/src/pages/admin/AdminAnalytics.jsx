import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#1a82f5', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'];

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminAPI.getStats().then((r) => setStats(r.data.stats));
  }, []);

  if (!stats) return null;

  const pieData = [
    { name: 'Delivered', value: stats.delivered },
    { name: 'Active', value: stats.activeShipments },
    { name: 'Delayed', value: stats.delayed },
  ];

  const exportReport = () => {
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'lumina-analytics.json';
    a.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <button onClick={exportReport} className="btn-secondary text-sm">Export Report</button>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card h-80">
          <h2 className="font-bold mb-4">Shipment Distribution</h2>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend /><Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card h-80">
          <h2 className="font-bold mb-4">Daily Deliveries</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={stats.chartData?.map((d) => ({ date: d._id, count: d.count }))}>
              <XAxis dataKey="date" /><YAxis /><Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card"><p className="text-slate-500">Deliveries Today</p><p className="text-3xl font-bold">{stats.deliveriesToday}</p></div>
        <div className="card"><p className="text-slate-500">Delay Rate</p><p className="text-3xl font-bold text-amber-500">{stats.delayRate}%</p></div>
      </div>
    </div>
  );
}
