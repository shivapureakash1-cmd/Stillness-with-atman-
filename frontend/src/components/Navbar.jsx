import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const linkClass = ({ isActive }) =>
    `link-underline text-[12px] tracking-[0.22em] uppercase ${
      isActive ? "text-gold" : "text-dim"
    }`;

  return (
    <header
      data-testid="site-navbar"
      className="sticky top-0 z-50 backdrop-blur-2xl bg-black/40 border-b border-line"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
        <Link
          to="/"
          data-testid="brand-link"
          className="flex items-center gap-3 group"
        >
          <svg width="28" height="28" viewBox="0 0 32 32" className="text-gold" fill="none">
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1" />
            <path
              d="M16 4 L28 22 L4 22 Z M16 28 L4 10 L28 10 Z"
              stroke="currentColor"
              strokeWidth="0.8"
              opacity="0.7"
            />
          </svg>
          <div className="leading-none">
            <div className="font-serif-display text-[20px] tracking-tight">
              Siddha-Tech
            </div>
            <div className="font-eyebrow text-[9px] mt-1">Living Earth</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <NavLink to="/" end className={linkClass} data-testid="nav-home">
            Vision
          </NavLink>
          <NavLink to="/register" className={linkClass} data-testid="nav-register">
            Register Idea
          </NavLink>
          <NavLink to="/study" className={linkClass} data-testid="nav-study">
            Akashic Blueprint
          </NavLink>
          <NavLink to="/founders" className={linkClass} data-testid="nav-founders">
            Founders
          </NavLink>
        </nav>

        <div className="flex items-center gap-4">
          {user && user.role === "admin" ? (
            <>
              <Link
                to="/admin"
                data-testid="nav-admin"
                className="btn btn-primary !py-2 !px-4 text-[10px]"
              >
                Inner Sanctum
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  nav("/");
                }}
                data-testid="nav-logout"
                className="btn-ghost text-[11px] tracking-[0.2em] uppercase text-dim hover:text-gold"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/admin/login"
              data-testid="nav-login"
              className="btn !py-2 !px-4 text-[10px]"
            >
              Custodian
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
