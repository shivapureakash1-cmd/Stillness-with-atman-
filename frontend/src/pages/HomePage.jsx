import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/apiClient";
import { Play, Pause } from "lucide-react";

const HERO_IMG =
  "https://images.unsplash.com/photo-1516331138075-f3adc1e149cd?crop=entropy&cs=srgb&fm=jpg&q=85&w=2400";
const TEMPLE_IMG =
  "https://images.unsplash.com/photo-1566915682737-3e97a7eed93b?crop=entropy&cs=srgb&fm=jpg&q=85&w=2000";
const AGRI_IMG =
  "https://images.unsplash.com/photo-1560493676-04071c5f467b?crop=entropy&cs=srgb&fm=jpg&q=85&w=2000";
const FIRE_IMG =
  "https://images.pexels.com/photos/28746118/pexels-photo-28746118.jpeg?auto=compress&cs=tinysrgb&w=2000";

const PILLARS = [
  { n: "I", title: "Temple-City Architecture", body: "Cities designed as living mandalas with central scalar reactors, Vastu homes, Devavana forest belts." },
  { n: "II", title: "Regenerative Agriculture", body: "Nakshatra-seeded crops, cow-based fertility, agroforestry mandalas. Food as life-force, not commodity." },
  { n: "III", title: "Consciousness Technology", body: "Mantra engineering, sound domes, scalar fields, Soma-tech and ether-aware systems." },
  { n: "IV", title: "Founders & Stewards", body: "An incubation council for builders aligned to Dharma — agriculture, ecology, sacred design, conscious media." },
];

