import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { warehouseAPI } from '../../services/api';

export default function WarehouseDashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    warehouseAPI.getStats().then((r) => setData(r.data));
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Warehouse: {data.warehouse?.name}</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card"><p className="text-3xl font-bold text-lumina-600">{data.stats?.inWarehouse ?? 0}</p><p className="text-sm text-slate-500">In Storage</p></div>
        <div className="card"><p className="text-3xl font-bold">{data.stats?.incoming ?? 0}</p><p className="text-sm text-slate-500">Incoming</p></div>
        <div className="card"><p className="text-3xl font-bold">{data.stats?.current}/{data.stats?.capacity}</p><p className="text-sm text-slate-500">Capacity Used</p></div>
      </div>
      <Link to="/dashboard/warehouse/scan" className="btn-primary inline-block">Scan Incoming Package</Link>
    </div>
  );
}
