import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Splash() {
  const [show, setShow] = useState(true);
  const [stage, setStage] = useState(0); // 0: logo, 1: text, 2: loading

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 800);
    const t2 = setTimeout(() => setStage(2), 1200);
    const t3 = setTimeout(() => setShow(false), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at center, #B91C1C 0%, #991B1B 50%, #450A0A 100%)',
          }}
        >
          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100, x: Math.random() * 1200 }}
              animate={{ opacity: [0, 0.6, 0], y: -200 }}
              transition={{
                duration: 2 + Math.random() * 1.5,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute w-1 h-1 rounded-full pointer-events-none"
              style={{
                background: i % 2 ? '#EF4444' : '#FFFFFF',
                boxShadow: '0 0 8px currentColor',
              }}
            />
          ))}

          <div className="relative flex flex-col items-center" style={{ zIndex: 10 }}>
            {/* Favicon logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={stage >= 0 ? { scale: 1, rotate: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6"
            >
              <img
                src="/favicon.png"
                alt="SpeedBet"
                width={120}
                height={120}
                style={{
                  borderRadius: '24px',
                  filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.5))',
                }}
              />
            </motion.div>

            {/* Logo wordmark */}
            <AnimatePresence>
              {stage >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center"
                >
                  <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                    <span style={{ color: '#FFFFFF' }}>Speed</span>
                    <span style={{
                      background: 'linear-gradient(135deg, #CCFF00, #A3E635)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>Bet</span>
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading bar */}
            <AnimatePresence>
              {stage >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-8 w-64 h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.3, ease: 'easeInOut' }}
                    className="h-full"
                    style={{
                      background: 'linear-gradient(90deg, #CCFF00, #FFFFFF, #EF4444)',
                      boxShadow: '0 0 16px rgba(204,255,0,0.6)',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}