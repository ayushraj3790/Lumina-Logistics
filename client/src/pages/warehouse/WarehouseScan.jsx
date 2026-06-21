import { useState } from 'react';
import toast from 'react-hot-toast';
import { warehouseAPI } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';

export default function WarehouseScan() {
  const [trackingId, setTrackingId] = useState('');
  const [result, setResult] = useState(null);

  const scan = async (e) => {
    e.preventDefault();
    try {
      const { data } = await warehouseAPI.scan({ trackingId: trackingId.trim().toUpperCase() });
      setResult(data.shipment);
      toast.success('Package scanned successfully');
    } catch {
      toast.error('Package not found');
      setResult(null);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Scan Package</h1>
      <form onSubmit={scan} className="card space-y-4">
        <input className="input-field font-mono text-lg" placeholder="LUM-XXXXXXXX" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} autoFocus />
        <button className="btn-primary w-full">Scan & Store</button>
      </form>
      {result && (
        <div className="card">
          <p className="font-mono font-bold">{result.trackingId}</p>
          <StatusBadge status={result.status} />
          <p className="text-sm mt-2">Stored in warehouse</p>
        </div>
      )}
    </div>
  );
}
