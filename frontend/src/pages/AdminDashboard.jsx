import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { api, API, formatApiError } from "@/lib/apiClient";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState("submissions");

  if (loading) return null;
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;

  return (
    <div data-testid="admin-dashboard" className="fade-up">
      <section className="border-b border-line">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 flex items-end justify-between flex-wrap gap-6">
          <div>
            <div className="font-eyebrow">Inner Sanctum</div>
            <h1 className="font-serif-display text-[44px] md:text-[64px] mt-4" style={{ lineHeight: 1 }}>
              Custodian&apos;s Dashboard
            </h1>
            <p className="text-dim mt-4 text-[14px]">
              Logged in as <span className="text-gold">{user.email}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              data-testid="tab-submissions"
              className={`btn ${tab === "submissions" ? "btn-primary" : ""}`}
              onClick={() => setTab("submissions")}
            >
              Submissions
            </button>
            <button
              data-testid="tab-content"
              className={`btn ${tab === "content" ? "btn-primary" : ""}`}
              onClick={() => setTab("content")}
            >
              Site Content
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
        {tab === "submissions" ? <SubmissionsTab /> : <ContentTab />}
      </section>
    </div>
  );
}

function SubmissionsTab() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/submissions", { params: { status: filter === "all" ? undefined : filter } })
      .then(({ data }) => setItems(data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/submissions/${id}`, { status });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Permanently delete this submission?")) return;
    await api.delete(`/admin/submissions/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            data-testid={`filter-${s}`}
            onClick={() => setFilter(s)}
            className={`btn !py-2 !px-4 text-[10px] ${filter === s ? "btn-primary" : ""}`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-dim text-[12px]">
          {items.length} submission(s)
        </span>
      </div>

      {loading ? (
        <div className="text-dim font-eyebrow">Loading…</div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-dim border border-line">
          No submissions in this filter.
        </div>
      ) : (
        <div className="border border-line">
          {items.map((it) => (
            <div
              key={it.id}
              data-testid={`submission-row-${it.id}`}
              className="border-b border-line last:border-b-0"
            >
              <div
                className="grid grid-cols-12 gap-4 p-5 items-center cursor-pointer hover:bg-white/[0.02]"
                onClick={() => setExpanded(expanded === it.id ? null : it.id)}
              >
                <div className="col-span-12 md:col-span-3">
                  <div className="font-serif-display text-[20px]">{it.startup_name}</div>
                  <div className="text-dim text-[12px] mt-1">{it.founder_name}</div>
                </div>
                <div className="col-span-6 md:col-span-2 text-[12px] text-dim">
                  {it.category}
                </div>
                <div className="col-span-6 md:col-span-2 text-[12px] text-dim">
                  {it.location}
                </div>
                <div className="col-span-6 md:col-span-2 text-[12px] uppercase tracking-[0.15em] text-text">
                  {it.stage}
                </div>
                <div className="col-span-6 md:col-span-2">
                  <span className={`pill pill-${it.status}`}>{it.status}</span>
                </div>
                <div className="col-span-12 md:col-span-1 text-right">
                  <span className="text-dim text-[11px]">
                    {expanded === it.id ? "−" : "+"}
                  </span>
                </div>
              </div>

              {expanded === it.id && (
                <div className="px-5 pb-6 bg-surface" data-testid={`submission-detail-${it.id}`}>
                  <div className="grid md:grid-cols-2 gap-x-10 gap-y-4 text-[13px]">
                    <Detail label="Email" value={it.email} />
                    <Detail label="Phone" value={it.phone} />
                    <Detail label="Funding" value={it.funding_needs} />
                    <Detail label="Team size" value={it.team_size} />
                    <Detail label="Submitted" value={it.created_at?.slice(0, 19).replace("T", " ")} />
                    {it.pitch_deck_filename && (
                      <Detail
                        label="Pitch deck"
                        value={
                          <a
                            href={`${API}/admin/submissions/${it.id}/pitch`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-underline text-gold"
                          >
                            {it.pitch_deck_filename}
                          </a>
                        }
                      />
                    )}
                  </div>
                  <div className="mt-6">
                    <div className="font-eyebrow mb-2">Description</div>
                    <p className="text-text text-[14px] leading-relaxed">{it.description}</p>
                  </div>
                  <div className="mt-4">
                    <div className="font-eyebrow mb-2">Problem solved</div>
                    <p className="text-text text-[14px] leading-relaxed">{it.problem_solved}</p>
                  </div>
                  <div className="mt-8 flex gap-3 flex-wrap">
                    <button
                      data-testid={`approve-${it.id}`}
                      className="btn btn-primary"
                      onClick={() => updateStatus(it.id, "approved")}
                      disabled={it.status === "approved"}
                    >
                      Approve
                    </button>
                    <button
                      data-testid={`reject-${it.id}`}
                      className="btn btn-danger"
                      onClick={() => updateStatus(it.id, "rejected")}
                      disabled={it.status === "rejected"}
                    >
                      Reject
                    </button>
                    <button
                      data-testid={`pending-${it.id}`}
                      className="btn"
                      onClick={() => updateStatus(it.id, "pending")}
                      disabled={it.status === "pending"}
                    >
                      Mark pending
                    </button>
                    <button
                      data-testid={`delete-${it.id}`}
                      className="btn btn-ghost text-ember ml-auto"
                      onClick={() => remove(it.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="font-eyebrow mb-1">{label}</div>
      <div className="text-text">{value}</div>
    </div>
  );
}

function ContentTab() {
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/site-content").then(({ data }) => setContent(data));
  }, []);

  const set = (k) => (e) => setContent((c) => ({ ...c, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.put("/admin/site-content", content);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail, err.message));
    } finally {
      setSaving(false);
    }
  };

  if (!content) return <div className="text-dim font-eyebrow">Loading…</div>;

  const fields = [
    { k: "hero_eyebrow", label: "Hero eyebrow" },
    { k: "hero_title", label: "Hero title", long: true },
    { k: "hero_subtitle", label: "Hero subtitle", long: true },
    { k: "manifesto_title", label: "Manifesto title", long: true },
    { k: "manifesto_body", label: "Manifesto body", long: true },
    { k: "portal_eyebrow", label: "Portal eyebrow" },
    { k: "portal_title", label: "Portal title" },
    { k: "portal_subtitle", label: "Portal subtitle", long: true },
    { k: "study_eyebrow", label: "Study eyebrow" },
    { k: "study_title", label: "Study title" },
    { k: "study_subtitle", label: "Study subtitle", long: true },
    { k: "video_caption", label: "Video caption" },
    { k: "footer_quote", label: "Footer quote" },
  ];

  return (
    <div className="max-w-3xl">
      <p className="text-dim text-[13px] mb-10">
        Edit the public-facing copy of the site. Changes apply instantly to all visitors.
      </p>
      <div className="space-y-8">
        {fields.map((f) => (
          <label key={f.k} className="block">
            <div className="font-eyebrow mb-3">{f.label}</div>
            {f.long ? (
              <textarea
                data-testid={`content-${f.k}`}
                className="input-stark"
                rows={3}
                value={content[f.k] || ""}
                onChange={set(f.k)}
              />
            ) : (
              <input
                data-testid={`content-${f.k}`}
                className="input-stark"
                value={content[f.k] || ""}
                onChange={set(f.k)}
              />
            )}
          </label>
        ))}
      </div>
      {error && (
        <div className="mt-6 border border-ember/40 text-ember p-3 text-[13px]">
          {error}
        </div>
      )}
      <div className="mt-10 flex items-center gap-4">
        <button
          data-testid="save-content"
          onClick={save}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-gold font-eyebrow">✓ Saved</span>}
        <Link to="/" className="btn-ghost text-[11px] text-dim ml-auto link-underline">
          View site →
        </Link>
      </div>
    </div>
  );
}
