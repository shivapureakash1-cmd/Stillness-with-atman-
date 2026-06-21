export default function Footer({ quote }) {
  return (
    <footer
      data-testid="site-footer"
      className="border-t border-line mt-32 pt-20 pb-10 px-6 md:px-12"
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          <div>
            <div className="font-serif-display text-[28px] leading-none">Siddha-Tech</div>
            <div className="font-eyebrow mt-2">Living Earth · Pune</div>
            <p className="mt-6 text-dim text-[14px] leading-relaxed max-w-xs">
              An invitation to rebuild Earth from the soul outward — through sacred
              architecture, regenerative agriculture, and conscious technology.
            </p>
          </div>
          <div>
            <div className="font-eyebrow mb-5">Pathways</div>
            <ul className="space-y-3 text-[14px]">
              <li><a href="/register" className="link-underline">Register your idea</a></li>
              <li><a href="/study" className="link-underline">Akashic Blueprint</a></li>
              <li><a href="/founders" className="link-underline">Approved founders</a></li>
            </ul>
          </div>
          <div>
            <div className="font-eyebrow mb-5">Resources</div>
            <ul className="space-y-3 text-[14px]">
              <li>
                <a href="/assets/satya.docx" className="link-underline" download>
                  Manifesto (SATYA · .docx)
                </a>
              </li>
              <li>
                <a href="/assets/akashic-blueprint.pptx" className="link-underline" download>
                  Akashic Blueprint deck (.pptx)
                </a>
              </li>
              <li>
                <a href="/assets/living-earth.mp4" className="link-underline" download>
                  Living Earth video (.mp4)
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="divider">
          <span className="font-serif-display italic text-gold text-[18px]">
            {quote || "Om Tat Sat"}
          </span>
        </div>
        <div className="mt-8 text-[11px] text-dim tracking-[0.18em] uppercase">
          © {new Date().getFullYear()} Akash Shivapure · All vibrations reserved
        </div>
      </div>
    </footer>
  );
}
