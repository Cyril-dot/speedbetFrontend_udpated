import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';

const BENEFITS = [
  { icon: '💯', label: '100% cashback on all bets placed' },
  { icon: '📺', label: 'Live match streams for all games' },
  { icon: '🎯', label: 'Free odds & expert tips daily' },
];

export default function VipPopup() {
  const [open, setOpen] = useState(false);
  const user = useStore((s) => s.user);
  const location = useLocation();

  useEffect(() => {
    const blocked =
      location.pathname.startsWith('/auth') ||
      location.pathname.startsWith('/admin') ||
      location.pathname.startsWith('/x-control-9f3a2b');
    if (blocked) return;
    if (user?.vip) return;

    const seen = sessionStorage.getItem('vip-popup-seen');
    if (seen) return;

    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem('vip-popup-seen', '1');
    }, 3200);
    return () => clearTimeout(t);
  }, [location.pathname, user]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="vip-popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(10,10,18,0.85)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            boxSizing: 'border-box',
          }}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 'min(380px, calc(100vw - 32px))',
              borderRadius: 16,
              overflow: 'hidden',
              background: '#0f0f1a',
              border: '1px solid rgba(255,215,80,0.15)',
              boxShadow: '0 0 40px rgba(245,185,30,0.07), 0 20px 48px rgba(0,0,0,0.6)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              boxSizing: 'border-box',
            }}
          >
            {/* ── Header ── */}
            <div style={{
              position: 'relative',
              padding: 'clamp(16px, 4vw, 22px) clamp(14px, 4vw, 20px) clamp(14px, 3vw, 18px)',
              textAlign: 'center',
              background: 'linear-gradient(160deg,#1a1230 0%,#0f0f1a 100%)',
              borderBottom: '1px solid rgba(255,215,80,0.08)',
            }}>
              <button
                onClick={close}
                aria-label="Close"
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 12,
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >✕</button>

              {/* Crown */}
              <div style={{
                width: 'clamp(40px,10vw,50px)',
                height: 'clamp(40px,10vw,50px)',
                margin: '0 auto clamp(8px,2vw,12px)',
                borderRadius: 12,
                background: 'rgba(245,185,30,0.08)',
                border: '1px solid rgba(245,185,30,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <polygon points="4,26 6,12 13,19 16,6 19,19 26,12 28,26" fill="#F5B91E" stroke="#FFE08A" strokeWidth="0.8" strokeLinejoin="round"/>
                  <rect x="4" y="26" width="24" height="3" rx="1.5" fill="#F5B91E"/>
                  <circle cx="4" cy="12" r="2" fill="#FFE08A"/>
                  <circle cx="16" cy="6" r="2" fill="#FFE08A"/>
                  <circle cx="28" cy="12" r="2" fill="#FFE08A"/>
                </svg>
              </div>

              <p style={{ margin: '0 0 3px', fontSize: 'clamp(8px,2vw,9px)', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(245,185,30,0.65)', fontWeight: 600 }}>
                Exclusive Access
              </p>
              <h2 style={{ margin: '0 0 4px', fontSize: 'clamp(20px,5vw,24px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                Go <span style={{ color: '#F5B91E' }}>VIP</span>
              </h2>
              <p style={{ margin: 0, fontSize: 'clamp(10px,2.5vw,12px)', color: 'rgba(255,255,255,0.48)', lineHeight: 1.4 }}>
                Unlock the smartest 30 days you've ever bet
              </p>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: 'clamp(14px,3.5vw,18px) clamp(14px,3.5vw,18px) clamp(16px,4vw,20px)' }}>

              <p style={{ margin: '0 0 clamp(10px,2.5vw,14px)', fontSize: 'clamp(10px,2.5vw,12px)', lineHeight: 1.6, color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
                Join <strong style={{ color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>SpeedBet VIP</strong> — perks that actually make a difference.
              </p>

              {/* Benefits */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(5px,1.5vw,7px)', marginBottom: 'clamp(12px,3vw,16px)' }}>
                {BENEFITS.map((b, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: 'clamp(9px,2.5vw,11px) clamp(10px,2.5vw,13px)',
                    borderRadius: 9,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,215,80,0.08)',
                    boxSizing: 'border-box',
                  }}>
                    <span style={{ fontSize: 'clamp(14px,3.5vw,17px)', minWidth: 22, textAlign: 'center', flexShrink: 0 }}>{b.icon}</span>
                    <span style={{ fontSize: 'clamp(11px,2.8vw,13px)', color: 'rgba(255,255,255,0.78)', fontWeight: 500, lineHeight: 1.3 }}>{b.label}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid rgba(255,215,80,0.08)', marginBottom: 'clamp(12px,3vw,16px)' }} />

              {/* Price */}
              <div style={{ textAlign: 'center', marginBottom: 'clamp(12px,3vw,16px)' }}>
                <p style={{ margin: '0 0 4px', fontSize: 'clamp(8px,2vw,9px)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>
                  30-Day Membership
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 5 }}>
                  <span style={{ fontSize: 'clamp(24px,6vw,30px)', fontWeight: 700, color: '#F5B91E', lineHeight: 1 }}>GHS 250</span>
                  <span style={{ fontSize: 'clamp(10px,2.5vw,12px)', color: 'rgba(255,255,255,0.28)' }}>/ month</span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: 'clamp(9px,2.2vw,10px)', color: 'rgba(245,185,30,0.4)' }}>≈ GHS 8.33 / day</p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 7, marginBottom: 10 }}>
                <button
                  onClick={close}
                  style={{
                    flex: 1,
                    padding: 'clamp(10px,2.5vw,12px) 6px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: 'clamp(11px,2.8vw,13px)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Maybe later
                </button>
                <Link
                  to="/app/vip"
                  onClick={close}
                  style={{
                    flex: 2,
                    padding: 'clamp(10px,2.5vw,12px) 6px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg,#F5B91E 0%,#E09010 100%)',
                    color: '#0f0f1a',
                    fontSize: 'clamp(12px,3vw,14px)',
                    fontWeight: 700,
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Become VIP →
                </Link>
              </div>

              <p style={{ margin: 0, textAlign: 'center', fontSize: 'clamp(9px,2vw,10px)', color: 'rgba(255,255,255,0.2)' }}>
                Cancel anytime &nbsp;·&nbsp; No hidden fees
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}