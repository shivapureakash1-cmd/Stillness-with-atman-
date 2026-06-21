import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

export default function FoundersPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/submissions/public").then(({ data }) => {
      setList(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div data-testid="founders-page" className="fade-up">
      <section className="border-b border-line">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20 md:py-32">
          <div className="font-eyebrow">The Council</div>
          <h1 className="font-serif-display text-[48px] md:text-[80px] mt-6" style={{ lineHeight: 0.95 }}>
            Founders walking<br />the path.
          </h1>
          <p className="mt-10 text-dim text-[17px] max-w-2xl leading-relaxed">
            Approved startups and ideas inside the Siddha-Tech council — building
            regenerative agriculture, sacred architecture, and conscious technology
            for the new Earth.
          </p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-20">
        {loading ? (
          <div className="text-dim font-eyebrow">Loading…</div>
        ) : list.length === 0 ? (
          <div data-testid="founders-empty" className="py-24 text-center">
            <div className="numeral text-[80px]">∅</div>
            <p className="text-dim mt-6 text-[16px]">
              No founders approved yet. Your idea could be the first transmission.
            </p>
            <a href="/register" className="btn btn-primary mt-10" data-testid="founders-register-cta">
              Submit your idea →
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-line">
            {list.map((f) => (
              <article
                key={f.id}
                data-testid={`founder-card-${f.id}`}
                className="bg-bg p-10 border border-line hover:border-line-strong transition-colors"
                style={{ background: "var(--bg)" }}
              >
                <div className="font-eyebrow text-gold mb-4">{f.category}</div>
                <h3 className="font-serif-display text-[28px] mb-4" style={{ lineHeight: 1.1 }}>
                  {f.startup_name}
                </h3>
                <p className="text-dim text-[14px] leading-relaxed line-clamp-5">
                  {f.description}
                </p>
                <div className="mt-8 pt-6 border-t border-line flex items-center justify-between text-[11px] tracking-[0.2em] uppercase text-dim">
                  <span>{f.location}</span>
                  <span className="text-gold">{f.stage}</span>
                </div>
                <div className="mt-2 text-[11px] tracking-[0.2em] uppercase text-dim">
                  Team of {f.team_size} · {f.founder_name}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
