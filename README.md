# 🌱 Siddha-Tech / Living Earth

A platform to register new development ideas and startup companies focused on **agriculture, regenerative earth-development, sacred architecture, and consciousness technology** — guided by the vision of Akash Shivapure.

Built with React + FastAPI + MongoDB.

---

## ✨ Features

- 🏛️ **Vision landing page** with manifesto, cinematic video, and approved-founders directory
- 📝 **Register-your-idea portal** — startups submit founder details, idea, problem solved, stage, funding needs + optional pitch deck (PDF / PPT / DOCX)
- 📖 **Akashic Blueprint study section** — 17 chapters across 6 parts, Notion-style split reading layout
- 🛡️ **Admin (Inner Sanctum) dashboard** — approve / reject submissions, download pitch decks, inline-edit site copy
- 🔐 **JWT auth** — single seeded admin (no public signup)

---

## 🚀 Deploying for free — GitHub + MongoDB Atlas + Render + Vercel

Follow [`DEPLOY_FREE.md`](./DEPLOY_FREE.md) — total time ~30–45 minutes, total cost ₹0.

## 💻 Running locally

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # then edit values
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd frontend
yarn install
cp .env.example .env   # then edit REACT_APP_BACKEND_URL
yarn start
```

Open http://localhost:3000

---

## 🔑 Default admin credentials
- Email: `akash@siddha-tech.earth`
- Password: `SiddhaTech@2026`

**Change these in `backend/.env` before going to production.**

---

## 📜 Architecture

```
┌────────────┐   HTTPS   ┌────────────┐   Motor   ┌────────────┐
│  React +   │  ──────▶  │  FastAPI   │  ──────▶  │  MongoDB   │
│  Tailwind  │           │  /api/...  │           │   Atlas    │
│  (Vercel)  │           │  (Render)  │           │  (free)    │
└────────────┘           └────────────┘           └────────────┘
```

---

## 📂 Project structure

```
/
├── backend/
│   ├── server.py             FastAPI app + all endpoints
│   ├── chapters_seed.py      17-chapter Akashic Blueprint content
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js            React Router setup
│   │   ├── pages/            HomePage, RegisterPage, StudyPage, FoundersPage, AdminLogin, AdminDashboard
│   │   ├── components/       Navbar, Footer
│   │   └── lib/              apiClient.js, AuthContext.jsx
│   ├── public/assets/        living-earth.mp4, satya.docx, akashic-blueprint.pptx
│   └── .env.example
├── README.md
└── DEPLOY_FREE.md            Step-by-step free-hosting guide
```

---

## 🛐 Om Tat Sat
