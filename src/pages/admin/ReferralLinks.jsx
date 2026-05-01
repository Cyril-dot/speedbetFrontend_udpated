import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { admin } from '../../api';
import { Card, Badge, Button, SectionHeader, Input, Modal } from '../../components/ui/UIKit';
import { ShareIcon, PlusIcon, CheckIcon } from '../../components/icons';
import { useStore } from '../../store';
import AdminShell from './AdminShell';

export default function ReferralLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [pct, setPct] = useState(10);
  const [copiedId, setCopiedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const pushToast = useStore((s) => s.pushToast);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await admin.referralLinks();
        if (!cancelled) {
          setLinks(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('ReferralLinks: failed to load', err);
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const create = async () => {
    if (!code || !label) {
      pushToast({ variant: 'error', title: 'Code and label are required' });
      return;
    }
    setCreating(true);
    try {
      const newLink = await admin.createReferralLink({
        code: code.toUpperCase(),
        label,
        commissionPercent: pct,
      });
      setLinks((prev) => [newLink, ...prev]);
      pushToast({ variant: 'win', title: 'Link created', message: newLink.code });
      setOpen(false);
      setCode('');
      setLabel('');
      setPct(10);
    } catch (err) {
      console.error('ReferralLinks: failed to create', err);
      pushToast({ variant: 'error', title: 'Failed to create link', message: err.message });
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (link) => {
    const url = `https://speedbet.app/auth/register?ref=${link.code}`;
    navigator.clipboard?.writeText?.(url);
    setCopiedId(link.id);
    pushToast({ variant: 'win', title: 'Copied', message: url });
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <AdminShell
      title="Referral Links"
      kicker="Admin · Referrals"
      actions={
        <Button variant="primary" onClick={() => setOpen(true)}>
          <PlusIcon size={14} /> NEW LINK
        </Button>
      }
    >
      <div>
        <SectionHeader kicker={`${links.length} active`} title="Your Links" />

        {loading ? (
          <div className="text-center text-sm py-10" style={{ color: 'var(--text-60)' }}>
            Loading links...
          </div>
        ) : links.length === 0 ? (
          <div className="text-center text-sm py-10" style={{ color: 'var(--text-60)' }}>
            No referral links yet. Create one above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-2xl text-white-100 font-bold">{l.code}</span>
                    <Badge variant={l.active ? 'win' : 'default'}>
                      {l.active ? 'ACTIVE' : 'PAUSED'}
                    </Badge>
                  </div>
                  <div className="text-white-80 text-sm mb-3">{l.label}</div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] caps text-white-60">Commission</span>
                    <span className="font-mono text-emerald-500 text-xl tabular-nums">
                      {l.commissionPercent ?? l.commission_percent}%
                    </span>
                  </div>
                  <div className="bg-black-800 border border-black-700 px-3 py-2 mb-3 text-xs font-mono text-electric-400 truncate">
                    speedbet.app/auth/register?ref={l.code}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyLink(l)}
                    >
                      {copiedId === l.id
                        ? <><CheckIcon size={12} /> COPIED</>
                        : <><ShareIcon size={12} /> COPY LINK</>}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="CREATE REFERRAL LINK">
        <div className="space-y-3">
          <Input
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="MYCODE2026"
          />
          <Input
            label="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. WhatsApp groups"
          />
          <Input
            label="Commission %"
            type="number"
            value={pct}
            onChange={(e) => setPct(+e.target.value)}
          />
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={create}
            disabled={creating}
          >
            {creating ? 'CREATING...' : 'CREATE'}
          </Button>
        </div>
      </Modal>
    </AdminShell>
  );
}