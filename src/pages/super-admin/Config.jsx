import { useState, useEffect } from 'react';
import { config as configApi } from '../../api';
import { Card, Button, SectionHeader, Input } from '../../components/ui/UIKit';
import { SettingsIcon, ShieldIcon } from '../../components/icons';
import { useStore } from '../../store';
import SuperAdminShell from './SuperAdminShell';

export default function SuperAdminConfig() {
  const [c, setC] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await configApi.get();
        if (!cancelled) {
          setC(data || {});
          setLoading(false);
        }
      } catch (err) {
        console.error('SuperAdminConfig: failed to load', err);
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);
  const [saved, setSaved] = useState(false);
  const pushToast = useStore((s) => s.pushToast);

  const save = () => {
    setSaved(true);
    pushToast({ variant: 'win', title: 'Config saved', message: 'Changes propagated platform-wide' });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SuperAdminShell title="SYSTEM CONFIG">
      <div className="space-y-6">
        <Card className="p-5 border-amber-400 bg-amber-400/5">
          <div className="flex items-start gap-3">
            <ShieldIcon size={20} color="#FFB300" />
            <div>
              <div className="text-[10px] caps text-amber-400">CRITICAL · PLATFORM-WIDE</div>
              <p className="text-white-80 text-sm">
                Changes here affect every user immediately. All edits are logged in the audit trail.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader kicker="Money" title="Wallet Settings" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Min Deposit (GHS)"
              type="number"
              value={loading ? '' : c.minDeposit || c.min_deposit || ''}
              onChange={(e) => setC({ ...c, min_deposit: +e.target.value, minDeposit: +e.target.value })}
            />
            <Input
              label="Currency"
              value={loading ? '' : c.currency || ''}
              onChange={(e) => setC({ ...c, currency: e.target.value })}
            />
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader kicker="VIP" title="Membership Settings" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="VIP Price (GHS)"
              type="number"
              value={loading ? '' : c.vipPrice || c.vip_price || ''}
              onChange={(e) => setC({ ...c, vip_price: +e.target.value, vipPrice: +e.target.value })}
            />
            <Input
              label="VIP Duration (days)"
              type="number"
              value={loading ? '' : c.vipDays || c.vip_days || ''}
              onChange={(e) => setC({ ...c, vip_days: +e.target.value, vipDays: +e.target.value })}
            />
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader kicker="Commission" title="Admin Earnings" />
          <Input
            label="Default Admin Commission (%)"
            type="number"
            value={loading ? '' : c.adminCommission || c.admin_commission || ''}
            onChange={(e) => setC({ ...c, admin_commission: +e.target.value, adminCommission: +e.target.value })}
          />
        </Card>

        <Card className="p-5">
          <SectionHeader kicker="Live preview" title="Current State" />
          {loading ? (
            <div className="text-center py-4 text-sm" style={{ color: 'var(--text-60)' }}>Loading config...</div>
          ) : (
            <pre className="bg-black-800 border border-black-700 p-4 text-xs font-mono text-electric-400 overflow-x-auto">
              {JSON.stringify(c, null, 2)}
            </pre>
          )}
        </Card>

        <div className="flex gap-2 sticky bottom-4">
          <Button variant="ghost" size="lg" className="flex-1" onClick={() => setC({})}>
            DISCARD
          </Button>
          <Button variant="primary" size="lg" className="flex-1" onClick={save}>
            <SettingsIcon size={14} /> {saved ? 'SAVED ✓' : 'SAVE CONFIG'}
          </Button>
        </div>
      </div>
    </SuperAdminShell>
  );
}
