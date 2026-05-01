import { useState, useEffect } from 'react';

const CACHE_KEY = 'sb_tz';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function useTimezone() {
  const [timezone, setTimezone] = useState(() => {
    // Immediately use cached or browser fallback — no flash
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.tz;
    } catch {}
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  useEffect(() => {
    const cached = (() => {
      try { return JSON.parse(localStorage.getItem(CACHE_KEY)); } catch {}
    })();
    if (cached && Date.now() - cached.ts < CACHE_TTL) return; // still fresh

    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        const tz = data.timezone;
        if (!tz) return;
        localStorage.setItem(CACHE_KEY, JSON.stringify({ tz, ts: Date.now() }));
        setTimezone(tz);
      })
      .catch(() => {/* stay on browser default */});
  }, []);

  return timezone;
}