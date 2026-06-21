import { useState } from "react";
import { api, formatApiError } from "@/lib/apiClient";

const CATEGORIES = [
  "Regenerative Agriculture",
  "Sacred Architecture / Vastu",
  "Conscious Technology",
  "Energy & Earth Systems",
  "Education / Gurukula",
  "Healing / Ayurveda",
  "Forest & Ecology",
  "Conscious Media",
  "Other",
];

const STAGES = [
  { v: "idea", label: "Idea" },
  { v: "prototype", label: "Prototype" },
  { v: "launched", label: "Launched" },
];

const INITIAL = {
  founder_name: "",
  email: "",
  phone: "",
  startup_name: "",
  category: CATEGORIES[0],
  description: "",
  problem_solved: "",
  stage: "idea",
  team_size: 1,
  funding_needs: "",
  location: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState(INITIAL);
  const [deck, setDeck] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const update = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (deck) fd.append("pitch_deck", deck);
      const { data } = await api.post("/submissions", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(data);
      setForm(INITIAL);
      setDeck(null);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail, err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div data-testid="register-success" className="min-h-[80vh] flex items-center fade-up">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="numeral text-[120px] leading-none">✶</div>
          <div className="font-eyebrow mt-6">Transmission received</div>
          <h2 className="font-serif-display text-[44px] md:text-[64px] mt-6" style={{ lineHeight: 1 }}>
            Your idea has<br />reached the council.
          </h2>
          <p className="mt-8 text-dim text-[16px] leading-relaxed">
            We have received <em className="text-gold not-italic">{success.startup_name}</em>.
            A custodian will review your submission and reach you at{" "}
            <span className="text-text">{success.email}</span> within seven sunrises.
          </p>
          <button
            onClick={() => setSuccess(null)}
            data-testid="submit-another-btn"
            className="btn mt-12"
          >
            Submit another idea
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="register-page" className="fade-up">
      {/* Header */}
      <section className="relative h-[60vh] overflow-hidden hero-overlay">
        <img
          src="https://images.unsplash.com/photo-1560493676-04071c5f467b?crop=entropy&cs=srgb&fm=jpg&q=85&w=2400"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 h-full flex flex-col justify-end pb-16">
          <div className="font-eyebrow mb-6">Founders · Builders · Stewards</div>
          <h1 className="font-serif-display text-[52px] md:text-[88px] max-w-3xl" style={{ lineHeight: 0.95 }}>
            Register your<br />idea for the<br />new Earth.
          </h1>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-[1100px] mx-auto px-6 md:px-12 py-24">
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-x-12 gap-y-10" data-testid="register-form">
          <div className="md:col-span-2 mb-4">
            <div className="font-eyebrow mb-3">The Founder</div>
            <div className="divider" />
          </div>

          <Field label="Founder name" required>
            <input
              data-testid="field-founder-name"
              required
              className="input-stark"
              value={form.founder_name}
              onChange={update("founder_name")}
              placeholder="Akash Shivapure"
            />
          </Field>
          <Field label="Email" required>
            <input
              data-testid="field-email"
              required
              type="email"
              className="input-stark"
              value={form.email}
              onChange={update("email")}
              placeholder="you@earth.org"
            />
          </Field>
          <Field label="Phone" required>
            <input
              data-testid="field-phone"
              required
              className="input-stark"
              value={form.phone}
              onChange={update("phone")}
              placeholder="+91 …"
            />
          </Field>
          <Field label="Location" required>
            <input
              data-testid="field-location"
              required
              className="input-stark"
              value={form.location}
              onChange={update("location")}
              placeholder="Pune, India"
            />
          </Field>

          <div className="md:col-span-2 mt-8 mb-4">
            <div className="font-eyebrow mb-3">The Idea</div>
            <div className="divider" />
          </div>

          <Field label="Startup / Idea name" required>
            <input
              data-testid="field-startup-name"
              required
              className="input-stark"
              value={form.startup_name}
              onChange={update("startup_name")}
              placeholder="Devavana Farms"
            />
          </Field>
          <Field label="Category" required>
            <select
              data-testid="field-category"
              className="input-stark"
              value={form.category}
              onChange={update("category")}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Stage" required>
            <select
              data-testid="field-stage"
              className="input-stark"
              value={form.stage}
              onChange={update("stage")}
            >
              {STAGES.map((s) => (
                <option key={s.v} value={s.v}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Team size" required>
            <input
              data-testid="field-team-size"
              required
              type="number"
              min="1"
              className="input-stark"
              value={form.team_size}
              onChange={update("team_size")}
            />
          </Field>
          <Field label="Funding needs" required>
            <input
              data-testid="field-funding-needs"
              required
              className="input-stark"
              value={form.funding_needs}
              onChange={update("funding_needs")}
              placeholder="₹ 25 lakh · seed"
            />
          </Field>
          <div />

          <Field label="Describe your idea" required full>
            <textarea
              data-testid="field-description"
              required
              className="input-stark"
              rows={5}
              value={form.description}
              onChange={update("description")}
              placeholder="What are you building, and why now…"
            />
          </Field>
          <Field label="Problem you're solving" required full>
            <textarea
              data-testid="field-problem-solved"
              required
              className="input-stark"
              rows={3}
              value={form.problem_solved}
              onChange={update("problem_solved")}
              placeholder="The wound this addresses on Earth…"
            />
          </Field>

          <Field label="Pitch deck (optional · PDF / PPT · max 15 MB)" full>
            <input
              data-testid="field-pitch-deck"
              type="file"
              accept=".pdf,.ppt,.pptx,.key,.doc,.docx"
              className="input-stark"
              onChange={(e) => setDeck(e.target.files?.[0] || null)}
            />
            {deck && (
              <div className="mt-2 text-[12px] text-dim">
                Selected: {deck.name} · {(deck.size / 1024).toFixed(0)} KB
              </div>
            )}
          </Field>

          {error && (
            <div
              className="md:col-span-2 border border-ember/40 text-ember p-4 text-[14px]"
              data-testid="register-error"
            >
              {error}
            </div>
          )}

          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-6 mt-8 pt-8 border-t border-line">
            <p className="text-dim text-[12px] max-w-md">
              By submitting you accept that your idea will be reviewed by the Siddha-Tech custodian council in confidence.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              data-testid="submit-button"
            >
              {submitting ? "Transmitting…" : "Submit to the council →"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, children, required, full }) {
  return (
    <label className={full ? "md:col-span-2 block" : "block"}>
      <div className="font-eyebrow mb-3">
        {label} {required && <span className="text-ember">·</span>}
      </div>
      {children}
    </label>
  );
}
