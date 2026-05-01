// ─── Top 6 league team logos (hardcoded fallbacks) ────────────────────────────
// Logo URLs from API-Football / Wikipedia / official sources

export const TOP6_LEAGUES = [
  'Premier League',
  'La Liga',
  'Bundesliga',
  'Serie A',
  'Ligue 1',
  'UEFA Champions League',
];

// Normalized team name → { logo, league }
export const TEAM_LOGOS = {
  // ── Premier League ──────────────────────────────────────────────────────────
  'manchester city':    { logo: 'https://media.api-sports.io/football/teams/50.png',  league: 'Premier League' },
  'man city':           { logo: 'https://media.api-sports.io/football/teams/50.png',  league: 'Premier League' },
  'manchester united':  { logo: 'https://media.api-sports.io/football/teams/33.png',  league: 'Premier League' },
  'man united':         { logo: 'https://media.api-sports.io/football/teams/33.png',  league: 'Premier League' },
  'man utd':            { logo: 'https://media.api-sports.io/football/teams/33.png',  league: 'Premier League' },
  'arsenal':            { logo: 'https://media.api-sports.io/football/teams/42.png',  league: 'Premier League' },
  'chelsea':            { logo: 'https://media.api-sports.io/football/teams/49.png',  league: 'Premier League' },
  'liverpool':          { logo: 'https://media.api-sports.io/football/teams/40.png',  league: 'Premier League' },
  'tottenham':          { logo: 'https://media.api-sports.io/football/teams/47.png',  league: 'Premier League' },
  'spurs':              { logo: 'https://media.api-sports.io/football/teams/47.png',  league: 'Premier League' },
  'tottenham hotspur':  { logo: 'https://media.api-sports.io/football/teams/47.png',  league: 'Premier League' },
  'newcastle':          { logo: 'https://media.api-sports.io/football/teams/34.png',  league: 'Premier League' },
  'newcastle united':   { logo: 'https://media.api-sports.io/football/teams/34.png',  league: 'Premier League' },
  'aston villa':        { logo: 'https://media.api-sports.io/football/teams/66.png',  league: 'Premier League' },
  'west ham':           { logo: 'https://media.api-sports.io/football/teams/48.png',  league: 'Premier League' },
  'west ham united':    { logo: 'https://media.api-sports.io/football/teams/48.png',  league: 'Premier League' },
  'brighton':           { logo: 'https://media.api-sports.io/football/teams/51.png',  league: 'Premier League' },
  'brighton & hove albion': { logo: 'https://media.api-sports.io/football/teams/51.png', league: 'Premier League' },
  'brentford':          { logo: 'https://media.api-sports.io/football/teams/55.png',  league: 'Premier League' },
  'fulham':             { logo: 'https://media.api-sports.io/football/teams/36.png',  league: 'Premier League' },
  'crystal palace':     { logo: 'https://media.api-sports.io/football/teams/52.png',  league: 'Premier League' },
  'wolverhampton':      { logo: 'https://media.api-sports.io/football/teams/39.png',  league: 'Premier League' },
  'wolves':             { logo: 'https://media.api-sports.io/football/teams/39.png',  league: 'Premier League' },
  'everton':            { logo: 'https://media.api-sports.io/football/teams/45.png',  league: 'Premier League' },
  'nottingham forest':  { logo: 'https://media.api-sports.io/football/teams/65.png',  league: 'Premier League' },
  "nott'm forest":      { logo: 'https://media.api-sports.io/football/teams/65.png',  league: 'Premier League' },
  'leicester':          { logo: 'https://media.api-sports.io/football/teams/46.png',  league: 'Premier League' },
  'leicester city':     { logo: 'https://media.api-sports.io/football/teams/46.png',  league: 'Premier League' },
  'southampton':        { logo: 'https://media.api-sports.io/football/teams/41.png',  league: 'Premier League' },
  'bournemouth':        { logo: 'https://media.api-sports.io/football/teams/35.png',  league: 'Premier League' },
  'ipswich':            { logo: 'https://media.api-sports.io/football/teams/57.png',  league: 'Premier League' },
  'ipswich town':       { logo: 'https://media.api-sports.io/football/teams/57.png',  league: 'Premier League' },

  // ── La Liga ─────────────────────────────────────────────────────────────────
  'real madrid':        { logo: 'https://media.api-sports.io/football/teams/541.png', league: 'La Liga' },
  'barcelona':          { logo: 'https://media.api-sports.io/football/teams/529.png', league: 'La Liga' },
  'fc barcelona':       { logo: 'https://media.api-sports.io/football/teams/529.png', league: 'La Liga' },
  'atletico madrid':    { logo: 'https://media.api-sports.io/football/teams/530.png', league: 'La Liga' },
  'atlético madrid':    { logo: 'https://media.api-sports.io/football/teams/530.png', league: 'La Liga' },
  'athletic bilbao':    { logo: 'https://media.api-sports.io/football/teams/531.png', league: 'La Liga' },
  'athletic club':      { logo: 'https://media.api-sports.io/football/teams/531.png', league: 'La Liga' },
  'real sociedad':      { logo: 'https://media.api-sports.io/football/teams/548.png', league: 'La Liga' },
  'villarreal':         { logo: 'https://media.api-sports.io/football/teams/533.png', league: 'La Liga' },
  'real betis':         { logo: 'https://media.api-sports.io/football/teams/543.png', league: 'La Liga' },
  'sevilla':            { logo: 'https://media.api-sports.io/football/teams/536.png', league: 'La Liga' },
  'valencia':           { logo: 'https://media.api-sports.io/football/teams/532.png', league: 'La Liga' },
  'celta vigo':         { logo: 'https://media.api-sports.io/football/teams/538.png', league: 'La Liga' },
  'getafe':             { logo: 'https://media.api-sports.io/football/teams/546.png', league: 'La Liga' },
  'girona':             { logo: 'https://media.api-sports.io/football/teams/547.png', league: 'La Liga' },
  'osasuna':            { logo: 'https://media.api-sports.io/football/teams/727.png', league: 'La Liga' },
  'rayo vallecano':     { logo: 'https://media.api-sports.io/football/teams/728.png', league: 'La Liga' },
  'mallorca':           { logo: 'https://media.api-sports.io/football/teams/798.png', league: 'La Liga' },
  'deportivo alaves':   { logo: 'https://media.api-sports.io/football/teams/542.png', league: 'La Liga' },
  'alaves':             { logo: 'https://media.api-sports.io/football/teams/542.png', league: 'La Liga' },
  'espanyol':           { logo: 'https://media.api-sports.io/football/teams/540.png', league: 'La Liga' },
  'leganes':            { logo: 'https://media.api-sports.io/football/teams/724.png', league: 'La Liga' },
  'valladolid':         { logo: 'https://media.api-sports.io/football/teams/720.png', league: 'La Liga' },

  // ── Bundesliga ──────────────────────────────────────────────────────────────
  'bayern munich':      { logo: 'https://media.api-sports.io/football/teams/157.png', league: 'Bundesliga' },
  'fc bayern':          { logo: 'https://media.api-sports.io/football/teams/157.png', league: 'Bundesliga' },
  'borussia dortmund':  { logo: 'https://media.api-sports.io/football/teams/165.png', league: 'Bundesliga' },
  'dortmund':           { logo: 'https://media.api-sports.io/football/teams/165.png', league: 'Bundesliga' },
  'bayer leverkusen':   { logo: 'https://media.api-sports.io/football/teams/168.png', league: 'Bundesliga' },
  'leverkusen':         { logo: 'https://media.api-sports.io/football/teams/168.png', league: 'Bundesliga' },
  'rb leipzig':         { logo: 'https://media.api-sports.io/football/teams/173.png', league: 'Bundesliga' },
  'leipzig':            { logo: 'https://media.api-sports.io/football/teams/173.png', league: 'Bundesliga' },
  'eintracht frankfurt':{ logo: 'https://media.api-sports.io/football/teams/169.png', league: 'Bundesliga' },
  'frankfurt':          { logo: 'https://media.api-sports.io/football/teams/169.png', league: 'Bundesliga' },
  'vfb stuttgart':      { logo: 'https://media.api-sports.io/football/teams/172.png', league: 'Bundesliga' },
  'stuttgart':          { logo: 'https://media.api-sports.io/football/teams/172.png', league: 'Bundesliga' },
  'sc freiburg':        { logo: 'https://media.api-sports.io/football/teams/160.png', league: 'Bundesliga' },
  'freiburg':           { logo: 'https://media.api-sports.io/football/teams/160.png', league: 'Bundesliga' },
  'borussia monchengladbach': { logo: 'https://media.api-sports.io/football/teams/163.png', league: 'Bundesliga' },
  'gladbach':           { logo: 'https://media.api-sports.io/football/teams/163.png', league: 'Bundesliga' },
  'werder bremen':      { logo: 'https://media.api-sports.io/football/teams/162.png', league: 'Bundesliga' },
  'bremen':             { logo: 'https://media.api-sports.io/football/teams/162.png', league: 'Bundesliga' },
  'union berlin':       { logo: 'https://media.api-sports.io/football/teams/182.png', league: 'Bundesliga' },
  'fc augsburg':        { logo: 'https://media.api-sports.io/football/teams/167.png', league: 'Bundesliga' },
  'augsburg':           { logo: 'https://media.api-sports.io/football/teams/167.png', league: 'Bundesliga' },
  'wolfsburg':          { logo: 'https://media.api-sports.io/football/teams/161.png', league: 'Bundesliga' },
  'vfl wolfsburg':      { logo: 'https://media.api-sports.io/football/teams/161.png', league: 'Bundesliga' },
  'hoffenheim':         { logo: 'https://media.api-sports.io/football/teams/167.png', league: 'Bundesliga' },
  'tsg hoffenheim':     { logo: 'https://media.api-sports.io/football/teams/167.png', league: 'Bundesliga' },
  'mainz':              { logo: 'https://media.api-sports.io/football/teams/164.png', league: 'Bundesliga' },
  'mainz 05':           { logo: 'https://media.api-sports.io/football/teams/164.png', league: 'Bundesliga' },
  'holstein kiel':      { logo: 'https://media.api-sports.io/football/teams/192.png', league: 'Bundesliga' },
  'heidenheim':         { logo: 'https://media.api-sports.io/football/teams/180.png', league: 'Bundesliga' },
  'st. pauli':          { logo: 'https://media.api-sports.io/football/teams/181.png', league: 'Bundesliga' },
  'bochum':             { logo: 'https://media.api-sports.io/football/teams/176.png', league: 'Bundesliga' },

  // ── Serie A ─────────────────────────────────────────────────────────────────
  'inter milan':        { logo: 'https://media.api-sports.io/football/teams/505.png', league: 'Serie A' },
  'inter':              { logo: 'https://media.api-sports.io/football/teams/505.png', league: 'Serie A' },
  'internazionale':     { logo: 'https://media.api-sports.io/football/teams/505.png', league: 'Serie A' },
  'juventus':           { logo: 'https://media.api-sports.io/football/teams/496.png', league: 'Serie A' },
  'ac milan':           { logo: 'https://media.api-sports.io/football/teams/489.png', league: 'Serie A' },
  'milan':              { logo: 'https://media.api-sports.io/football/teams/489.png', league: 'Serie A' },
  'napoli':             { logo: 'https://media.api-sports.io/football/teams/492.png', league: 'Serie A' },
  'as roma':            { logo: 'https://media.api-sports.io/football/teams/497.png', league: 'Serie A' },
  'roma':               { logo: 'https://media.api-sports.io/football/teams/497.png', league: 'Serie A' },
  'lazio':              { logo: 'https://media.api-sports.io/football/teams/487.png', league: 'Serie A' },
  'ss lazio':           { logo: 'https://media.api-sports.io/football/teams/487.png', league: 'Serie A' },
  'atalanta':           { logo: 'https://media.api-sports.io/football/teams/499.png', league: 'Serie A' },
  'fiorentina':         { logo: 'https://media.api-sports.io/football/teams/502.png', league: 'Serie A' },
  'bologna':            { logo: 'https://media.api-sports.io/football/teams/500.png', league: 'Serie A' },
  'torino':             { logo: 'https://media.api-sports.io/football/teams/503.png', league: 'Serie A' },
  'udinese':            { logo: 'https://media.api-sports.io/football/teams/494.png', league: 'Serie A' },
  'sampdoria':          { logo: 'https://media.api-sports.io/football/teams/507.png', league: 'Serie A' },
  'sassuolo':           { logo: 'https://media.api-sports.io/football/teams/488.png', league: 'Serie A' },
  'genoa':              { logo: 'https://media.api-sports.io/football/teams/495.png', league: 'Serie A' },
  'cagliari':           { logo: 'https://media.api-sports.io/football/teams/490.png', league: 'Serie A' },
  'hellas verona':      { logo: 'https://media.api-sports.io/football/teams/504.png', league: 'Serie A' },
  'verona':             { logo: 'https://media.api-sports.io/football/teams/504.png', league: 'Serie A' },
  'lecce':              { logo: 'https://media.api-sports.io/football/teams/867.png', league: 'Serie A' },
  'frosinone':          { logo: 'https://media.api-sports.io/football/teams/512.png', league: 'Serie A' },
  'como':               { logo: 'https://media.api-sports.io/football/teams/514.png', league: 'Serie A' },
  'venezia':            { logo: 'https://media.api-sports.io/football/teams/517.png', league: 'Serie A' },
  'parma':              { logo: 'https://media.api-sports.io/football/teams/511.png', league: 'Serie A' },
  'empoli':             { logo: 'https://media.api-sports.io/football/teams/511.png', league: 'Serie A' },
  'monza':              { logo: 'https://media.api-sports.io/football/teams/1579.png', league: 'Serie A' },

  // ── Ligue 1 ─────────────────────────────────────────────────────────────────
  'paris saint-germain':{ logo: 'https://media.api-sports.io/football/teams/85.png',  league: 'Ligue 1' },
  'psg':                { logo: 'https://media.api-sports.io/football/teams/85.png',  league: 'Ligue 1' },
  'paris sg':           { logo: 'https://media.api-sports.io/football/teams/85.png',  league: 'Ligue 1' },
  'marseille':          { logo: 'https://media.api-sports.io/football/teams/81.png',  league: 'Ligue 1' },
  'olympique de marseille': { logo: 'https://media.api-sports.io/football/teams/81.png', league: 'Ligue 1' },
  'lyon':               { logo: 'https://media.api-sports.io/football/teams/80.png',  league: 'Ligue 1' },
  'olympique lyonnais': { logo: 'https://media.api-sports.io/football/teams/80.png',  league: 'Ligue 1' },
  'monaco':             { logo: 'https://media.api-sports.io/football/teams/91.png',  league: 'Ligue 1' },
  'as monaco':          { logo: 'https://media.api-sports.io/football/teams/91.png',  league: 'Ligue 1' },
  'lille':              { logo: 'https://media.api-sports.io/football/teams/79.png',  league: 'Ligue 1' },
  'losc lille':         { logo: 'https://media.api-sports.io/football/teams/79.png',  league: 'Ligue 1' },
  'rennes':             { logo: 'https://media.api-sports.io/football/teams/94.png',  league: 'Ligue 1' },
  'stade rennais':      { logo: 'https://media.api-sports.io/football/teams/94.png',  league: 'Ligue 1' },
  'nice':               { logo: 'https://media.api-sports.io/football/teams/84.png',  league: 'Ligue 1' },
  'ogc nice':           { logo: 'https://media.api-sports.io/football/teams/84.png',  league: 'Ligue 1' },
  'lens':               { logo: 'https://media.api-sports.io/football/teams/116.png', league: 'Ligue 1' },
  'rc lens':            { logo: 'https://media.api-sports.io/football/teams/116.png', league: 'Ligue 1' },
  'montpellier':        { logo: 'https://media.api-sports.io/football/teams/93.png',  league: 'Ligue 1' },
  'strasbourg':         { logo: 'https://media.api-sports.io/football/teams/95.png',  league: 'Ligue 1' },
  'nantes':             { logo: 'https://media.api-sports.io/football/teams/83.png',  league: 'Ligue 1' },
  'toulouse':           { logo: 'https://media.api-sports.io/football/teams/96.png',  league: 'Ligue 1' },
  'brest':              { logo: 'https://media.api-sports.io/football/teams/113.png', league: 'Ligue 1' },
  'stade brestois':     { logo: 'https://media.api-sports.io/football/teams/113.png', league: 'Ligue 1' },
  'reims':              { logo: 'https://media.api-sports.io/football/teams/82.png',  league: 'Ligue 1' },
  'stade de reims':     { logo: 'https://media.api-sports.io/football/teams/82.png',  league: 'Ligue 1' },
  'auxerre':            { logo: 'https://media.api-sports.io/football/teams/114.png', league: 'Ligue 1' },
  'le havre':           { logo: 'https://media.api-sports.io/football/teams/1106.png',league: 'Ligue 1' },
  'angers':             { logo: 'https://media.api-sports.io/football/teams/119.png', league: 'Ligue 1' },
  'saint-etienne':      { logo: 'https://media.api-sports.io/football/teams/97.png',  league: 'Ligue 1' },

  // ── UEFA Champions League extras (clubs not in above leagues) ───────────────
  'porto':              { logo: 'https://media.api-sports.io/football/teams/212.png', league: 'UEFA Champions League' },
  'benfica':            { logo: 'https://media.api-sports.io/football/teams/211.png', league: 'UEFA Champions League' },
  'celtic':             { logo: 'https://media.api-sports.io/football/teams/264.png', league: 'UEFA Champions League' },
  'rangers':            { logo: 'https://media.api-sports.io/football/teams/257.png', league: 'UEFA Champions League' },
  'ajax':               { logo: 'https://media.api-sports.io/football/teams/194.png', league: 'UEFA Champions League' },
  'psv':                { logo: 'https://media.api-sports.io/football/teams/197.png', league: 'UEFA Champions League' },
  'psv eindhoven':      { logo: 'https://media.api-sports.io/football/teams/197.png', league: 'UEFA Champions League' },
  'feyenoord':          { logo: 'https://media.api-sports.io/football/teams/193.png', league: 'UEFA Champions League' },
  'shakhtar donetsk':   { logo: 'https://media.api-sports.io/football/teams/228.png', league: 'UEFA Champions League' },
  'dynamo kyiv':        { logo: 'https://media.api-sports.io/football/teams/230.png', league: 'UEFA Champions League' },
  'anderlecht':         { logo: 'https://media.api-sports.io/football/teams/235.png', league: 'UEFA Champions League' },
  'club brugge':        { logo: 'https://media.api-sports.io/football/teams/234.png', league: 'UEFA Champions League' },
  'sporting cp':        { logo: 'https://media.api-sports.io/football/teams/228.png', league: 'UEFA Champions League' },
  'galatasaray':        { logo: 'https://media.api-sports.io/football/teams/357.png', league: 'UEFA Champions League' },
  'fenerbahce':         { logo: 'https://media.api-sports.io/football/teams/356.png', league: 'UEFA Champions League' },
  'red bull salzburg':  { logo: 'https://media.api-sports.io/football/teams/322.png', league: 'UEFA Champions League' },
  'salzburg':           { logo: 'https://media.api-sports.io/football/teams/322.png', league: 'UEFA Champions League' },
};

/**
 * Resolve logo for a team name using the hardcoded map.
 * Does a normalized substring match so "Man City" finds "manchester city".
 */
export function resolveHardcodedLogo(teamName = '') {
  if (!teamName) return null;
  const n = teamName.toLowerCase().trim();

  // Exact match first
  if (TEAM_LOGOS[n]) return TEAM_LOGOS[n].logo;

  // Substring match (e.g. "Bayern Munich FC" → "bayern munich")
  for (const [key, val] of Object.entries(TEAM_LOGOS)) {
    if (n.includes(key) || key.includes(n)) return val.logo;
  }
  return null;
}

/**
 * Returns true if a match belongs to one of the top 6 leagues,
 * determined by checking both team names against the hardcoded map.
 */
export function isTop6LeagueMatch(homeTeam = '', awayTeam = '') {
  const hn = homeTeam.toLowerCase().trim();
  const an = awayTeam.toLowerCase().trim();
  const inMap = (n) => Object.keys(TEAM_LOGOS).some((k) => n.includes(k) || k.includes(n));
  return inMap(hn) || inMap(an);
}