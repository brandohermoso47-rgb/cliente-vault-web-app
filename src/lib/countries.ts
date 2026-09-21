// Países (ISO 3166-1 alfa-2). Los nombres salen de Intl.DisplayNames en el idioma del usuario.
const CODES = `AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW`.split(' ');

export type Country = { code: string; name: string };

export function countryList(locale = 'es'): Country[] {
  let dn: Intl.DisplayNames | null = null;
  try { dn = new Intl.DisplayNames([locale], { type: 'region' }); } catch { /* navegador antiguo */ }
  const out: Country[] = [];
  for (const code of CODES) {
    const name = dn?.of(code);
    if (name && name !== code) out.push({ code, name });
  }
  const collator = new Intl.Collator(locale);
  return out.sort((a, b) => collator.compare(a.name, b.name));
}

export function countryName(code: string | undefined | null, locale = 'es'): string {
  if (!code) return '';
  try { return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code; } catch { return code; }
}

// Sugerencia de país a partir del idioma del navegador (es-MX da MX). No usa geolocalización ni IP.
export function guessCountryCode(): string {
  const langs = typeof navigator !== 'undefined' ? (navigator.languages?.length ? navigator.languages : [navigator.language]) : [];
  for (const l of langs) {
    const m = /^[a-z]{2,3}[-_]([A-Za-z]{2})$/.exec(l || '');
    if (m && CODES.includes(m[1].toUpperCase())) return m[1].toUpperCase();
  }
  return '';
}
