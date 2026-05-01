import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button, SectionHeader, Modal, Input } from '../../components/ui/UIKit';
import { CrownIcon, GiftIcon, PlusIcon } from '../../components/icons';
import { useStore } from '../../store';
import { fmtMoney, fmtTimeAgo } from '../../utils';
import SuperAdminShell from './SuperAdminShell';

const initialMembers = [
  { id: 'v-1', name: 'Yaw K.', email: 'yaw@user', joined: new Date(Date.now() - 12 * 86400000).toISOString(), expires: new Date(Date.now() + 18 * 86400000).toISOString(), gifts_used: 3 },
  { id: 'v-2', name: 'Abena M.', email: 'abena@user', joined: new Date(Date.now() - 25 * 86400000).toISOString(), expires: new Date(Date.now() + 5 * 86400000).toISOString(), gifts_used: 8 },
  { id: 'v-3', name: 'Kojo A.', email: 'kojo@user', joined: new Date(Date.now() - 5 * 86400000).toISOString(), expires: new Date(Date.now() + 25 * 86400000).toISOString(), gifts_used: 1 },
  { id: 'v-4', name: 'Esi N.', email: 'esi@user', joined: new Date(Date.now() - 40 * 86400000).toISOString(), expires: new Date(Date.now() - 10 * 86400000).toISOString(), gifts_used: 12 },
];

export default function SuperAdminVip() {
  const [members, setMembers] = useState(initialMembers);
  const [open, setOpen] = useState(false);
  const [gift, setGift] = useState({ kind: 'FREE_BET', amount: 50, boost_pct: 20 });
  const pushToast = useStore((s) => s.pushToast);

  const active = members.filter((m) => new Date(m.expires).getTime() > Date.now());
  const expired = members.filter((m) => new Date(m.expires).getTime() <= Date.now());

  const broadcast = () => {
    pushToast({
      variant: 'win',
      title: 'Gift broadcast',
      message: gift.kind === 'FREE_BET' ? `${fmtMoney(gift.amount)} free bet to ${active.length} VIPs` : `${gift.boost_pct}% boost to ${active.length} VIPs`,
    });
    setOpen(false);
  };

  return (
    <SuperAdminShell title="VIP MANAGEMENT" actions={<Button variant="primary" size="sm" onClick={() => setOpen(true)}><GiftIcon size={12} /> BROADCAST GIFT</Button>}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">ACTIVE VIPs</div>
            <div className="font-mono text-3xl text-amber-400 tabular-nums">{active.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">EXPIRED</div>
            <div className="font-mono text-3xl text-white-60 tabular-nums">{expired.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">REVENUE (MTD)</div>
            <div className="font-mono text-3xl text-emerald-500 tabular-nums">{fmtMoney(active.length * 250)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">GIFTS USED</div>
            <div className="font-mono text-3xl text-electric-400 tabular-nums">{members.reduce((s, m) => s + m.gifts_used, 0)}</div>
          </Card>
        </div>

        <SectionHeader kicker={`${active.length} active`} title="VIP Members" />
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-black-800 text-[10px] caps text-white-60">
                <th className="text-left py-2 px-4">Member</th>
                <th className="text-left py-2 px-4">Joined</th>
                <th className="text-left py-2 px-4">Expires</th>
                <th className="text-right py-2 px-4">Gifts Used</th>
                <th className="text-center py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isActive = new Date(m.expires).getTime() > Date.now();
                return (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-black-700">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <CrownIcon size={14} color="#FFB300" />
                        <div>
                          <div className="text-white-100">{m.name}</div>
                          <div className="text-white-60 text-xs">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white-60 text-xs">{fmtTimeAgo(m.joined)}</td>
                    <td className="py-3 px-4 text-white-60 text-xs">{new Date(m.expires).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-white-100 tabular-nums">{m.gifts_used}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={isActive ? 'win' : 'default'}>{isActive ? 'ACTIVE' : 'EXPIRED'}</Badge>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="BROADCAST GIFT TO ALL VIPS">
        <div className="space-y-3">
          <div>
            <div className="text-[10px] caps text-white-60 mb-1">GIFT TYPE</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setGift({ ...gift, kind: 'FREE_BET' })}
                className={`p-3 border-2 ${gift.kind === 'FREE_BET' ? 'border-crimson-400 bg-crimson-400/10' : 'border-black-700 bg-black-800'}`}
              >
                <div className="font-display text-lg text-white-100" style={{ fontFamily: 'Outfit' }}>FREE BET</div>
              </button>
              <button
                onClick={() => setGift({ ...gift, kind: 'BOOSTED_ODDS' })}
                className={`p-3 border-2 ${gift.kind === 'BOOSTED_ODDS' ? 'border-crimson-400 bg-crimson-400/10' : 'border-black-700 bg-black-800'}`}
              >
                <div className="font-display text-lg text-white-100" style={{ fontFamily: 'Outfit' }}>BOOSTED ODDS</div>
              </button>
            </div>
          </div>
          {gift.kind === 'FREE_BET' ? (
            <Input label="Amount (GHS)" type="number" value={gift.amount} onChange={(e) => setGift({ ...gift, amount: +e.target.value })} />
          ) : (
            <Input label="Boost %" type="number" value={gift.boost_pct} onChange={(e) => setGift({ ...gift, boost_pct: +e.target.value })} />
          )}
          <p className="text-white-60 text-xs">Will be issued to {active.length} active VIPs immediately.</p>
          <Button variant="primary" size="lg" className="w-full" onClick={broadcast}>BROADCAST</Button>
        </div>
      </Modal>
    </SuperAdminShell>
  );
}
