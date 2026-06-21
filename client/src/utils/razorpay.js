/**
 * Load Razorpay checkout script and open payment modal
 */
export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * @param {Object} params
 * @param {string} params.keyId - Razorpay key_id
 * @param {Object} params.order - { id, amount, currency }
 * @param {Object} params.user - { name, email, phone }
 * @param {string} params.trackingId - shown in description
 * @param {Function} params.onSuccess - async (razorpayResponse) => void
 * @param {Function} params.onDismiss - optional
 */
export const openRazorpayCheckout = async ({ keyId, order, user, trackingId, onSuccess, onDismiss }) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) throw new Error('Could not load Razorpay. Check your internet connection.');

  const key = keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!key) throw new Error('Razorpay key not configured');

  return new Promise((resolve, reject) => {
    const options = {
      key,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'Lumina Logistics',
      description: `Shipment ${trackingId || ''}`.trim(),
      order_id: order.id,
      handler: async (response) => {
        try {
          await onSuccess(response);
          resolve(response);
        } catch (err) {
          reject(err);
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      theme: { color: '#1a82f5' },
      modal: {
        ondismiss: () => {
          onDismiss?.();
          reject(new Error('Payment cancelled'));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (res) => {
      reject(new Error(res.error?.description || 'Payment failed'));
    });
    rzp.open();
  });
};
