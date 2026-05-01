import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { games as gamesApi } from '../../api';
import { Card, Badge, Button, SectionHeader, Modal, Input } from '../../components/ui/UIKit';
import { PlayIcon, PlusIcon, BallIcon, DiceIcon, RocketIcon } from '../../components/icons';
import { useStore } from '../../store';
import AdminShell from './AdminShell';

export default function CustomGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, use local state - API endpoint for custom games needed
    setLoading(false);
  }, []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', family: 'classic', max_payout: '2x', desc: '', destination: 'arcade' });
  const pushToast = useStore((s) => s.pushToast);

  const create = () => {
    if (!form.name) return pushToast({ variant: 'error', title: 'Name required' });
    setGames([
      { slug: form.name.toLowerCase().replace(/\s+/g, '-'), name: form.name, family: form.family, max_payout: form.max_payout, desc: form.desc, destination: form.destination },
      ...games,
    ]);
    pushToast({ variant: 'win', title: 'Game created', message: `${form.name} added to ${form.destination}` });
    setOpen(false);
    setForm({ name: '', family: 'classic', max_payout: '2x', desc: '', destination: 'arcade' });
  };

  return (
    <AdminShell title="Custom Games" kicker="Admin · Custom Games" actions={<Button variant="primary" onClick={() => setOpen(true)}><PlusIcon size={14} /> NEW GAME</Button>}>
      <div>
        <SectionHeader kicker={`${games.length} games`} title="Active Games" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {games.map((g, i) => (
            <motion.div key={g.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {g.family === 'crash' ? <RocketIcon size={16} color="#E8003D" /> : g.family === 'classic' ? <DiceIcon size={16} color="#FFB300" /> : <BallIcon size={16} color="#00D4FF" />}
                  <Badge variant="default">{g.family.toUpperCase()}</Badge>
                </div>
                <h4 className="font-display text-xl text-white-100" style={{ fontFamily: 'Outfit' }}>{g.name.toUpperCase()}</h4>
                <p className="text-white-60 text-xs mb-2 line-clamp-2">{g.desc}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-500">{g.max_payout}</span>
                  <Badge variant="win">LIVE</Badge>
                </div>
                <div className="flex gap-1 mt-3">
                  <Button variant="ghost" size="sm" className="flex-1">EDIT</Button>
                  <Button variant="outline" size="sm" className="flex-1">PAUSE</Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="CREATE CUSTOM GAME">
        <div className="space-y-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Quick Roulette" />
          <div>
            <div className="text-[10px] caps text-white-60 mb-1">FAMILY</div>
            <select value={form.family} onChange={(e) => setForm({ ...form, family: e.target.value })} className="w-full bg-black-800 border-2 border-black-700 text-white-100 text-sm px-3 py-2">
              <option value="classic">Classic</option>
              <option value="crash">Crash</option>
              <option value="skill">Skill</option>
            </select>
          </div>
          <div>
            <div className="text-[10px] caps text-white-60 mb-1">DESTINATION</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setForm({ ...form, destination: 'arcade' })}
                className={`p-3 border-2 ${form.destination === 'arcade' ? 'border-crimson-400 bg-crimson-400/10' : 'border-black-700 bg-black-800'}`}
              >
                <div className="font-display text-lg text-white-100" style={{ fontFamily: 'Outfit' }}>ARCADE</div>
                <div className="text-white-60 text-xs">Games hub</div>
              </button>
              <button
                onClick={() => setForm({ ...form, destination: 'virtual' })}
                className={`p-3 border-2 ${form.destination === 'virtual' ? 'border-crimson-400 bg-crimson-400/10' : 'border-black-700 bg-black-800'}`}
              >
                <div className="font-display text-lg text-white-100" style={{ fontFamily: 'Outfit' }}>VIRTUAL</div>
                <div className="text-white-60 text-xs">Queue rotation</div>
              </button>
            </div>
          </div>
          <Input label="Max Payout" value={form.max_payout} onChange={(e) => setForm({ ...form, max_payout: e.target.value })} placeholder="10×" />
          <Input label="Description" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Spin the roulette wheel…" />
          <Button variant="primary" size="lg" className="w-full" onClick={create}>CREATE GAME</Button>
        </div>
      </Modal>
    </AdminShell>
  );
}
