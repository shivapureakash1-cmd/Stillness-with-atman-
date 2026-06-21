# 🌍 Free Hosting Guide — Siddha-Tech / Living Earth

Get your full-stack site live on the internet for **₹0**, in about **30–45 minutes**.

You will use 4 free services:

| Service | What it stores | Free tier |
|---|---|---|
| **GitHub** | Your code | Free forever, unlimited |
| **MongoDB Atlas** | Database (submissions, chapters, users) | 512 MB cluster forever |
| **Render** | Backend API (FastAPI server) | Free tier (sleeps after 15 min idle, wakes in ~30s) |
| **Vercel** | Frontend (React website) | Free forever for personal projects |

Final result: **a public URL like `siddha-tech.vercel.app`** that anyone can visit.

---

## 📋 Before you start — you'll need

- An **email address**
- A **GitHub account** (free → [github.com/signup](https://github.com/signup))
- ~45 minutes of quiet time

You do **NOT** need: a credit card, a domain name, or any payment.

---

## ✅ Step 1 — Push the code to GitHub (5 min)

You already have the code in Emergent. To put it on GitHub:

1. In your Emergent chat, find the **"Save to GitHub"** button (near the message input at the bottom)
2. Click it and sign in with your GitHub account when prompted
3. Choose a repo name — e.g. `siddha-tech-living-earth`
4. Make sure the repo is **Public** (Render and Vercel free tiers need public repos)
5. Click **Save / Push**

✅ Done when you can open `https://github.com/YOUR-USERNAME/siddha-tech-living-earth` and see all the files.

---

## ✅ Step 2 — Create a free MongoDB Atlas database (10 min)

1. Go to **[mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)**
2. Sign up with Google or email (no credit card needed)
3. When asked, pick:
   - **Goal:** Build a new application
   - **Language:** Python
4. **Create a free cluster** — choose:
   - Plan: **M0 Free** ($0 forever)
   - Provider: **AWS**
   - Region: pick the closest to you (e.g. **Mumbai** for India)
   - Cluster name: `siddha-tech` (or anything)
5. Click **Create Deployment** → wait 2–3 minutes for the cluster to be ready

### Now create a database user
6. In the left sidebar, click **Database Access** → **Add New Database User**
7. Username: `siddha_admin`
8. Password: click **Autogenerate Secure Password** → **COPY IT and save it somewhere safe**
9. Built-in role: **Read and write to any database**
10. Click **Add User**

### Allow connections from anywhere (so Render can connect)
11. In the left sidebar, click **Network Access** → **Add IP Address**
12. Click **Allow Access From Anywhere** → confirm → it shows `0.0.0.0/0`

### Get your connection string
13. In the left sidebar, click **Database** → next to your cluster click **Connect**
14. Choose **Drivers** → Python → version 3.12 or later
15. Copy the connection string. It looks like:
    ```
    mongodb+srv://siddha_admin:<password>@siddha-tech.xxxxx.mongodb.net/?retryWrites=true&w=majority
    ```
16. Replace `<password>` with the password you copied in step 8
17. **Save this final string** — you'll need it in Step 3

✅ Done.

---

## ✅ Step 3 — Deploy the backend on Render (10 min)

1. Go to **[render.com](https://render.com)** → **Get Started**
2. Sign up with **GitHub** (easiest)
3. Click **New +** → **Web Service**
4. Connect your GitHub repo → pick `siddha-tech-living-earth`
5. Fill in these settings exactly:

   | Field | Value |
   |---|---|
   | **Name** | `siddha-tech-api` |
   | **Region** | Closest to you (Singapore / Frankfurt) |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Runtime** | **Python 3** |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
   | **Instance Type** | **Free** |

6. Scroll down to **Environment Variables** → click **Add Environment Variable** and add these **one by one**:

   | Key | Value |
   |---|---|
   | `MONGO_URL` | the connection string from Step 2 |
   | `DB_NAME` | `siddha_tech_db` |
   | `JWT_SECRET` | paste any 64 random characters (e.g. open [random.org/passwords](https://www.random.org/passwords/?num=1&len=64&format=html&rnd=new) and copy) |
   | `ADMIN_EMAIL` | your email (this is the admin login) |
   | `ADMIN_PASSWORD` | a strong password you'll remember |
   | `CORS_ORIGINS` | `*` (we'll tighten this in Step 4) |
   | `FRONTEND_URL` | `https://example.com` (placeholder — update in Step 4) |

7. Click **Create Web Service**
8. Wait **5–10 minutes** for the first deploy. When it shows **"Live"**, copy your backend URL — it looks like:
   ```
   https://siddha-tech-api.onrender.com
   ```
9. Test it works: visit `https://siddha-tech-api.onrender.com/api/` in your browser. You should see:
   ```json
   {"name":"Siddha-Tech API","status":"ok"}
   ```
   (First load may take 30 seconds — that's the free tier waking up.)

✅ Done.

---

## ✅ Step 4 — Deploy the frontend on Vercel (10 min)

1. Go to **[vercel.com](https://vercel.com)** → **Sign Up** with GitHub
2. On the dashboard, click **Add New** → **Project**
3. Find your `siddha-tech-living-earth` repo → click **Import**
4. Fill in these settings:

   | Field | Value |
   |---|---|
   | **Framework Preset** | Create React App (auto-detected) |
   | **Root Directory** | click **Edit** → select `frontend` |
   | **Build Command** | `yarn build` (default is fine) |
   | **Output Directory** | `build` (default) |

5. Expand **Environment Variables** and add **one**:

   | Key | Value |
   |---|---|
   | `REACT_APP_BACKEND_URL` | your Render URL from Step 3, e.g. `https://siddha-tech-api.onrender.com` |

6. Click **Deploy** → wait 2–3 minutes
7. When it's done, Vercel gives you a URL like:
   ```
   https://siddha-tech-living-earth.vercel.app
   ```
8. **Open it in your browser. Your site is LIVE. 🎉**

### Step 4b — Tell the backend about the frontend URL (1 min)
9. Go back to **Render** → your `siddha-tech-api` service → **Environment** tab
10. Edit `FRONTEND_URL` → set it to your Vercel URL (e.g. `https://siddha-tech-living-earth.vercel.app`)
11. Edit `CORS_ORIGINS` → set it to the same Vercel URL
12. Click **Save Changes** → Render will redeploy (1–2 min)

✅ Done. Your site is now fully connected.

---

## 🔐 Logging in as admin

1. Open your Vercel URL → click **"Custodian"** (top right) or go to `/admin/login`
2. Use the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you set on Render in Step 3
3. You'll see the dashboard with submissions and site-content editing

---

## ⚠️ Important notes about the free tier

1. **Render sleeps after 15 min of inactivity.** The first visitor after a sleep waits ~30 seconds for the site to wake up. After that, it's instant for everyone. A trick: use **[cron-job.org](https://cron-job.org)** (free) to ping your API every 10 minutes to keep it awake. Set it to GET `https://siddha-tech-api.onrender.com/api/` every 10 minutes.

2. **MongoDB Atlas free tier = 512 MB.** That's enough for thousands of submissions. You'll get an email if you near the limit.

3. **Vercel free tier = unlimited static traffic.** Never sleeps.

4. **Uploaded pitch decks** are stored inside MongoDB (as base64). Keep individual files under ~5 MB to stay within the 512 MB total quota for a while.

---

## 🆘 If something doesn't work

| Symptom | Likely cause | Fix |
|---|---|---|
| Vercel site shows blank "Awakening..." forever | Frontend can't reach backend | Check `REACT_APP_BACKEND_URL` on Vercel is your Render URL (no trailing slash) |
| Login says "Invalid credentials" | Wrong env vars on Render | Check `ADMIN_EMAIL` / `ADMIN_PASSWORD` are exactly what you typed (case-sensitive) |
| Render build fails | Wrong root directory | Re-check **Root Directory = `backend`** |
| Vercel build fails | Wrong root directory | Re-check **Root Directory = `frontend`** |
| "CORS error" in browser console | Frontend URL not whitelisted | Update `CORS_ORIGINS` on Render to your Vercel URL |

---

## 🌐 Optional: Custom domain (₹0–₹800/year)

Want `siddha-tech.earth` instead of `vercel.app`?
1. Buy a domain from [namecheap.com](https://www.namecheap.com) or [godaddy.com](https://www.godaddy.com) (₹500–₹1500/year)
2. In Vercel → Project Settings → Domains → Add your domain
3. Follow Vercel's DNS instructions (5–10 min)
4. Free SSL certificate is included automatically

You can keep the `.vercel.app` URL forever if you don't want to pay for a domain.

---

## 🛐 Om Tat Sat
