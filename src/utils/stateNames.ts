/** Map of US state abbreviations to full names (lowercase for search matching) */
const STATE_MAP: Record<string, string> = {
  AL: 'alabama', AK: 'alaska', AZ: 'arizona', AR: 'arkansas',
  CA: 'california', CO: 'colorado', CT: 'connecticut', DE: 'delaware',
  DC: 'district of columbia', FL: 'florida', GA: 'georgia', HI: 'hawaii',
  ID: 'idaho', IL: 'illinois', IN: 'indiana', IA: 'iowa',
  KS: 'kansas', KY: 'kentucky', LA: 'louisiana', ME: 'maine',
  MD: 'maryland', MA: 'massachusetts', MI: 'michigan', MN: 'minnesota',
  MS: 'mississippi', MO: 'missouri', MT: 'montana', NE: 'nebraska',
  NV: 'nevada', NH: 'new hampshire', NJ: 'new jersey', NM: 'new mexico',
  NY: 'new york', NC: 'north carolina', ND: 'north dakota', OH: 'ohio',
  OK: 'oklahoma', OR: 'oregon', PA: 'pennsylvania', RI: 'rhode island',
  SC: 'south carolina', SD: 'south dakota', TN: 'tennessee', TX: 'texas',
  UT: 'utah', VT: 'vermont', VA: 'virginia', WA: 'washington',
  WV: 'west virginia', WI: 'wisconsin', WY: 'wyoming',
};

/**
 * Check if a query matches a state — works with both abbreviations
 * ("VA") and full names ("Virginia", "west virginia", etc.).
 */
export function matchesState(stateAbbrev: string, query: string): boolean {
  const q = query.toLowerCase();
  const abbr = stateAbbrev.toUpperCase();
  // Match abbreviation
  if (abbr.toLowerCase().includes(q)) return true;
  // Match full name
  const fullName = STATE_MAP[abbr];
  return !!fullName && fullName.includes(q);
}
