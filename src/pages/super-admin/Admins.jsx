import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { superAdmin } from '../../api';
import { Card, Badge, Button, SectionHeader, Modal, Input, EmptyState } from '../../components/ui/UIKit';
import { ShieldIcon, PlusIcon, SearchIcon, CloseIcon } from '../../components/icons';
import { useStore } from '../../store';
import { fmtMoney } from '../../utils';
import SuperAdminShell from './SuperAdminShell';

export default function SuperAdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const pushToast = useStore((s) => s.pushToast);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await superAdmin.admins();
        if (!cancelled) {
          setAdmins(data.map((a) => ({
            ...a,
            name: `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim() || 'Admin',
          })));
          setLoading(false);
        }
      } catch (err) {
        console.error('SuperAdminAdmins: failed to load', err);
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = admins.filter((a) =>
    (a.name ?? '').toLowerCase().includes(q.toLowerCase()) ||
    (a.email ?? '').toLowerCase().includes(q.toLowerCase())
  );

  const create = async () => {
    if (!form.firstName || !form.email || !form.password)
      return pushToast({ variant: 'error', title: 'First name, email and password required' });
    if (form.password.length < 6)
      return pushToast({ variant: 'error', title: 'Password must be at least 6 characters' });

    setCreating(true);
    try {
      const newAdmin = await superAdmin.createAdmin({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      setAdmins([
        {
          ...newAdmin,
          name: `${newAdmin.firstName ?? ''} ${newAdmin.lastName ?? ''}`.trim() || form.firstName,
          referrals: 0,
          commission_month: 0,
          status: 'ACTIVE',
        },
        ...admins,
      ]);
      pushToast({ variant: 'win', title: 'Admin created', message: form.email });
      setOpen(false);
      setForm({ firstName: '', lastName: '', email: '', password: '' });
    } catch (err) {
      pushToast({ variant: 'error', title: 'Failed to create admin', message: err.message });
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = (id) => {
    setAdmins(admins.map((a) => a.id === id ? { ...a, status: a.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : a));
  };

  const remove = (id) => {
    setAdmins(admins.filter((a) => a.id !== id));
    pushToast({ variant: 'info', title: 'Admin removed' });
  };

  return (
    <SuperAdminShell actions={<Button variant="primary" size="sm" onClick={() => setOpen(true)}><PlusIcon size={12} /> ADD ADMIN</Button>}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">TOTAL ADMINS</div>
            <div className="font-mono text-3xl text-white-100 tabular-nums">{loading ? '...' : admins.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">ACTIVE</div>
            <div className="font-mono text-3xl text-emerald-500 tabular-nums">{loading ? '...' : admins.filter((a) => a.status === 'ACTIVE').length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">TOTAL COMMISSION</div>
            <div className="font-mono text-3xl text-amber-400 tabular-nums">{loading ? '...' : fmtMoney(admins.reduce((s, a) => s + (a.commission_month || 0), 0))}</div>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-black-700 flex items-center gap-3">
            <SearchIcon size={14} color="#888" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search admins…"
              className="flex-1 bg-transparent text-white-100 text-sm outline-none placeholder-white-60"
            />
          </div>
          {loading ? (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--text-60)' }}>Loading admins...</div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No admins match" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-black-800 text-[10px] caps text-white-60">
                  <th className="text-left py-2 px-4">Admin</th>
                  <th className="text-left py-2 px-4">Email</th>
                  <th className="text-right py-2 px-4">Referrals</th>
                  <th className="text-right py-2 px-4">Commission</th>
                  <th className="text-center py-2 px-4">Status</th>
                  <th className="text-right py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-black-700">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-400/20 border border-brand-400 flex items-center justify-center font-display text-sm text-brand-400" style={{ fontFamily: 'Outfit' }}>
                          {(a.name || 'A').split(' ').map((p) => p[0]).join('')}
                        </div>
                        <span className="text-white-100">{a.name || 'Admin'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white-60 text-xs">{a.email || '—'}</td>
                    <td className="py-3 px-4 text-right font-mono text-white-100 tabular-nums">{a.referrals || 0}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-500 tabular-nums">{fmtMoney(a.commission_month || 0)}</td>
                    <td className="py-3 px-4 text-center"><Badge variant={a.status === 'ACTIVE' ? 'win' : 'default'}>{a.status || 'ACTIVE'}</Badge></td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleStatus(a.id)}>{a.status === 'ACTIVE' ? 'SUSPEND' : 'ACTIVATE'}</Button>
                        <Button variant="outline" size="sm" onClick={() => remove(a.id)}><CloseIcon size={10} /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="ADD ADMIN">
        <div className="space-y-3">
          <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Jane" />
          <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@speedbet.app" />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" />
          <Button variant="primary" size="lg" className="w-full" onClick={create} disabled={creating}>
            {creating ? 'CREATING...' : 'CREATE ADMIN'}
          </Button>
        </div>
      </Modal>
    </SuperAdminShell>
  );
}