import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { matches as matchesApi } from '../api';
import { useStore } from '../store';
import { Button, Card, Badge } from '../components/ui/UIKit';
import { TeamBadge } from '../components/Shared';
import { PulseIcon, ShareIcon, BellIcon, ClockIcon } from '../components/icons';
import { fmtCountdown, fmtMoneyWithCode } from '../utils';
import { fadeInUp } from '../utils/animations';

// ─── Market display labels ─────────────────────────────────────────────────────
const MARKET_CONFIG = {
  match_result:   'Match Result',
  correct_score:  'Correct Score',
  half_time:      'Half-Time',
  asian_handicap: 'Handicap',
};
const MARKET_ORDER = ['match_result', 'correct_score', 'half_time', 'asian_handicap'];

const toShort = (name) =>
  name ? (name.split(' ').pop()?.toUpperCase().slice(0, 3) || name.slice(0, 3).toUpperCase()) : '???';

// ─── parseOddsArray ───────────────────────────────────────────────────────────
function parseOddsArray(arr) {
  if (!Array.isArray(arr) || !arr.length) return {};
  const map = {};
  for (const o of arr) {
    const sel    = o.selection ?? o.outcome ?? '';
    const bookie = o.bookmaker ?? 'SpeedBet';
    const odd    = parseFloat(o.odd ?? o.value ?? o.odds ?? 0);
    if (!sel || !odd) continue;
    if (!map[sel]) map[sel] = { bookmakers: {} };
    map[sel].bookmakers[bookie] = odd;
  }
  for (const sel of Object.keys(map)) {
    const vals = Object.values(map[sel].bookmakers);
    map[sel].best = Math.max(...vals);
    map[sel].bestBookmaker = Object.keys(map[sel].bookmakers)
      .find((b) => map[sel].bookmakers[b] === map[sel].best) ?? '';
  }
  return map;
}

// ─── unwrapMatch ──────────────────────────────────────────────────────────────
function unwrapMatch(bundle) {
  if (!bundle) return null;
  const r = bundle.match ?? bundle;
  const homeName = r.homeTeam ?? '';
  const awayName = r.awayTeam ?? '';
  return {
    ...r,
    home:    { name: homeName, short: toShort(homeName), logo: r.homeLogo ?? null },
    away:    { name: awayName, short: toShort(awayName), logo: r.awayLogo ?? null },
    score:   (r.scoreHome != null && r.scoreAway != null) ? { home: r.scoreHome, away: r.scoreAway } : null,
    kickoff: r.kickoffAt ?? r.kickoff ?? null,
    minute:  bundle.detail?.data?.minute ?? r.minute ?? r.liveMinute ?? null,
    fallbackOdds: parseOddsArray(bundle.odds ?? []),
  };
}

