import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { paymentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { formatCurrency, formatDate } from '../../utils/format';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [payingId, setPayingId] = useState(null);

  const load = () => {
    paymentAPI.getHistory().then((r) => {
      setPayments(r.data.payments);
      setRazorpayEnabled(r.data.razorpayEnabled);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handlePayNow = async (payment) => {
    const shipment = payment.shipment;
    if (!shipment?._id) return;
    setPayingId(payment._id);
    try {
      const method = payment.method === 'card' ? 'card' : 'upi';
      const { data: orderData } = await paymentAPI.createOrder({
        shipmentId: shipment._id,
        method,
      });

      await openRazorpayCheckout({
        keyId: orderData.keyId,
        order: orderData.order,
        user,
        trackingId: shipment.trackingId,
        onSuccess: async (response) => {
          await paymentAPI.verify({
            paymentId: orderData.paymentId,
            method,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          toast.success('Payment completed!');
          load();
        },
      });
    } catch (err) {
      if (err.message !== 'Payment cancelled') {
        toast.error(err.response?.data?.message || err.message || 'Payment failed');
      }
    } finally {
      setPayingId(null);
    }
  };

  const statusColor = (status) => {
    if (status === 'completed') return 'text-green-600';
    if (status === 'failed') return 'text-red-600';
    return 'text-amber-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payment History</h1>
        {razorpayEnabled && (
          <p className="text-sm text-slate-500 mt-1">Online payments powered by Razorpay (UPI, Card, Netbanking)</p>
        )}
      </div>

      <div className="grid gap-4">
        {payments.map((p) => {
          const needsPay =
            p.status === 'pending' &&
            ['upi', 'card'].includes(p.method) &&
            p.shipment?.paymentStatus !== 'paid' &&
            razorpayEnabled;

          return (
            <div key={p._id} className="card flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="font-mono text-sm">{p.invoiceNumber}</p>
                <p className="text-slate-500 text-sm">
                  {p.shipment?.trackingId} — {formatDate(p.createdAt)}
                </p>
                {p.razorpay?.paymentId && (
                  <p className="text-xs text-slate-400 mt-1">Txn: {p.razorpay.paymentId}</p>
                )}
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <p className="font-bold">{formatCurrency(p.amount)}</p>
                <p className={`text-xs capitalize ${statusColor(p.status)}`}>
                  {p.method} • {p.status}
                </p>
                {needsPay && (
                  <button
                    onClick={() => handlePayNow(p)}
                    disabled={payingId === p._id}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    {payingId === p._id ? 'Opening...' : 'Pay Now'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {!payments.length && <p className="text-slate-500">No payments yet</p>}
      </div>
    </div>
  );
}
