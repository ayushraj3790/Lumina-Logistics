# Lumina Logistics — Deployment Guide

## Quick Checklist

- [ ] MongoDB Atlas cluster ready
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set on both platforms
- [ ] CORS `CLIENT_URL` matches Vercel domain
- [ ] Seed script run against production DB (optional)

## MongoDB Atlas

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create **M0 Free** cluster
3. Database Access → Add user with password
4. Network Access → Add IP `0.0.0.0/0` (allow from anywhere for cloud hosts)
5. Connect → Drivers → Copy connection string:
   ```
   mongodb+srv://USER:PASS@cluster.xxxxx.mongodb.net/lumina-logistics?retryWrites=true&w=majority
   ```

## Render (Backend)

1. Go to https://render.com → New → **Web Service**
2. Connect GitHub repo (or deploy from folder)
3. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance**: Free
4. Environment Variables (copy from `server/.env.example`):

| Key | Value |
|-----|-------|
| NODE_ENV | production |
| PORT | 5000 (Render sets automatically) |
| MONGO_URI | your Atlas URI |
| JWT_SECRET | long random string |
| CLIENT_URL | https://your-app.vercel.app |
| OPENAI_API_KEY | optional |

5. Deploy → note URL: `https://lumina-api.onrender.com`

6. Run seed (one-time) via Render shell or locally pointing to prod URI:
   ```bash
   MONGO_URI="your-prod-uri" npm run seed
   ```

## Vercel (Frontend)

1. https://vercel.com → Add New Project
2. Import repo, set **Root Directory** to `client`
3. Framework: Vite (auto-detected)
4. Environment Variables:

| Key | Value |
|-----|-------|
| VITE_API_URL | https://lumina-api.onrender.com/api |
| VITE_SOCKET_URL | https://lumina-api.onrender.com |

5. Deploy

## Post-Deploy Verification

- `GET https://your-api.onrender.com/api/health` → should return success
- Login with `customer@lumina.com` / `customer123` (after seed)
- Track page works without login
- Socket connects (check browser Network → WS)

## Common Issues

| Issue | Fix |
|-------|-----|
| CORS error | Set `CLIENT_URL` on Render exactly to Vercel URL (no trailing slash) |
| 401 on API | Check `VITE_API_URL` ends with `/api` |
| Mongo timeout | Whitelist `0.0.0.0/0` on Atlas |
| Cold start slow | Free Render spins down — first request may take 30s |
| Cookies not sent | Use Bearer token (already in localStorage) |

## Optional: Custom Domain

- Vercel: Project Settings → Domains
- Render: Settings → Custom Domain
- Update `CLIENT_URL` and Vercel env vars accordingly
