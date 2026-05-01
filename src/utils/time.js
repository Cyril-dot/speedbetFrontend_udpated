export function formatKickoff(kickoff, timezone, opts = {}) {
  if (!kickoff) return null;
  return new Date(kickoff).toLocaleTimeString('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    ...opts,
  });
}

export function formatKickoffFull(kickoff, timezone) {
  if (!kickoff) return null;
  const d = new Date(kickoff);
  const date = d.toLocaleDateString('en-GB', {
    timeZone: timezone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const time = d.toLocaleTimeString('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} · ${time}`;
}