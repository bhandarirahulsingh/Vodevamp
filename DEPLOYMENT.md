# Deployment Guide (Render + Vercel)

This guide deploys:
- `apps/api` (NestJS backend) on **Render**
- `apps/web` (Vite React frontend) on **Vercel**

---

## 1) Prerequisites

1. Push this repo to GitHub.
2. Create a MongoDB Atlas cluster.
3. In Atlas, allow network access (`0.0.0.0/0`) or add Render egress IPs.
4. Prepare environment values:
   - `MONGODB_URI`
   - `JWT_SECRET`

---

## 2) Deploy Backend on Render

The repository includes a Render Blueprint at root: `render.yaml`.

1. In the Render dashboard, select **New** -> **Blueprint** and connect this GitHub repository.
2. Render detects `render.yaml` and creates the `codevamp-api` web service.
3. Enter the requested secret values:
   - `MONGODB_URI`
   - `JUDGE0_API_KEY`
4. Deploy. Render generates `JWT_SECRET` and sets the remaining non-secret API configuration automatically.

After deploy, copy backend URL:
- Example: `https://codevamp-api.onrender.com`

---

## 3) Deploy Frontend on Vercel

Use the root `vercel.json` included in this repo.

1. In Vercel, import the same GitHub repo.
2. During setup, keep **Root Directory = /** (repo root).
3. Add env var:
   - `VITE_API_URL=https://<your-render-backend-domain>`
   - Example: `VITE_API_URL=https://codevamp-api.onrender.com`
4. Deploy.

---

## 4) CORS + API wiring

- Backend currently uses `app.enableCors()` (open CORS), so Vercel -> Render requests work out of the box.
- Frontend reads API base URL from:
  - `apps/web/src/config.ts`
  - `VITE_API_URL` in production should always be set for Vercel deployment.

---

## 5) Verify after deployment

1. Open frontend URL (Vercel).
2. Register/login.
3. Open any problem and run:
   - **Run Tests**
   - **Submit**
4. Confirm APIs return data:
   - `/problems`
   - `/submissions/execute`
   - `/submissions/status/:jobId`

---

## Notes

- Netlify-specific files were removed from this setup.
- Render may spin down services on eligible free plans after inactivity; the first request after that can take longer. Use an always-on plan if the WebSocket leaderboard must remain continuously available.
