import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { admin as adminApi } from '../../api';
import { useStore } from '../../store';
import AdminShell from './AdminShell';

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_CFG = {
  SCHEDULED:   { label: 'Scheduled',   dot: '#38bdf8', bg: 'rgba(56,189,248,0.08)',  border: 'rgba(56,189,248,0.25)',  text: '#7dd3fc' },
  LIVE:        { label: 'Live',         dot: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.3)',   text: '#86efac', pulse: true },
  HALF_TIME:   { label: 'Half Time',   dot: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)',  text: '#fcd34d' },
  SECOND_HALF: { label: '2nd Half',    dot: '#fb923c', bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.25)',  text: '#fdba74', pulse: true },
  FINISHED:    { label: 'Full Time',   dot: '#ffffff30', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', text: '#ffffff40' },
};

const NEXT_STATUSES = {
  SCHEDULED:   ['LIVE'],
  LIVE:        ['HALF_TIME', 'FINISHED'],
  HALF_TIME:   ['SECOND_HALF'],
  SECOND_HALF: ['FINISHED'],
  FINISHED:    [],
};

// ── Suggested leagues ──────────────────────────────────────────────────────

const LEAGUE_SUGGESTIONS = [
  'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
  'Champions League', 'Europa League', 'FA Cup', 'Carabao Cup',
  'Copa del Rey', 'DFB Pokal', 'Coppa Italia', 'MLS', 'Eredivisie',
  'Primeira Liga', 'Scottish Premiership', 'Super Lig', 'Brasileirão',
  'Argentine Primera', 'Ghana Premier League', 'CAF Champions League',
  'AFCON', 'World Cup', 'Euro 2024', 'Nations League', 'Africa Cup',
  'SpeedBet Special', 'SpeedBet Invitational', 'Friendly',
];

function formatKickoff(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ── Image upload helper — uploads file, returns object URL for preview ─────
// In production you'd upload to your CDN; here we use a local object URL
// so the preview works, and also accept a direct URL input as fallback.
function useImageUpload() {
  const upload = useCallback(async (file) => {
    // Create a local preview URL immediately
    const previewUrl = URL.createObjectURL(file);
    // In a real setup you'd POST to /api/upload and get back a CDN URL.
    // For now we return the object URL so the admin can preview,
    // and a note that production should wire this to an actual upload endpoint.
    return previewUrl;
  }, []);

  return { upload };
}

// ── Logo input with upload + URL fallback ──────────────────────────────────

function LogoInput({ label, value, onChange }) {
  const fileRef = useRef(null);
  const { upload } = useImageUpload();
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = await upload(file);
    onChange(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
          {label}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {['upload', 'url'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4,
                border: '1px solid',
                borderColor: mode === m ? 'rgba(99,210,255,0.5)' : 'rgba(255,255,255,0.1)',
                background: mode === m ? 'rgba(99,210,255,0.1)' : 'transparent',
                color: mode === m ? '#63d2ff' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {m === 'upload' ? '📁 Upload' : '🔗 URL'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Preview */}
        <div style={{
          width: 48, height: 48, borderRadius: 10, flexShrink: 0,
          background: 'rgba(255,255,255,0.04)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {value ? (
            <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <span style={{ fontSize: 18, opacity: 0.3 }}>🏟️</span>
          )}
        </div>

        {/* Input area */}
        <div style={{ flex: 1 }}>
          {mode === 'upload' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `1.5px dashed ${dragging ? '#63d2ff' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
                background: dragging ? 'rgba(99,210,255,0.05)' : 'rgba(255,255,255,0.03)',
                transition: 'all 0.15s', textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 11, color: dragging ? '#63d2ff' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                {dragging ? 'Drop it!' : 'Click or drag image here'}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/logo.png"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '10px 14px',
                color: '#fff', fontSize: 12, outline: 'none',
                transition: 'border-color 0.15s', boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(99,210,255,0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          )}
        </div>

        {/* Clear */}
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,71,87,0.15)', border: '1px solid rgba(255,71,87,0.3)',
              color: '#ff4757', fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        )}
      </div>
    </div>
  );
}

// ── League autocomplete input ──────────────────────────────────────────────

function LeagueInput({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);

  const filtered = LEAGUE_SUGGESTIONS.filter((l) =>
    l.toLowerCase().includes(value.toLowerCase()) && l !== value
  ).slice(0, 8);

  const showDropdown = focused && (value.length === 0 || filtered.length > 0);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
        League
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="Premier League, La Liga…"
        style={{
          width: '100%', background: 'rgba(255,255,255,0.04)',
          border: `1.5px solid ${focused ? 'rgba(99,210,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 8, padding: '10px 14px',
          color: '#fff', fontSize: 13, outline: 'none',
          transition: 'border-color 0.15s', boxSizing: 'border-box',
        }}
      />
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
              background: '#13131f',
              border: '1.5px solid rgba(99,210,255,0.2)',
              borderRadius: 10, overflow: 'hidden',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            }}
          >
            {(value.length === 0 ? LEAGUE_SUGGESTIONS.slice(0, 8) : filtered).map((l) => (
              <button
                key={l}
                type="button"
                onMouseDown={() => { onChange(l); setFocused(false); }}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '9px 14px', fontSize: 12, fontWeight: 600,
                  color: 'rgba(255,255,255,0.75)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99,210,255,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {l.includes('SpeedBet') ? (
                  <span>⚡ {l}</span>
                ) : l.includes('World') || l.includes('AFCON') || l.includes('Nations') || l.includes('Euro') || l.includes('Africa') ? (
                  <span>🌍 {l}</span>
                ) : (
                  <span>🏆 {l}</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Styled field wrappers ──────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function StyledInput({ value, onChange, placeholder, type = 'text', min }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      min={min}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%', background: 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${focused ? 'rgba(99,210,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 8, padding: '10px 14px',
        color: '#fff', fontSize: 13, outline: 'none',
        transition: 'border-color 0.15s', boxSizing: 'border-box',
      }}
    />
  );
}

function StyledSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%', background: '#1a1a2e',
        border: '1.5px solid rgba(255,255,255,0.1)',
        borderRadius: 8, padding: '10px 14px',
        color: '#fff', fontSize: 13, outline: 'none',
        cursor: 'pointer', boxSizing: 'border-box',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: 36,
      }}
    >
      {children}
    </select>
  );
}

// ── Create Modal ───────────────────────────────────────────────────────────

const BLANK_FORM = {
  homeTeam: '', awayTeam: '',
  league: '', sport: 'football',
  homeLogo: '', awayLogo: '', leagueLogo: '',
  kickoffDate: '', kickoffTime: '',
  status: 'SCHEDULED', featured: false,
};

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = teams, 2 = details
  const pushToast = useStore((s) => s.pushToast);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const canNext = form.homeTeam.trim() && form.awayTeam.trim();

  const create = async () => {
    if (!canNext) { setError('Home and away team names are required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        homeTeam: form.homeTeam.trim(),
        awayTeam: form.awayTeam.trim(),
        league: form.league?.trim() || undefined,
        sport: form.sport || 'football',
        homeLogo: form.homeLogo?.trim() || undefined,
        awayLogo: form.awayLogo?.trim() || undefined,
        leagueLogo: form.leagueLogo?.trim() || undefined,
        status: form.status || 'SCHEDULED',
        featured: form.featured,
      };
      if (form.kickoffDate && form.kickoffTime) {
        payload.kickoffAt = new Date(`${form.kickoffDate}T${form.kickoffTime}:00`).toISOString();
      } else if (form.kickoffDate) {
        payload.kickoffAt = new Date(`${form.kickoffDate}T00:00:00`).toISOString();
      }
      const match = await adminApi.createMatch(payload);
      pushToast({ variant: 'win', title: 'Match created', message: `${match.homeTeam} vs ${match.awayTeam}` });
      onCreated(match);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create match');
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          style={{
            width: '100%', maxWidth: 560,
            background: 'linear-gradient(160deg, #0f0f1a 0%, #13131f 60%, #0d0d18 100%)',
            border: '1.5px solid rgba(99,210,255,0.15)',
            borderRadius: 18,
            boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
            overflow: 'hidden',
            maxHeight: '90vh',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#63d2ff', marginBottom: 4 }}>
                ⚡ SpeedBet Admin
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
                Create Match
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Step indicator */}
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2].map((s) => (
                  <div key={s} style={{
                    width: s === step ? 20 : 6, height: 6,
                    borderRadius: 3,
                    background: s === step ? '#63d2ff' : s < step ? 'rgba(99,210,255,0.4)' : 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s',
                  }} />
                ))}
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
                  fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >×</button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                >
                  {/* Matchup preview */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
                  }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      {form.homeLogo ? (
                        <img src={form.homeLogo} alt="" style={{ width: 40, height: 40, objectFit: 'contain', margin: '0 auto 6px', display: 'block' }}
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', margin: '0 auto 6px',
                          background: 'rgba(99,210,255,0.1)', border: '1.5px solid rgba(99,210,255,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 800, color: '#63d2ff',
                        }}>
                          {form.homeTeam ? form.homeTeam.slice(0, 3).toUpperCase() : '?'}
                        </div>
                      )}
                      <div style={{ fontSize: 12, fontWeight: 700, color: form.homeTeam ? '#fff' : 'rgba(255,255,255,0.2)' }}>
                        {form.homeTeam || 'Home'}
                      </div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>VS</div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      {form.awayLogo ? (
                        <img src={form.awayLogo} alt="" style={{ width: 40, height: 40, objectFit: 'contain', margin: '0 auto 6px', display: 'block' }}
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', margin: '0 auto 6px',
                          background: 'rgba(255,71,87,0.1)', border: '1.5px solid rgba(255,71,87,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 800, color: '#ff4757',
                        }}>
                          {form.awayTeam ? form.awayTeam.slice(0, 3).toUpperCase() : '?'}
                        </div>
                      )}
                      <div style={{ fontSize: 12, fontWeight: 700, color: form.awayTeam ? '#fff' : 'rgba(255,255,255,0.2)' }}>
                        {form.awayTeam || 'Away'}
                      </div>
                    </div>
                  </div>

                  {/* Team names */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Home Team *">
                      <StyledInput value={form.homeTeam} onChange={(e) => set('homeTeam', e.target.value)} placeholder="Man City" />
                    </Field>
                    <Field label="Away Team *">
                      <StyledInput value={form.awayTeam} onChange={(e) => set('awayTeam', e.target.value)} placeholder="Arsenal" />
                    </Field>
                  </div>

                  {/* Logos */}
                  <LogoInput label="Home Team Logo" value={form.homeLogo} onChange={(v) => set('homeLogo', v)} />
                  <LogoInput label="Away Team Logo" value={form.awayLogo} onChange={(v) => set('awayLogo', v)} />
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                >
                  {/* League with autocomplete */}
                  <LeagueInput value={form.league} onChange={(v) => set('league', v)} />

                  {/* League logo */}
                  <LogoInput label="League Logo (optional)" value={form.leagueLogo} onChange={(v) => set('leagueLogo', v)} />

                  {/* Sport */}
                  <Field label="Sport">
                    <StyledSelect value={form.sport} onChange={(e) => set('sport', e.target.value)}>
                      <option value="football">⚽ Football</option>
                      <option value="basketball">🏀 Basketball</option>
                      <option value="tennis">🎾 Tennis</option>
                      <option value="rugby">🏉 Rugby</option>
                      <option value="cricket">🏏 Cricket</option>
                      <option value="other">🎯 Other</option>
                    </StyledSelect>
                  </Field>

                  {/* Kickoff */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Kickoff Date">
                      <StyledInput type="date" value={form.kickoffDate} onChange={(e) => set('kickoffDate', e.target.value)} />
                    </Field>
                    <Field label="Kickoff Time">
                      <StyledInput type="time" value={form.kickoffTime} onChange={(e) => set('kickoffTime', e.target.value)} />
                    </Field>
                  </div>

                  {/* Initial status */}
                  <Field label="Initial Status">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                      {['SCHEDULED', 'LIVE', 'HALF_TIME', 'SECOND_HALF'].map((s) => {
                        const cfg = STATUS_CFG[s];
                        const selected = form.status === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => set('status', s)}
                            style={{
                              padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                              border: `1.5px solid ${selected ? cfg.border : 'rgba(255,255,255,0.08)'}`,
                              background: selected ? cfg.bg : 'transparent',
                              color: selected ? cfg.text : 'rgba(255,255,255,0.35)',
                              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                              textTransform: 'uppercase', transition: 'all 0.15s',
                              display: 'flex', alignItems: 'center', gap: 6,
                            }}
                          >
                            <span style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: selected ? cfg.dot : 'rgba(255,255,255,0.15)',
                              flexShrink: 0,
                            }} />
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  {/* Featured toggle */}
                  <button
                    type="button"
                    onClick={() => set('featured', !form.featured)}
                    style={{
                      padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                      border: `1.5px solid ${form.featured ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      background: form.featured ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.18s', width: '100%',
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: form.featured ? '#fbbf24' : 'rgba(255,255,255,0.6)', marginBottom: 2 }}>
                        ⭐ Feature in hero carousel
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                        Show this match in the homepage hero
                      </div>
                    </div>
                    <div style={{
                      width: 40, height: 22, borderRadius: 11,
                      background: form.featured ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}>
                      <div style={{
                        position: 'absolute', top: 3,
                        left: form.featured ? 21 : 3,
                        width: 16, height: 16, borderRadius: '50%',
                        background: '#fff', transition: 'left 0.2s',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                      }} />
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div style={{
            padding: '14px 24px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 10, flexShrink: 0,
          }}>
            {error && (
              <div style={{
                flex: 1, padding: '8px 12px', borderRadius: 8,
                background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)',
                fontSize: 11, color: '#ff6b7a', fontWeight: 600,
              }}>
                {error}
              </div>
            )}
            {!error && (
              <>
                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      padding: '10px 20px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.1)',
                      background: 'transparent', color: 'rgba(255,255,255,0.5)',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em',
                    }}
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={step === 1 ? () => { if (canNext) setStep(2); else setError('Team names are required.'); } : create}
                  disabled={saving}
                  style={{
                    flex: 1, padding: '12px 20px', borderRadius: 9,
                    background: saving ? 'rgba(99,210,255,0.2)' : 'linear-gradient(135deg, #63d2ff, #3891ff)',
                    border: 'none', color: saving ? 'rgba(255,255,255,0.5)' : '#fff',
                    fontSize: 13, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    boxShadow: saving ? 'none' : '0 4px 20px rgba(99,210,255,0.3)',
                    transition: 'all 0.18s',
                  }}
                >
                  {saving ? 'Creating…' : step === 1 ? 'Next: Details →' : '✓ Create Match'}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Score Modal ────────────────────────────────────────────────────────────

function ScoreModal({ match, onClose, onSaved }) {
  const [home, setHome] = useState(String(match.scoreHome ?? 0));
  const [away, setAway] = useState(String(match.scoreAway ?? 0));
  const [minute, setMinute] = useState(String(match.minutePlayed ?? ''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const pushToast = useStore((s) => s.pushToast);

  const save = async () => {
    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) { setError('Scores must be non-negative.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = { scoreHome: h, scoreAway: a };
      if (minute.trim()) payload.minutePlayed = parseInt(minute, 10);
      const updated = await adminApi.updateMatchScore(match.id, payload);
      pushToast({ variant: 'win', title: 'Score updated', message: `${updated.scoreHome}–${updated.scoreAway}` });
      onSaved(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update score');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            width: '100%', maxWidth: 380,
            background: 'linear-gradient(160deg, #0f0f1a, #13131f)',
            border: '1.5px solid rgba(74,222,128,0.2)',
            borderRadius: 18, padding: 24,
            boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4ade80', marginBottom: 4 }}>
                🟢 Live Score
              </div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#fff' }}>Update Score</h3>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer' }}>×</button>
          </div>

          {/* Score inputs */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '20px 16px', marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {match.homeTeam}
                </div>
                <input
                  type="number" min={0} value={home}
                  onChange={(e) => setHome(e.target.value)}
                  style={{
                    width: '100%', textAlign: 'center', fontSize: 36, fontWeight: 900,
                    fontFamily: 'monospace', color: '#fff', background: 'rgba(255,255,255,0.06)',
                    border: '2px solid rgba(99,210,255,0.3)', borderRadius: 10,
                    padding: '8px 4px', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.2)', fontWeight: 900, flexShrink: 0 }}>–</div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {match.awayTeam}
                </div>
                <input
                  type="number" min={0} value={away}
                  onChange={(e) => setAway(e.target.value)}
                  style={{
                    width: '100%', textAlign: 'center', fontSize: 36, fontWeight: 900,
                    fontFamily: 'monospace', color: '#fff', background: 'rgba(255,255,255,0.06)',
                    border: '2px solid rgba(255,71,87,0.3)', borderRadius: 10,
                    padding: '8px 4px', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Minute */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
              Minute (optional)
            </div>
            <input
              type="number" min={1} max={120} value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="e.g. 67"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8,
                padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {error && <p style={{ color: '#f87171', fontSize: 11, marginBottom: 12 }}>{error}</p>}

          <button
            onClick={save} disabled={saving}
            style={{
              width: '100%', padding: '13px', borderRadius: 10, border: 'none',
              background: saving ? 'rgba(74,222,128,0.2)' : 'linear-gradient(135deg, #4ade80, #22c55e)',
              color: saving ? 'rgba(255,255,255,0.4)' : '#000',
              fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 4px 20px rgba(74,222,128,0.3)',
            }}
          >
            {saving ? 'Saving…' : '✓ Save Score'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Status Modal ───────────────────────────────────────────────────────────

function StatusModal({ match, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const pushToast = useStore((s) => s.pushToast);
  const next = NEXT_STATUSES[match.status] ?? [];
  const cfg = STATUS_CFG[match.status] ?? {};

  const transition = async (target) => {
    setSaving(true);
    setError('');
    try {
      const updated = await adminApi.updateMatchStatus(match.id, { status: target });
      pushToast({ variant: target === 'FINISHED' ? 'default' : 'win', title: 'Status updated', message: `→ ${STATUS_CFG[target]?.label ?? target}` });
      onSaved(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transition failed');
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            width: '100%', maxWidth: 360,
            background: 'linear-gradient(160deg, #0f0f1a, #13131f)',
            border: `1.5px solid ${cfg.border ?? 'rgba(255,255,255,0.1)'}`,
            borderRadius: 18, padding: 24,
            boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: cfg.text ?? '#fff', marginBottom: 4 }}>
                Match Status
              </div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#fff' }}>Transition</h3>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer' }}>×</button>
          </div>

          {/* Current status pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 99,
            background: cfg.bg, border: `1.5px solid ${cfg.border}`,
            marginBottom: 20,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: cfg.text, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {cfg.label}
            </span>
          </div>

          {next.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '20px 16px',
              background: 'rgba(255,255,255,0.03)', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🏁</div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                Match is finished — no further transitions allowed.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                Move to →
              </div>
              {next.map((s) => {
                const tc = STATUS_CFG[s] ?? {};
                const isFinish = s === 'FINISHED';
                return (
                  <button
                    key={s}
                    onClick={() => transition(s)}
                    disabled={saving}
                    style={{
                      padding: '13px 16px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer',
                      border: `1.5px solid ${tc.border}`,
                      background: tc.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.15s', opacity: saving ? 0.5 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: tc.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 800, color: tc.text, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {tc.label}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                      {isFinish ? 'End match' : 'Continue →'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {error && <p style={{ color: '#f87171', fontSize: 11, marginTop: 12 }}>{error}</p>}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Match Card ─────────────────────────────────────────────────────────────

function MatchCard({ match, index, onScoreClick, onStatusClick }) {
  const isLive     = ['LIVE', 'HALF_TIME', 'SECOND_HALF'].includes(match.status);
  const isFinished = match.status === 'FINISHED';
  const cfg        = STATUS_CFG[match.status] ?? STATUS_CFG.SCHEDULED;
  const hasScore   = match.scoreHome != null && match.scoreAway != null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
        border: `1.5px solid ${isLive ? cfg.border : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 14,
        padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 12,
        boxShadow: isLive ? `0 0 24px ${cfg.bg}` : '0 4px 16px rgba(0,0,0,0.2)',
        transition: 'box-shadow 0.3s',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Live glow strip */}
      {isLive && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${cfg.dot}, transparent)`,
          opacity: 0.8,
        }} />
      )}

      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 9px', borderRadius: 99,
          background: cfg.bg, border: `1px solid ${cfg.border}`,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: cfg.dot, flexShrink: 0,
            boxShadow: cfg.pulse ? `0 0 6px ${cfg.dot}` : 'none',
            animation: cfg.pulse ? 'pulse 1.5s infinite' : 'none',
          }} />
          <span style={{ fontSize: 9, fontWeight: 800, color: cfg.text, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {cfg.label}
          </span>
        </div>
        {match.minutePlayed != null && isLive && (
          <span style={{ fontSize: 10, fontWeight: 700, color: cfg.text, fontFamily: 'monospace' }}>
            {match.minutePlayed}'
          </span>
        )}
      </div>

      {/* Teams */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {[
          { name: match.homeTeam, logo: match.homeLogo, score: match.scoreHome, winning: hasScore && match.scoreHome > match.scoreAway },
          { name: match.awayTeam, logo: match.awayLogo, score: match.scoreAway, winning: hasScore && match.scoreAway > match.scoreHome },
        ].map(({ name, logo, score, winning }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            {/* Logo or initials */}
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {logo ? (
                <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <span style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>
                  {(name ?? '?').slice(0, 3).toUpperCase()}
                </span>
              )}
            </div>
            <span style={{
              flex: 1, fontSize: 12, fontWeight: winning ? 700 : 500,
              color: winning ? '#fff' : 'rgba(255,255,255,0.65)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {name}
            </span>
            {hasScore && (
              <span style={{
                fontSize: 16, fontWeight: 900, fontFamily: 'monospace',
                color: isLive ? cfg.text : (winning ? '#fff' : 'rgba(255,255,255,0.5)'),
                flexShrink: 0, minWidth: 16, textAlign: 'right',
              }}>{score}</span>
            )}
          </div>
        ))}
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {match.league && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            🏆 {match.league}
          </span>
        )}
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace' }}>
          {formatKickoff(match.kickoffAt)}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 7, marginTop: 'auto' }}>
        <button
          onClick={() => onScoreClick(match)}
          disabled={!isLive}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: isLive ? 'pointer' : 'not-allowed',
            background: isLive ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
            color: isLive ? '#4ade80' : 'rgba(255,255,255,0.2)',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            border: `1px solid ${isLive ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.06)'}`,
            transition: 'all 0.15s',
          }}
        >
          ⚽ Score
        </button>
        <button
          onClick={() => onStatusClick(match)}
          disabled={isFinished}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: isFinished ? 'not-allowed' : 'pointer',
            background: isFinished ? 'rgba(255,255,255,0.02)' : 'rgba(99,210,255,0.1)',
            color: isFinished ? 'rgba(255,255,255,0.15)' : '#63d2ff',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            border: `1px solid ${isFinished ? 'rgba(255,255,255,0.04)' : 'rgba(99,210,255,0.2)'}`,
            transition: 'all 0.15s',
          }}
        >
          ⚡ Status
        </button>
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

