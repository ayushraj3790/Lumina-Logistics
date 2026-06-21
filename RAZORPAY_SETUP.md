# Razorpay Setup — Real Payments for Lumina Logistics

Lumina uses **Razorpay** for real UPI, card, netbanking, and wallet payments. COD stays separate (no gateway).

## 1. Create Razorpay account

1. Go to https://dashboard.razorpay.com/signup
2. Complete signup (use **Test Mode** for college projects — no real money)

## 2. Get API keys

1. Dashboard → **Account & Settings** → **API Keys**
2. Generate **Test** keys
3. Copy:
   - **Key ID** → `rzp_test_...`
   - **Key Secret** → keep private (server only)

## 3. Configure environment

**server/.env**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
```

**client/.env** (optional — server also sends keyId in API response)
```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
```

Restart both server and client after editing `.env`.

## 4. Install Razorpay package

```bash
cd server
npm install
```

## 5. Test a payment

1. Login as `customer@lumina.com` / `customer123`
2. **Book Shipment** → choose **UPI** or **Card**
3. Razorpay checkout opens
4. Use Razorpay test card:
   - Card: `4111 1111 1111 1111`
   - Expiry: any future date
   - CVV: any 3 digits
5. Or use test UPI flow in test mode

Docs: https://razorpay.com/docs/payments/payments/test-card-upi-details/

## Payment flow (for interviews)

```
Customer books shipment
    → POST /api/payments/create-order (server creates Razorpay order + pending Payment)
    → Razorpay checkout modal (frontend)
    → User pays
    → POST /api/payments/verify (server verifies HMAC signature)
    → Shipment marked paid, Payment completed
```

COD flow: `POST /api/payments/cod` — no Razorpay.

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments/config` | Check if Razorpay enabled |
| POST | `/api/payments/create-order` | Create order `{ shipmentId, method: 'upi'|'card' }` |
| POST | `/api/payments/verify` | Verify after checkout |
| POST | `/api/payments/cod` | Cash on delivery |
| GET | `/api/payments/history` | Payment history |

## Production

1. Complete Razorpay KYC
2. Switch to **Live** keys in production `.env`
3. Set `CLIENT_URL` to your Vercel domain on Render

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Online payments not configured" | Add both Razorpay env vars to `server/.env` |
| UPI/Card buttons disabled | Same — restart server after adding keys |
| Invalid signature | Key secret mismatch — use correct test secret |
| Payment cancelled | Shipment still created — use **Pay Now** on Payments page |
