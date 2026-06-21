import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { shipmentAPI, paymentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { PACKAGE_TYPES, DELIVERY_SPEEDS } from '../../utils/constants';
import { formatCurrency } from '../../utils/format';

const emptyLocation = { address: '', city: '', state: '', pincode: '' };

export default function BookShipment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [paying, setPaying] = useState(false);
  const [form, setForm] = useState({
    sender: { name: '', phone: '', email: '', location: { ...emptyLocation } },
    receiver: { name: '', phone: '', email: '', location: { ...emptyLocation } },
    package: { type: 'parcel', weight: 1, dimensions: { length: 20, width: 15, height: 10 }, description: '' },
    deliverySpeed: 'standard',
  });

  useEffect(() => {
    paymentAPI.getConfig().then((r) => setRazorpayEnabled(r.data.razorpayEnabled));
  }, []);

  const estimatedCost = 40 + form.package.weight * 15 + 50 * 2 * (form.deliverySpeed === 'express' ? 1.5 : form.deliverySpeed === 'same-day' ? 2.2 : 1);

  const payOnline = async (shipment) => {
    const { data: orderData } = await paymentAPI.createOrder({
      shipmentId: shipment._id,
      method: paymentMethod,
    });

    await openRazorpayCheckout({
      keyId: orderData.keyId,
      order: orderData.order,
      user,
      trackingId: shipment.trackingId,
      onSuccess: async (response) => {
        await paymentAPI.verify({
          paymentId: orderData.paymentId,
          method: paymentMethod,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
        toast.success('Payment successful!');
      },
    });
  };

  const handleBook = async () => {
    setPaying(true);
    let createdShipment = null;
    try {
      const { data } = await shipmentAPI.create(form);
      createdShipment = data.shipment;

      if (paymentMethod === 'cod') {
        await paymentAPI.cod({ shipmentId: createdShipment._id });
        toast.success(`Booked! Pay on delivery. Tracking: ${createdShipment.trackingId}`);
        navigate(`/track/${createdShipment.trackingId}`);
        return;
      }

      if (!razorpayEnabled) {
        toast.error('Online payment not configured on server. Use COD or add Razorpay keys.');
        return;
      }

      toast.loading('Opening secure checkout...', { id: 'pay' });
      await payOnline(createdShipment);
      toast.dismiss('pay');
      toast.success(`Paid & booked! Tracking: ${createdShipment.trackingId}`);
      navigate(`/track/${createdShipment.trackingId}`);
    } catch (err) {
      toast.dismiss('pay');
      if (err.message === 'Payment cancelled' && createdShipment) {
        toast.error('Payment cancelled. Shipment saved — complete payment from Payments page.');
        navigate(`/track/${createdShipment.trackingId}`);
      } else {
        toast.error(err.response?.data?.message || err.message || 'Booking failed');
      }
    } finally {
      setPaying(false);
    }
  };

  const update = (section, field, value) => {
    setForm((f) => ({ ...f, [section]: { ...f[section], [field]: value } }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Book Shipment</h1>
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? 'bg-lumina-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="card space-y-4">
          <h2 className="font-semibold">Sender Details</h2>
          <input className="input-field" placeholder="Name" value={form.sender.name} onChange={(e) => update('sender', 'name', e.target.value)} />
          <input className="input-field" placeholder="Phone" value={form.sender.phone} onChange={(e) => update('sender', 'phone', e.target.value)} />
          <input className="input-field" placeholder="Pickup Address" value={form.sender.location.address} onChange={(e) => setForm((f) => ({ ...f, sender: { ...f.sender, location: { ...f.sender.location, address: e.target.value } } }))} />
          <input className="input-field" placeholder="City" value={form.sender.location.city} onChange={(e) => setForm((f) => ({ ...f, sender: { ...f.sender, location: { ...f.sender.location, city: e.target.value } } }))} />
          <button onClick={() => setStep(2)} className="btn-primary w-full">Next: Receiver</button>
        </div>
      )}

      {step === 2 && (
        <div className="card space-y-4">
          <h2 className="font-semibold">Receiver & Package</h2>
          <input className="input-field" placeholder="Receiver Name" value={form.receiver.name} onChange={(e) => update('receiver', 'name', e.target.value)} />
          <input className="input-field" placeholder="Delivery Address" value={form.receiver.location.address} onChange={(e) => setForm((f) => ({ ...f, receiver: { ...f.receiver, location: { ...f.receiver.location, address: e.target.value } } }))} />
          <select className="input-field" value={form.package.type} onChange={(e) => setForm((f) => ({ ...f, package: { ...f.package, type: e.target.value } }))}>
            {PACKAGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input className="input-field" type="number" placeholder="Weight (kg)" value={form.package.weight} onChange={(e) => setForm((f) => ({ ...f, package: { ...f.package, weight: +e.target.value } }))} />
          <select className="input-field" value={form.deliverySpeed} onChange={(e) => setForm((f) => ({ ...f, deliverySpeed: e.target.value }))}>
            {DELIVERY_SPEEDS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1">Next: Payment</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card space-y-4">
          <p className="text-2xl font-bold text-lumina-600">Estimated: {formatCurrency(estimatedCost)}</p>

          <div className="grid grid-cols-3 gap-2">
            {['cod', 'upi', 'card'].map((m) => (
              <button
                key={m}
                type="button"
                disabled={m !== 'cod' && !razorpayEnabled}
                onClick={() => setPaymentMethod(m)}
                className={`p-4 rounded-xl border-2 capitalize ${
                  paymentMethod === m ? 'border-lumina-500 bg-lumina-50 dark:bg-lumina-950' : 'border-slate-200 dark:border-slate-700'
                } ${m !== 'cod' && !razorpayEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {m === 'cod' ? 'COD' : m}
              </button>
            ))}
          </div>

          {paymentMethod === 'cod' && (
            <p className="text-sm text-slate-500">Pay the delivery agent in cash when your package arrives.</p>
          )}
          {(paymentMethod === 'upi' || paymentMethod === 'card') && razorpayEnabled && (
            <p className="text-sm text-slate-500">
              Secure payment via <strong>Razorpay</strong> — supports UPI, cards, netbanking & wallets (test mode in dev).
            </p>
          )}
          {!razorpayEnabled && paymentMethod !== 'cod' && (
            <p className="text-sm text-amber-600">Add Razorpay keys to server .env to enable online payments.</p>
          )}

          <button onClick={handleBook} className="btn-primary w-full" disabled={paying}>
            {paying ? 'Processing...' : paymentMethod === 'cod' ? 'Confirm & Book (COD)' : `Pay ${formatCurrency(estimatedCost)} & Book`}
          </button>
        </div>
      )}
    </div>
  );
}