export default function GameDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [match,   setMatch]   = useState(null);
  const [allOdds, setAllOdds] = useState({});
  const [loading, setLoading] = useState(true);
  const addToSlip = useStore((s) => s.addToSlip);
  const currency  = useStore((s) => s.currency);
  const wallet    = useStore((s) => s.wallet);
  const user      = useStore((s) => s.user);
  const slip      = useStore((s) => s.slip);
  const heroRef   = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [detailResult, oddsResult] = await Promise.allSettled([
          matchesApi.detail(id),
          matchesApi.oddsAll(id),
        ]);

        if (cancelled) return;

        if (detailResult.status === 'fulfilled') {
          const m = unwrapMatch(detailResult.value);
          setMatch(m);

          if (oddsResult.status === 'fulfilled' && oddsResult.value) {
            const raw = oddsResult.value;
            const parsed = {};
            for (const [market, arr] of Object.entries(raw)) {
              const p = parseOddsArray(Array.isArray(arr) ? arr : []);
              if (Object.keys(p).length) parsed[market] = p;
            }

            if (Object.keys(parsed).length) {
              setAllOdds(parsed);
            } else if (m?.fallbackOdds && Object.keys(m.fallbackOdds).length) {
              setAllOdds({ match_result: m.fallbackOdds });
            }
          } else if (m?.fallbackOdds && Object.keys(m.fallbackOdds).length) {
            setAllOdds({ match_result: m.fallbackOdds });
          }
        }
      } catch (err) {
        console.error('GameDetail: load failed', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => { if (heroRef.current) fadeInUp(heroRef.current); }, [match]);

  const handleOddsClick = (market, selection, odd) => {
    if (!match) return;
    addToSlip({
      id:          `sel-${match.id}-${market}-${selection}`,
      match_id:    match.id,
      match_label: `${match.home.name} vs ${match.away.name}`,
      market,
      selection,
      odds: odd,
    });
  };

  const isSelected = (market, selection) =>
    slip.some((s) => s.match_id === match?.id && s.market === market && s.selection === selection);

  if (loading) {
    return (
      <div className="max-w-screen-lg mx-auto p-8 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-xl" style={{ color: 'var(--text-60)' }}>Loading match…</div>
        </motion.div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-screen-lg mx-auto p-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="font-display text-3xl mb-4">MATCH NOT FOUND</div>
          <Button onClick={() => navigate('/')}>Go home</Button>
        </motion.div>
      </div>
    );
  }

  const isLive     = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED' || match.status === 'FT';

  return (
    <div>
      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="border-b"
        style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}>
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-5 md:py-7">

          <button onClick={() => navigate(-1)}
            className="text-sm font-medium mb-4 inline-flex items-center gap-1 transition-colors"
            style={{ color: 'var(--text-60)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-60)')}>
            ← Back
          </button>

          {/* League + status */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded"
              style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}>
              {match.league}
            </span>
            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                style={{ background: 'rgba(220,38,38,0.1)', color: '#DC2626' }}>
                <span className="live-dot" /> Live {match.minute ? `· ${match.minute}'` : ''}
              </span>
            )}
            {isFinished && (
              <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded"
                style={{ background: 'var(--surface-2)', color: 'var(--text-60)' }}>
                Full Time
              </span>
            )}
            {!isLive && !isFinished && match.kickoff && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
                <ClockIcon size={10} color="currentColor" /> {fmtCountdown(match.kickoff)}
              </span>
            )}
          </div>

          {/* Teams + Score */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-8">
            <div className="flex flex-col md:flex-row items-center md:justify-end gap-2 md:gap-4 text-center md:text-right">
              <TeamBadge team={match.home} size={56} />
              <div>
                <div className="font-display text-lg md:text-3xl font-bold" style={{ color: 'var(--text-100)' }}>
                  {match.home.name}
                </div>
                <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-60)' }}>Home</div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              {match.score != null ? (
                <div className="px-4 md:px-6 py-3 md:py-4 rounded-2xl flex items-center gap-2 md:gap-4"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <span className="font-display font-extrabold tabular-nums text-4xl md:text-6xl"
                    style={{ color: isLive ? '#DC2626' : 'var(--text-100)' }}>{match.score.home}</span>
                  <span className="text-2xl md:text-3xl" style={{ color: 'var(--text-40)' }}>·</span>
                  <span className="font-display font-extrabold tabular-nums text-4xl md:text-6xl"
                    style={{ color: isLive ? '#DC2626' : 'var(--text-100)' }}>{match.score.away}</span>
                </div>
              ) : (
                <div className="px-4 md:px-6 py-3 rounded-2xl text-center"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="font-display text-2xl font-bold" style={{ color: 'var(--text-60)' }}>VS</div>
                  {match.kickoff && (
                    <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: 'var(--text-60)' }}>
                      {new Date(match.kickoff).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center md:justify-start gap-2 md:gap-4 text-center md:text-left">
              <TeamBadge team={match.away} size={56} />
              <div>
                <div className="font-display text-lg md:text-3xl font-bold" style={{ color: 'var(--text-100)' }}>
                  {match.away.name}
                </div>
                <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-60)' }}>Away</div>
              </div>
            </div>
          </div>

          {/* Live actions */}
          {isLive && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Button variant="primary" size="sm">
                <PulseIcon size={12} color="#fff" /> Watch Live <Badge variant="vip">VIP</Badge>
              </Button>
              <Button variant="ghost" size="sm"><BellIcon size={12} /> Notify</Button>
              <Button variant="ghost" size="sm"><ShareIcon size={12} /> Share</Button>
            </div>
          )}

          {/* Quick Bet */}
          {user && !isFinished && wallet && (
            <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-60)' }}>Quick Bet</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-60)' }}>
                  Bal: {fmtMoneyWithCode(wallet?.balance ?? 0, currency)}
                </span>
              </div>
              <div className="flex gap-2">
                <input type="number" placeholder="Stake"
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-100)' }} />
                <Button variant="primary" size="sm">Bet</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ MARKETS PILLS + ODDS ══════════════════════════════════════════ */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-6">
        <OddsSection
          match={match}
          allOdds={allOdds}
          handleOddsClick={handleOddsClick}
          isSelected={isSelected}
        />
      </div>
    </div>
  );
}

