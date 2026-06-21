import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { formatApiError } from "@/lib/apiClient";

export default function AdminLogin() {
  const { login, user, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      nav("/admin");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail, "Invalid credentials"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      data-testid="admin-login-page"
      className="min-h-[80vh] flex items-center fade-up"
    >
      <div className="max-w-md mx-auto px-6 w-full">
        <div className="font-eyebrow text-center">The Custodian&apos;s Gate</div>
        <h1 className="font-serif-display text-[44px] md:text-[56px] text-center mt-6" style={{ lineHeight: 1 }}>
          Inner Sanctum
        </h1>
        <p className="text-center text-dim mt-6 text-[14px]">
          Reserved for the steward of Siddha-Tech.
        </p>

        <form onSubmit={submit} className="mt-16 space-y-8" data-testid="admin-login-form">
          <label className="block">
            <div className="font-eyebrow mb-3">Email</div>
            <input
              data-testid="login-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-stark"
              placeholder="akash@siddha-tech.earth"
            />
          </label>
          <label className="block">
            <div className="font-eyebrow mb-3">Password</div>
            <input
              data-testid="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-stark"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <div className="border border-ember/40 text-ember p-3 text-[13px]" data-testid="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            data-testid="login-submit"
            className="btn btn-primary w-full justify-center"
          >
            {submitting ? "Opening the gate…" : "Enter →"}
          </button>
        </form>
      </div>
    </div>
  );
}