export default function HomePage({ siteContent }) {
  const [approved, setApproved] = useState([]);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    api.get("/submissions/public").then(({ data }) => setApproved(data || [])).catch(() => {});
  }, []);

  const c = siteContent;

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div data-testid="home-page" className="fade-up">
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden hero-overlay">
        <img
          src={HERO_IMG}
          alt="Cosmos"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 pb-20 md:pb-32 w-full">
          <div className="max-w-3xl">
            <div className="font-eyebrow mb-8" data-testid="hero-eyebrow">
              {c.hero_eyebrow}
            </div>
            <h1
              data-testid="hero-title"
              className="font-serif-display text-[44px] md:text-[88px] text-text"
              style={{ lineHeight: 0.95 }}
            >
              {c.hero_title}
            </h1>
            <p
              data-testid="hero-subtitle"
              className="mt-10 text-dim text-[17px] md:text-[19px] leading-relaxed max-w-2xl"
            >
              {c.hero_subtitle}
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <Link to="/register" data-testid="hero-cta-register" className="btn btn-primary">
                Register your idea →
              </Link>
              <Link to="/study" data-testid="hero-cta-study" className="btn">
                Study the blueprint
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 md:py-40">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div className="font-eyebrow">The Manifesto</div>
            <div className="numeral text-[100px] mt-4 leading-none">I</div>
          </div>
          <div className="md:col-span-8">
            <h2
              data-testid="manifesto-title"
              className="font-serif-display text-[40px] md:text-[64px]"
              style={{ lineHeight: 1.02 }}
            >
              &ldquo;{c.manifesto_title}&rdquo;
            </h2>
            <p
              data-testid="manifesto-body"
              className="mt-10 text-[18px] leading-[1.8] text-dim max-w-2xl"
            >
              {c.manifesto_body}
            </p>
            <div className="mt-10 font-eyebrow text-[10px]">— Akash Shivapure</div>
          </div>
        </div>
      </section>

      {/* PILLARS BENTO */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 border-t border-line">
        <div className="flex items-end justify-between mb-16">
          <div>
            <div className="font-eyebrow">Four Pillars</div>
            <h3 className="font-serif-display text-[38px] md:text-[56px] mt-3" style={{ lineHeight: 1.05 }}>
              The architecture of the new Earth.
            </h3>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-px bg-line">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              data-testid={`pillar-${p.n}`}
              className="bg-bg p-10 md:p-14 border border-line"
              style={{ background: "var(--bg)" }}
            >
              <div className="flex items-start gap-8">
                <div className="numeral text-[64px] leading-none">{p.n}</div>
                <div>
                  <h4 className="font-serif-display text-[28px] mb-4">{p.title}</h4>
                  <p className="text-dim text-[15px] leading-relaxed">{p.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VIDEO */}
      <section className="relative my-24 md:my-40">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="font-eyebrow mb-6">Transmission</div>
          <h3 className="font-serif-display text-[36px] md:text-[56px] mb-10" style={{ lineHeight: 1 }}>
            Siddha-Tech · Living Earth
          </h3>
          <div
            className="relative overflow-hidden border border-line cursor-pointer"
            style={{ aspectRatio: "21/9" }}
            onClick={togglePlay}
            data-testid="video-player"
          >
            <video
              ref={videoRef}
              src="/assets/living-earth.mp4"
              className="w-full h-full object-cover"
              playsInline
              poster={FIRE_IMG}
              onEnded={() => setPlaying(false)}
            />
            {!playing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <button
                  data-testid="video-play"
                  className="w-20 h-20 border border-gold text-gold flex items-center justify-center hover:bg-gold hover:text-bg transition-all"
                  style={{ background: "rgba(0,0,0,0.6)" }}
                >
                  <Play size={26} fill="currentColor" />
                </button>
              </div>
            )}
            {playing && (
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="absolute bottom-6 right-6 w-12 h-12 border border-line-strong text-text/80 flex items-center justify-center bg-black/50"
                data-testid="video-pause"
              >
                <Pause size={16} />
              </button>
            )}
          </div>
          <div className="mt-4 text-dim text-[13px] tracking-[0.18em] uppercase">
            {c.video_caption}
          </div>
        </div>
      </section>

      {/* SECONDARY IMAGE GRID */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-px bg-line">
        <div className="relative h-[480px] overflow-hidden group">
          <img src={TEMPLE_IMG} alt="Temple" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[1.2s]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
          <div className="absolute bottom-0 left-0 p-10">
            <div className="font-eyebrow text-gold mb-3">Sacred Architecture</div>
            <h4 className="font-serif-display text-[34px]" style={{ lineHeight: 1.05 }}>
              Temples as<br />consciousness machines.
            </h4>
          </div>
        </div>
        <div className="relative h-[480px] overflow-hidden group">
          <img src={AGRI_IMG} alt="Agriculture" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[1.2s]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
          <div className="absolute bottom-0 left-0 p-10">
            <div className="font-eyebrow text-gold mb-3">Regenerative Earth</div>
            <h4 className="font-serif-display text-[34px]" style={{ lineHeight: 1.05 }}>
              Bhumi Devi —<br />honored, not owned.
            </h4>
          </div>
        </div>
      </section>

      {/* APPROVED FOUNDERS PREVIEW */}
      {approved.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-32 border-t border-line mt-32">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="font-eyebrow">The Council</div>
              <h3 className="font-serif-display text-[38px] md:text-[52px] mt-3">
                Founders walking the path.
              </h3>
            </div>
            <Link to="/founders" className="btn" data-testid="see-all-founders">
              See all
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-line">
            {approved.slice(0, 3).map((f) => (
              <div key={f.id} className="card-stark !border-0" data-testid={`approved-${f.id}`}>
                <div className="font-eyebrow text-gold mb-4">{f.category}</div>
                <h4 className="font-serif-display text-[26px] mb-3">{f.startup_name}</h4>
                <p className="text-dim text-[14px] leading-relaxed line-clamp-4">{f.description}</p>
                <div className="mt-6 font-eyebrow text-[10px]">{f.location} · {f.stage}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-32 border-t border-line">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-8">
            <div className="font-eyebrow">The invitation</div>
            <h3 className="font-serif-display text-[38px] md:text-[64px] mt-4" style={{ lineHeight: 1.02 }}>
              If you are building<br />for the next Earth —<br />
              <span className="text-gold italic">we are listening.</span>
            </h3>
          </div>
          <div className="md:col-span-4 flex justify-start md:justify-end">
            <Link to="/register" className="btn btn-primary" data-testid="cta-bottom-register">
              Submit your idea →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
