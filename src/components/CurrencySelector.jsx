import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';

const CHEVRON = ({ open }) => (
  <motion.svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    animate={{ rotate: open ? 180 : 0 }}
    transition={{ duration: 0.2, ease: 'easeInOut' }}
  >
    <path
      d="M2 3.5L5 6.5L8 3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </motion.svg>
);

const CHECK = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M2 6L4.8 8.8L10 3"
      stroke="#E8003D"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// Map ISO country codes → currency codes
const COUNTRY_TO_CURRENCY = {
  GH: 'GHS', NG: 'NGN', KE: 'KES', ZA: 'ZAR', UG: 'UGX',
  TZ: 'TZS', RW: 'RWF', ET: 'ETB', CM: 'XAF', CI: 'XOF',
  SN: 'XOF', ML: 'XOF', BF: 'XOF', NE: 'XOF', TG: 'XOF',
  BJ: 'XOF', MR: 'MRU', GM: 'GMD', SL: 'SLL', LR: 'LRD',
  ZM: 'ZMW', ZW: 'ZWL', MW: 'MWK', MZ: 'MZN', BW: 'BWP',
  NA: 'NAD', AO: 'AOA', MG: 'MGA', SD: 'SDG', EG: 'EGP',
  MA: 'MAD', TN: 'TND', DZ: 'DZD', LY: 'LYD',
  US: 'USD', GB: 'GBP', EU: 'EUR', DE: 'EUR', FR: 'EUR',
  IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR', PT: 'EUR',
  IN: 'INR', CN: 'CNY', JP: 'JPY', AU: 'AUD', CA: 'CAD',
  BR: 'BRL', MX: 'MXN', AE: 'AED', SA: 'SAR', QA: 'QAR',
};

/**
 * Detect country from IP using a free, no-key-required API.
 * Falls back silently if the request fails.
 * Returns an ISO 3166-1 alpha-2 country code (e.g. "GH").
 */
async function detectCountryFromIP() {
  try {
    // ipapi.co is free for up to 1,000 req/day, no API key needed
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('ipapi failed');
    const data = await res.json();
    return data.country_code || null; // e.g. "GH"
  } catch {
    try {
      // Fallback: ip-api.com (free, no key, HTTP only — may be blocked on HTTPS pages)
      const res = await fetch('http://ip-api.com/json/?fields=countryCode', { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error('ip-api failed');
      const data = await res.json();
      return data.countryCode || null;
    } catch {
      return null;
    }
  }
}

const IP_CACHE_KEY = 'sb_ip_currency';

export default function CurrencySelector({ className = '' }) {
  const { currency, currencies, setCurrency, user } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const current = currencies.find((c) => c.code === currency) || currencies[0];
  const isLoggedIn = !!user;

  // ── IP-based auto-detection for guests ──
  useEffect(() => {
    if (isLoggedIn) return; // logged-in users have a fixed currency

    // Use sessionStorage to avoid repeated API calls within the same tab session
    const cached = sessionStorage.getItem(IP_CACHE_KEY);
    if (cached) {
      setCurrency(cached);
      return;
    }

    detectCountryFromIP().then((countryCode) => {
      if (!countryCode) return;
      const detectedCurrency = COUNTRY_TO_CURRENCY[countryCode];
      if (!detectedCurrency) return;

      // Only apply if the store has this currency in its list
      const exists = currencies.find((c) => c.code === detectedCurrency);
      if (!exists) return;

      setCurrency(detectedCurrency);
      sessionStorage.setItem(IP_CACHE_KEY, detectedCurrency);
    });
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Logged-in: read-only display pill, no dropdown ──
  if (isLoggedIn) {
    return (
      <div
        className={`flex items-center gap-1.5 h-10 px-3 rounded-md select-none ${className}`}
        style={{
          background: 'var(--surface-1, #1e293b)',
          border: '1px solid var(--border, #334155)',
          cursor: 'default',
        }}
        title="Currency is set at registration and cannot be changed"
      >
        <span className="text-base leading-none" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>
          {current.flag}
        </span>
        <span
          className="font-mono font-bold text-xs tracking-wide"
          style={{ color: 'var(--text-100, #fff)', letterSpacing: '0.06em' }}
        >
          {current.code}
        </span>
        <span
          className="hidden sm:inline-flex items-center justify-center font-mono font-bold text-[10px] px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(232,0,61,0.12)', color: '#E8003D', minWidth: '18px' }}
        >
          {current.symbol}
        </span>
        {/* Lock icon to signal it's fixed */}
        <span style={{ color: 'var(--text-40, #555)', marginLeft: '1px' }}>
          <LockIcon />
        </span>
      </div>
    );
  }

  // ── Guest: fully interactive dropdown (with IP-auto-selected default) ──
  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="group flex items-center gap-1.5 h-10 px-3 rounded-md transition-all duration-200 select-none"
        style={{
          background: isOpen ? 'var(--surface-2, #1e293b)' : 'var(--surface-1, #1e293b)',
          border: isOpen ? '1px solid #E8003D' : '1px solid var(--border, #334155)',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 2px rgba(232,0,61,0.15)' : 'none',
        }}
      >
        <span className="text-base leading-none" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>
          {current.flag}
        </span>
        <span
          className="font-mono font-bold text-xs tracking-wide"
          style={{ color: 'var(--text-100, #fff)', letterSpacing: '0.06em' }}
        >
          {current.code}
        </span>
        <span
          className="hidden sm:inline-flex items-center justify-center font-mono font-bold text-[10px] px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(232,0,61,0.15)', color: '#E8003D', minWidth: '18px' }}
        >
          {current.symbol}
        </span>
        <span style={{ color: 'var(--text-60, #888)', marginLeft: '1px' }}>
          <CHEVRON open={isOpen} />
        </span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 z-50 overflow-hidden"
            style={{
              width: '192px',
              background: 'var(--surface-0, #0a0a0f)',
              border: '1px solid var(--border, #1e293b)',
              borderRadius: '10px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            <div
              className="px-4 pt-3 pb-2 text-[9px] font-bold tracking-[0.18em] uppercase"
              style={{ color: 'var(--text-40, #555)' }}
            >
              Select Currency
            </div>
            <div style={{ height: '1px', background: 'var(--border, #1e293b)', margin: '0 12px' }} />

            <div className="py-1.5">
              {currencies.map((c, i) => {
                const isActive = c.code === currency;
                return (
                  <motion.button
                    key={c.code}
                    role="option"
                    aria-selected={isActive}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.15 }}
                    onClick={() => { setCurrency(c.code); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150"
                    style={{
                      background: isActive ? 'rgba(232,0,61,0.08)' : 'transparent',
                      borderLeft: isActive ? '2px solid #E8003D' : '2px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'var(--surface-1, #1e293b)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isActive ? 'rgba(232,0,61,0.08)' : 'transparent';
                    }}
                  >
                    <span className="text-xl leading-none shrink-0">{c.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-bold text-sm leading-tight"
                        style={{ color: isActive ? '#E8003D' : 'var(--text-100, #fff)', fontFamily: 'Outfit, sans-serif' }}
                      >
                        {c.code}
                      </div>
                      <div className="text-[10px] leading-tight truncate" style={{ color: 'var(--text-60, #888)' }}>
                        {c.name}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center justify-center w-5">
                      {isActive ? (
                        <CHECK />
                      ) : (
                        <span className="font-mono text-xs" style={{ color: 'var(--text-40, #555)' }}>
                          {c.symbol}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}