const TABS = ['ALL', 'SCHEDULED', 'LIVE', 'FINISHED'];

export default function CustomGames() {
  const [matchList, setMatchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [scoreTarget, setScoreTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const pushToast = useStore((s) => s.pushToast);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await adminApi.listMyMatches();
      setMatchList(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load matches';
      setLoadError(msg);
      pushToast({ variant: 'error', title: 'Load failed', message: msg });
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => { load(); }, [load]);

  const upsert = (updated) =>
    setMatchList((prev) =>
      prev.some((m) => m.id === updated.id)
        ? prev.map((m) => (m.id === updated.id ? updated : m))
        : [updated, ...prev]
    );

  const filtered = matchList.filter((m) => {
    if (filter === 'ALL') return true;
    if (filter === 'LIVE') return ['LIVE', 'HALF_TIME', 'SECOND_HALF'].includes(m.status);
    return m.status === filter;
  });

  const liveCount = matchList.filter((m) => ['LIVE', 'HALF_TIME', 'SECOND_HALF'].includes(m.status)).length;

  return (
    <AdminShell
      title="Match Manager"
      kicker="Admin · Matches"
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={load}
            disabled={loading}
            style={{
              padding: '8px 14px', borderRadius: 8,
              border: '1.5px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: 'rgba(255,255,255,0.5)',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
              cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {loading ? '…' : '↻ Refresh'}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: '9px 18px', borderRadius: 9,
              background: 'linear-gradient(135deg, #63d2ff, #3891ff)',
              border: 'none', color: '#fff',
              fontSize: 12, fontWeight: 800, letterSpacing: '0.06em',
              cursor: 'pointer', textTransform: 'uppercase',
              boxShadow: '0 4px 20px rgba(99,210,255,0.3)',
            }}
          >
            + New Match
          </button>
        </div>
      }
    >
      {/* Filter tabs */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 14,
      }}>
        {TABS.map((t) => {
          const count = t === 'ALL' ? matchList.length
            : t === 'LIVE' ? liveCount
            : matchList.filter((m) => m.status === t).length;
          const active = filter === t;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding: '6px 14px', borderRadius: 8,
                border: `1.5px solid ${active ? 'rgba(99,210,255,0.4)' : 'rgba(255,255,255,0.07)'}`,
                background: active ? 'rgba(99,210,255,0.1)' : 'transparent',
                color: active ? '#63d2ff' : 'rgba(255,255,255,0.35)',
                fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {t === 'LIVE' && liveCount > 0 && (
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
              )}
              {t} {count > 0 && <span style={{ opacity: 0.6 }}>({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse" style={{
              height: 180, borderRadius: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1.5px solid rgba(255,255,255,0.06)',
            }} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && loadError && (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16 }}>{loadError}</p>
          <button
            onClick={load}
            style={{
              padding: '9px 20px', borderRadius: 8,
              border: '1.5px solid rgba(255,255,255,0.15)',
              background: 'transparent', color: '#fff',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !loadError && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏟️</div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontWeight: 600, marginBottom: 16 }}>
            No {filter !== 'ALL' ? filter.toLowerCase() + ' ' : ''}matches yet
          </p>
          {filter === 'ALL' && (
            <button
              onClick={() => setShowCreate(true)}
              style={{
                padding: '10px 22px', borderRadius: 9,
                background: 'linear-gradient(135deg, #63d2ff, #3891ff)',
                border: 'none', color: '#fff',
                fontSize: 12, fontWeight: 800, cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              + Create your first match
            </button>
          )}
        </div>
      )}

      {/* Match grid */}
      {!loading && !loadError && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          <AnimatePresence>
            {filtered.map((m, i) => (
              <MatchCard
                key={m.id}
                match={m}
                index={i}
                onScoreClick={setScoreTarget}
                onStatusClick={setStatusTarget}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(m) => { upsert(m); setFilter('ALL'); }}
        />
      )}
      {scoreTarget && (
        <ScoreModal
          match={scoreTarget}
          onClose={() => setScoreTarget(null)}
          onSaved={upsert}
        />
      )}
      {statusTarget && (
        <StatusModal
          match={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSaved={upsert}
        />
      )}
    </AdminShell>
  );
}