// ── OddsSection — tabbed market switcher ─────────────────────────────────────
function OddsSection({ match, allOdds, handleOddsClick, isSelected }) {
  const availableMarkets = [
    ...MARKET_ORDER.filter((m) => allOdds[m] && Object.keys(allOdds[m]).length > 0),
    ...Object.keys(allOdds).filter(
      (m) => !MARKET_ORDER.includes(m) && Object.keys(allOdds[m]).length > 0
    ),
  ];

  const [activeMarket, setActiveMarket] = useState(availableMarkets[0] ?? null);

  useEffect(() => {
    if (!activeMarket && availableMarkets.length) {
      setActiveMarket(availableMarkets[0]);
    }
  }, [availableMarkets.join(',')]);

  if (!availableMarkets.length) {
    return (
      <Card className="p-8 text-center">
        <div className="text-sm" style={{ color: 'var(--text-60)' }}>
          Odds are not available for this match yet.
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Market pill tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {availableMarkets.map((market) => {
          const label = MARKET_CONFIG[market] ?? market.replace(/_/g, ' ').toUpperCase();
          const active = market === activeMarket;
          return (
            <button
              key={market}
              onClick={() => setActiveMarket(market)}
              className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-150"
              style={{
                background:  active ? 'var(--brand)' : 'var(--surface-2)',
                color:       active ? '#fff' : 'var(--text-60)',
                border:      active ? '1px solid var(--brand)' : '1px solid var(--border)',
              }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Active market block */}
      {activeMarket && allOdds[activeMarket] && (
        <MarketBlock
          key={activeMarket}
          market={activeMarket}
          marketData={allOdds[activeMarket]}
          match={match}
          handleOddsClick={handleOddsClick}
          isSelected={isSelected}
        />
      )}
    </div>
  );
}

// ── MarketBlock — one market's odds ──────────────────────────────────────────
function MarketBlock({ market, marketData, match, handleOddsClick, isSelected }) {
  const [showComparison, setShowComparison] = useState(false);

  const rawSels = Object.keys(marketData);

  let orderedSels;
  if (market === 'match_result' || market === 'half_time') {
    orderedSels = [
      rawSels.find((s) => s === match.home.name || s.toLowerCase().includes('home')),
      rawSels.find((s) => s.toLowerCase() === 'draw'),
      rawSels.find((s) => s === match.away.name || s.toLowerCase().includes('away')),
      ...rawSels.filter((s) => {
        const l = s.toLowerCase();
        return s !== match.home.name && s !== match.away.name &&
          l !== 'draw' && !l.includes('home') && !l.includes('away');
      }),
    ].filter(Boolean);
  } else {
    orderedSels = [...rawSels].sort((a, b) => {
      const na = parseFloat(a); const nb = parseFloat(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }

  const allBookmakers = [...new Set(
    rawSels.flatMap((s) => Object.keys(marketData[s]?.bookmakers ?? {}))
  )];

  const selAbbr = (sel) => {
    if (sel === match.home.name) return match.home.short;
    if (sel === match.away.name) return match.away.short;
    const l = sel.toLowerCase();
    if (l === 'draw') return 'DRAW';
    if (l.includes('home')) return match.home.short;
    if (l.includes('away')) return match.away.short;
    return sel.length > 7 ? sel.slice(0, 7) : sel;
  };

  const cols = orderedSels.length <= 2 ? 2 : orderedSels.length === 3 ? 3 : Math.min(orderedSels.length, 4);

  // ── Handicap helpers ──────────────────────────────────────────────────────
  const getHandicapParts = (sel) => {
    // Extract handicap number e.g. from "Arsenal -1.5", "-1.5", "AH -1", "Home +0.5"
    const numMatch = sel.match(/([+-]?\d+(\.\d+)?)/);
    const rawVal   = numMatch ? numMatch[1] : '';
    const handicapFmt = rawVal
      ? (rawVal.startsWith('-') ? rawVal : `+${rawVal}`)
      : '';

    // Resolve team name
    let teamName = '';
    if (sel === match.home.name || sel.toLowerCase().includes('home')) {
      teamName = match.home.name;
    } else if (sel === match.away.name || sel.toLowerCase().includes('away')) {
      teamName = match.away.name;
    } else {
      // Strip the number and AH prefix to get bare team name
      const stripped = sel.replace(/[+-]?\d+(\.\d+)?/, '').replace(/^AH\s*/i, '').trim();
      teamName = stripped || sel;
    }

    // Combined label exactly like SportyBet: "Arsenal -1.5"
    const label = handicapFmt ? `${teamName} ${handicapFmt}` : teamName;

    return { teamName, handicapFmt, label };
  };

  return (
    <div>
      {/* Subheader */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-40)' }}>
          Best available · tap to add to slip
        </div>
        {allBookmakers.length > 1 && (
          <button
            onClick={() => setShowComparison((v) => !v)}
            className="text-[10px] font-bold px-2 py-1 rounded-full border transition-colors"
            style={{
              borderColor: showComparison ? 'var(--brand)' : 'var(--border)',
              color: showComparison ? 'var(--brand)' : 'var(--text-60)',
            }}>
            {showComparison ? 'Hide' : 'Compare'} ({allBookmakers.length})
          </button>
        )}
      </div>

      {/* ── Handicap: SportyBet-style row layout ───────────────────────── */}
      {market === 'asian_handicap' ? (
        <div className="flex flex-col gap-1.5 mb-3">
          {orderedSels.map((sel) => {
            const info   = marketData[sel];
            const best   = info?.best ?? 0;
            const inSlip = isSelected(market, sel);
            const { label } = getHandicapParts(sel);

            return (
              <button
                key={sel}
                onClick={() => handleOddsClick(market, sel, best)}
                className="flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-150 hover:scale-[1.005] active:scale-95"
                style={{
                  background:  inSlip ? 'var(--brand)' : 'var(--surface-1)',
                  borderColor: inSlip ? 'var(--brand)' : 'var(--border)',
                }}>
                {/* "Arsenal -1.5" — team + handicap as one combined label */}
                <span className="text-sm font-semibold text-left"
                  style={{ color: inSlip ? '#fff' : 'var(--text-100)' }}>
                  {label}
                </span>
                {/* Odds on the far right */}
                <span className="font-display font-extrabold text-xl tabular-nums ml-4"
                  style={{ color: inSlip ? '#fff' : 'var(--text-100)' }}>
                  {best.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* ── All other markets: card grid layout ───────────────────────── */
        <div className={`grid gap-2 mb-3 ${
          cols === 2 ? 'grid-cols-2' :
          cols === 3 ? 'grid-cols-3' :
          'grid-cols-2 md:grid-cols-4'
        }`}>
          {orderedSels.map((sel) => {
            const info   = marketData[sel];
            const best   = info?.best ?? 0;
            const inSlip = isSelected(market, sel);
            return (
              <button key={sel}
                onClick={() => handleOddsClick(market, sel, best)}
                className="flex flex-col items-center gap-1.5 py-4 px-2 rounded-xl border-2 transition-all duration-150 hover:scale-[1.02] active:scale-95"
                style={{
                  background:  inSlip ? 'var(--brand)' : 'var(--surface-1)',
                  borderColor: inSlip ? 'var(--brand)' : 'var(--border)',
                }}>
                <span className="text-[9px] font-bold uppercase tracking-wide text-center leading-tight px-1"
                  style={{ color: inSlip ? 'rgba(255,255,255,0.7)' : 'var(--text-60)' }}>
                  {selAbbr(sel)}
                </span>
                <span className="font-display font-extrabold text-2xl tabular-nums leading-none"
                  style={{ color: inSlip ? '#fff' : 'var(--text-100)' }}>
                  {best.toFixed(2)}
                </span>
                {inSlip && (
                  <span className="text-[8px] font-bold uppercase tracking-wide"
                    style={{ color: 'rgba(255,255,255,0.55)' }}>
                    ✓ ADDED
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Bookmaker comparison table */}
      {showComparison && allBookmakers.length > 1 && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 280 }}>
              <thead>
                <tr style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-60)', minWidth: 80 }}>Bookmaker</th>
                  {orderedSels.map((sel) => (
                    <th key={sel} className="px-3 py-2 text-center text-[10px] font-bold"
                      style={{ color: 'var(--text-60)' }}>
                      {market === 'asian_handicap'
                        ? getHandicapParts(sel).handicapFmt || selAbbr(sel)
                        : selAbbr(sel)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allBookmakers.map((bookie, bi) => (
                  <tr key={bookie}
                    style={{ borderBottom: '1px solid var(--border)', background: bi % 2 === 0 ? 'var(--surface-0)' : 'var(--surface-1)' }}>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-100)' }}>{bookie}</span>
                    </td>
                    {orderedSels.map((sel) => {
                      const odd    = marketData[sel]?.bookmakers?.[bookie];
                      const isBest = odd != null && odd === marketData[sel]?.best;
                      return (
                        <td key={sel} className="px-3 py-2 text-center">
                          {odd != null ? (
                            <button
                              onClick={() => handleOddsClick(market, sel, odd)}
                              className="px-3 py-1.5 rounded-lg text-sm font-bold font-mono transition-all hover:scale-105"
                              style={{
                                background: isSelected(market, sel) ? 'var(--brand)' : isBest ? 'rgba(0,230,118,0.1)' : 'var(--surface-2)',
                                color: isSelected(market, sel) ? '#fff' : isBest ? '#00E676' : 'var(--text-100)',
                                border: isBest && !isSelected(market, sel) ? '1px solid rgba(0,230,118,0.25)' : '1px solid transparent',
                              }}>
                              {odd.toFixed(2)}
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-40)' }}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-1.5 text-[9px]"
            style={{ color: 'var(--text-40)', borderTop: '1px solid var(--border)' }}>
            ✦ Green = best available odd for that selection
          </div>
        </Card>
      )}
    </div>
  );
}