import { SPONSORS, TEAM_LOGOS } from '../data/sponsors';

export default function SponsorMarquee({ items = SPONSORS, label = 'Trusted Partners' }) {
  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <section className="relative overflow-hidden border-y" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="text-center mb-6">
          <div className="text-[11px] uppercase tracking-[0.25em] font-semibold mb-1" style={{ color: 'var(--text-60)' }}>
            {label}
          </div>
        </div>

        <div className="marquee-pause relative">
          {/* Fade gradients on edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
               style={{ background: 'linear-gradient(90deg, var(--surface-1), transparent)' }} />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
               style={{ background: 'linear-gradient(-90deg, var(--surface-1), transparent)' }} />

          <div className="marquee-track gap-8 md:gap-14">
            {doubled.map((s, i) => (
              <div
                key={`${s.name}-${i}`}
                className="flex items-center justify-center flex-shrink-0 group"
                style={{ minWidth: '120px', height: '60px' }}
              >
                <img
                  src={s.logo}
                  alt={s.name}
                  loading="lazy"
                  className="max-h-12 max-w-full object-contain transition-all duration-300 group-hover:scale-110"
                  style={{
                    filter: 'brightness(0) invert(1) opacity(0.55)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1) invert(0) opacity(1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(0) invert(1) opacity(0.55)'; }}
                  onError={(e) => {
                    // Fallback to text
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.innerHTML = `<span class="font-display text-lg" style="color:var(--text-60)">${s.name}</span>`;
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TeamMarquee() {
  return <SponsorMarquee items={TEAM_LOGOS} label="Backing Top Clubs Worldwide" />;
}
