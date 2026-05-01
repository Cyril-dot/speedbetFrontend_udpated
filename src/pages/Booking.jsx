import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button, SectionHeader, Input } from '../components/ui/UIKit';
import { CalendarIcon, ReceiptIcon, ShareIcon } from '../components/icons';
import { useStore } from '../store';

export default function Booking() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [redeemed, setRedeemed] = useState(null);
  const redeemBookingCode = useStore((s) => s.redeemBookingCode);
  const addToSlip = useStore((s) => s.addToSlip);
  const pushToast = useStore((s) => s.pushToast);

  const submit = () => {
    setError('');
    if (!code.trim()) {
      setError('Enter a booking code');
      return;
    }
    const result = redeemBookingCode(code.trim());
    if (result.error) {
      setError(result.error);
      return;
    }
    // Synthesize selections if missing
    const c = result.code;
    if (!c.selections) {
      c.selections = [
        { match_label: 'Arsenal vs Chelsea', market: '1X2', selection: 'HOME', odds: 2.1 },
        { match_label: 'Real Madrid vs Barcelona', market: 'BTTS', selection: 'YES', odds: 1.7 },
        { match_label: 'Inter vs Juventus', market: 'OU 2.5', selection: 'OVER', odds: 1.85 },
      ].slice(0, c.kind === 'MIXED' ? 4 : c.kind === 'BTTS' ? 1 : 2);
    }
    setRedeemed(c);
    pushToast({ variant: 'win', title: 'Code redeemed', message: `${c.selections.length} selections loaded` });
  };

  const loadSlip = () => {
    if (!redeemed) return;
    redeemed.selections.forEach((s, i) => {
      addToSlip({
        id: `bc-${redeemed.code}-${i}`,
        match_id: s.match_id || `m-${i}`,
        match_label: s.match_label || s.match || 'Booking match',
        market: s.market,
        selection: s.selection,
        odds: s.odds,
      });
    });
    pushToast({ variant: 'win', title: 'Slip loaded', message: 'Open your bet slip to confirm.' });
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-electric-400/15 to-black-950 border-b border-black-700 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-[10px] caps text-electric-400 mb-2 flex items-center gap-2">
            <CalendarIcon size={14} color="#00D4FF" /> SHARED PICKS
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-white-100 leading-none" style={{ fontFamily: 'Outfit', letterSpacing: '0.01em' }}>
            BOOKING CODES
          </h1>
          <p className="text-white-80 text-sm md:text-base mt-2 max-w-2xl">
            Type the code from your friend or our admin team. Selections load straight into your slip.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <Card className="p-6">
          <div className="text-[10px] caps text-white-60 mb-2">REDEEM A CODE</div>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. WIN-MOMENT"
              error={error}
              className="flex-1"
            />
            <Button variant="primary" size="lg" onClick={submit}>REDEEM</Button>
          </div>
          <p className="text-white-60 text-xs mt-3">Enter a booking code to load selections into your slip.</p>
        </Card>

        {redeemed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 border-crimson-400">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Badge variant="new">REDEEMED</Badge>
                  <h3 className="font-display text-2xl text-white-100 mt-2" style={{ fontFamily: 'Outfit' }}>{redeemed.code}</h3>
                </div>
                <div className="text-right">
                  <div className="text-[10px] caps text-white-60">TOTAL ODDS</div>
                  <div className="font-mono text-3xl text-crimson-400 tabular-nums">{redeemed.total_odds?.toFixed(2) || '—'}</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {redeemed.selections.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-black-800 border border-black-700">
                    <ReceiptIcon size={14} color="#888" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white-100 text-sm font-semibold truncate">{s.match_label || s.match || 'Match'}</div>
                      <div className="text-white-60 text-xs">{s.market} · <span className="text-white-100">{s.selection}</span></div>
                    </div>
                    <span className="font-mono text-sm text-white-100 tabular-nums">{s.odds.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="primary" size="lg" className="flex-1" onClick={loadSlip}>LOAD SLIP</Button>
                <Button variant="outline" size="lg">
                  <ShareIcon size={14} /> SHARE
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        <Card className="p-5">
          <SectionHeader kicker="How to use" title="Booking Codes" />
          <div className="text-sm text-white-80 space-y-2">
            <p>Booking codes are shared by admins and other users.</p>
            <p>Each code contains pre-selected bets with calculated odds.</p>
            <p className="text-white-60">Contact an admin to get the latest booking codes.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
