import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/AuthContext";
import { api } from "@/lib/apiClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import RegisterPage from "@/pages/RegisterPage";
import StudyPage from "@/pages/StudyPage";
import FoundersPage from "@/pages/FoundersPage";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

function Shell() {
  const [site, setSite] = useState(null);

  useEffect(() => {
    api.get("/site-content").then(({ data }) => setSite(data)).catch(() => {});
  }, []);

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center text-dim font-eyebrow" data-testid="boot-loader">
        Awakening…
      </div>
    );
  }

  return (
    <div className="App min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage siteContent={site} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/study/:slug" element={<StudyPage />} />
        <Route path="/founders" element={<FoundersPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer quote={site.footer_quote} />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-6" data-testid="not-found">
      <div>
        <div className="numeral text-[120px] leading-none">∅</div>
        <div className="font-serif-display text-[40px] mt-4">Lost in the ether.</div>
        <a href="/" className="btn mt-10">Return home</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}
