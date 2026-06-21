import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { shipmentAPI } from '../services/api';
import StatusBadge from '../components/ui/StatusBadge';
import ShipmentMap from '../components/map/ShipmentMap';
import { STATUS_ORDER } from '../utils/constants';
import { formatDate, formatCurrency } from '../utils/format';
import Navbar from '../components/landing/Navbar';
import { useSocket } from '../context/SocketContext';

export default function TrackPage() {
  const { trackingId: paramId } = useParams();
  const [trackingId, setTrackingId] = useState(paramId || '');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  const shipmentRoomId = useMemo(() => shipment?._id || null, [shipment?._id]);

  const track = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await shipmentAPI.track(id.trim().toUpperCase());
      setShipment(data.shipment);
    } catch {
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramId) track(paramId);
  }, [paramId]);

  // Join a shipment room after we have shipment _id
  useEffect(() => {
    if (!socket || !shipmentRoomId) return;
    socket.emit('join:shipment', shipmentRoomId);
  }, [socket, shipmentRoomId]);

  // Listen for realtime shipment updates + driver live location
  useEffect(() => {
    if (!socket || !shipmentRoomId) return;

    const onShipmentUpdate = (updated) => {
      if (updated?._id !== shipmentRoomId) return;
      setShipment(updated);
    };

    const onDriverLocation = (payload) => {
      if (payload?.shipmentId !== shipmentRoomId) return;
      setShipment((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentLocation: {
            ...(prev.currentLocation || {}),
            lat: payload.lat,
            lng: payload.lng,
            address: prev.currentLocation?.address || 'Live driver location',
          },
        };
      });
    };

    socket.on('shipment:update', onShipmentUpdate);
    socket.on('driver:location', onDriverLocation);

    return () => {
      socket.off('shipment:update', onShipmentUpdate);
      socket.off('driver:location', onDriverLocation);
    };
  }, [socket, shipmentRoomId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-hero-pattern py-8"><Navbar /></div>
      <div className="max-w-4xl mx-auto px-4 py-12 -mt-4">
        <h1 className="text-3xl font-bold text-center mb-8 dark:text-white">Track Your Shipment</h1>
        <div className="flex gap-2 mb-8">
          <input
            className="input-field flex-1"
            placeholder="Enter tracking ID (e.g. LUM-XXXXXXXX)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
          />
          <button onClick={() => track(trackingId)} className="btn-primary" disabled={loading}>
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </div>

        {shipment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="card flex flex-wrap justify-between items-start gap-4">
              <div>
                <p className="text-sm text-slate-500">Tracking ID</p>
                <p className="text-2xl font-mono font-bold">{shipment.trackingId}</p>
                <StatusBadge status={shipment.status} />
                {shipment.isDelayed && <p className="text-red-500 text-sm mt-2">⚠ {shipment.delayReason}</p>}
              </div>
              {shipment.qrCode && (
                <div className="text-center">
                  <QRCodeSVG value={`${window.location.origin}/track/${shipment.trackingId}`} size={100} />
                  <p className="text-xs mt-1 text-slate-500">Scan to track</p>
                </div>
              )}
            </div>

            {shipment.eta && (
              <div className="card bg-lumina-50 dark:bg-lumina-950/30 border-lumina-500">
                <p className="font-semibold">AI Predicted ETA</p>
                <p className="text-lg">{formatDate(shipment.eta.predictedAt)}</p>
                <p className="text-sm text-slate-500">Confidence: {shipment.eta.confidence}% | Traffic: {shipment.eta.factors?.traffic}</p>
              </div>
            )}

            <ShipmentMap
              pickup={shipment.sender?.location}
              drop={shipment.receiver?.location}
              current={shipment.currentLocation}
            />

            <div className="card">
              <h3 className="font-bold mb-4">Timeline</h3>
              <div className="space-y-4">
                {STATUS_ORDER.map((s) => {
                  const events = shipment.timeline?.filter((t) => t.status === s) || [];
                  const done = events.length > 0 || STATUS_ORDER.indexOf(shipment.status) >= STATUS_ORDER.indexOf(s);
                  return (
                    <div key={s} className={`flex gap-4 ${done ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${done ? 'bg-lumina-500' : 'bg-slate-300'}`} />
                      <div>
                        <p className="font-medium capitalize">{s.replace(/_/g, ' ')}</p>
                        {events.map((e, i) => (
                          <p key={i} className="text-sm text-slate-500">{e.message} — {formatDate(e.timestamp)}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-center text-sm">Cost: {formatCurrency(shipment.estimatedCost)}</p>
          </motion.div>
        )}

        {!shipment && !loading && trackingId && (
          <p className="text-center text-slate-500">Shipment not found. Try demo ID from seed script.</p>
        )}
        <p className="text-center mt-8"><Link to="/" className="text-lumina-600">← Back home</Link></p>
      </div>
    </div>
  );
}
