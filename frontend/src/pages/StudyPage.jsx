import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/apiClient";

export default function StudyPage() {
  const { slug } = useParams();
  const [chapters, setChapters] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/chapters").then(({ data }) => {
      setChapters(data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!chapters.length) return;
    const target = slug
      ? chapters.find((c) => c.slug === slug)
      : chapters[0];
    setActive(target || chapters[0]);
  }, [slug, chapters]);

  // Group by part
  const byPart = chapters.reduce((acc, c) => {
    (acc[c.part] = acc[c.part] || []).push(c);
    return acc;
  }, {});
  const partOrder = Object.keys(byPart).sort(
    (a, b) => byPart[a][0].part_order - byPart[b][0].part_order
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-dim font-eyebrow" data-testid="study-loading">
        Loading the manuscript…
      </div>
    );
  }

  return (
    <div data-testid="study-page" className="fade-up">
      {/* Header */}
      <section className="border-b border-line">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20 md:py-32 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-7">
            <div className="font-eyebrow">The Akashic Blueprint</div>
            <h1 className="font-serif-display text-[48px] md:text-[88px] mt-6" style={{ lineHeight: 0.95 }}>
              The manuscript<br />of the new<br />civilization.
            </h1>
          </div>
          <div className="md:col-span-5 flex flex-col justify-end">
            <p className="text-dim text-[16px] leading-relaxed">
              Seventeen chapters across six parts. The complete vision of Akash Shivapure —
              from personal awakening to galactic dharma. Read slowly. Read often.
            </p>
            <div className="mt-8 font-eyebrow text-[10px]">
              {chapters.length} chapters · {partOrder.length} parts
            </div>
          </div>
        </div>
      </section>

      {/* Split layout */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid md:grid-cols-12 gap-12">
          {/* Sidebar Index */}
          <aside
            data-testid="chapter-index"
            className="md:col-span-4 lg:col-span-3 md:sticky md:top-24 md:self-start md:max-h-[80vh] md:overflow-y-auto scroll-hidden"
          >
            {partOrder.map((part) => (
              <div key={part} className="mb-10">
                <div className="font-eyebrow mb-4">{part}</div>
                <ul className="space-y-2">
                  {byPart[part].map((c) => (
                    <li key={c.slug}>
                      <Link
                        to={`/study/${c.slug}`}
                        data-testid={`index-${c.slug}`}
                        className={`block py-2 pl-4 border-l ${
                          active?.slug === c.slug
                            ? "border-gold text-gold"
                            : "border-line text-dim hover:text-text hover:border-line-strong"
                        } transition-colors`}
                        style={{ fontSize: "14px" }}
                      >
                        <span className="numeral text-[12px] mr-2">{romanize(c.chapter_number)}</span>
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>

          {/* Chapter content */}
          {active && (
            <article
              key={active.slug}
              data-testid={`chapter-${active.slug}`}
              className="md:col-span-8 lg:col-span-9 fade-up"
            >
              <div className="font-eyebrow">{active.part}</div>
              <h2
                className="font-serif-display text-[40px] md:text-[64px] mt-4"
                style={{ lineHeight: 1.02 }}
              >
                {active.title}
              </h2>
              {active.subtitle && (
                <p className="mt-4 font-serif-display italic text-[22px] md:text-[26px] text-gold-soft text-dim">
                  {active.subtitle}
                </p>
              )}
              <div className="flex items-center gap-6 mt-8 text-[11px] tracking-[0.2em] uppercase text-dim border-b border-line pb-8">
                <span>Chapter {active.chapter_number}</span>
                <span>·</span>
                <span>{active.reading_minutes} min read</span>
                {active.tags?.length > 0 && (
                  <>
                    <span>·</span>
                    <span>{active.tags.join(" · ")}</span>
                  </>
                )}
              </div>

              <div className="prose-vedic mt-10">
                <p className="text-[20px] md:text-[22px] font-serif-display text-text" style={{ lineHeight: 1.5 }}>
                  {active.summary}
                </p>

                {active.sections?.map((s, i) => (
                  <div key={i}>
                    <h3>{s.heading}</h3>
                    <p>{s.body}</p>
                  </div>
                ))}
              </div>

              {/* Nav prev/next */}
              <ChapterNav chapters={chapters} active={active} />
            </article>
          )}
        </div>
      </section>
    </div>
  );
}

function ChapterNav({ chapters, active }) {
  const idx = chapters.findIndex((c) => c.slug === active.slug);
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;
  return (
    <div className="mt-24 pt-10 border-t border-line grid grid-cols-2 gap-6">
      <div>
        {prev && (
          <Link to={`/study/${prev.slug}`} data-testid="chapter-prev" className="block group">
            <div className="font-eyebrow mb-2">← Previous</div>
            <div className="font-serif-display text-[20px] group-hover:text-gold transition-colors">
              {prev.title}
            </div>
          </Link>
        )}
      </div>
      <div className="text-right">
        {next && (
          <Link to={`/study/${next.slug}`} data-testid="chapter-next" className="block group">
            <div className="font-eyebrow mb-2">Next →</div>
            <div className="font-serif-display text-[20px] group-hover:text-gold transition-colors">
              {next.title}
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

function romanize(num) {
  const map = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  let n = num;
  let out = "";
  for (const [v, s] of map) {
    while (n >= v) { out += s; n -= v; }
  }
  return out;
}
