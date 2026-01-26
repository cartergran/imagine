/**
  - blocklist for offensive initials
  - curated list of 2-4 character combinations that should be rejected
*/

// offensive terms blocklist (uppercase for comparison)
// includes common slurs, profanity, and offensive abbreviations

const BLOCKED_INITIALS: Set<string> = new Set([
  // 2-letter
  'FK',
  'FU',

  // 3-letter
  'ASS',
  'CNT',
  'COK',
  'CUM',
  'DIK',
  'DIX',
  'FAG',
  'FCK',
  'FKU',
  'FUC',
  'FUK',
  'FUQ',
  'GAY',
  'GFY',
  'JEW',
  'JIZ',
  'KKK',
  'KYS',
  'NIG',
  'PIS',
  'POO',
  'PUS',
  'SEX',
  'SHT',
  'STD',
  'TIT',
  'WTF',
  'XXX',

  // 4-letter
  'ANAL',
  'ANUS',
  'CLIT',
  'COCK',
  'COON',
  'CRAP',
  'CUNT',
  'DAMN',
  'DICK',
  'DIKE',
  'DYKE',
  'FUCK',
  'HOMO',
  'JIZZ',
  'KIKE',
  'KUNT',
  'MILF',
  'NAZI',
  'NIGA',
  'NIGG',
  'PAKI',
  'PISS',
  'POON',
  'POOP',
  'PORN',
  'PUSS',
  'RAPE',
  'SEXY',
  'SHIT',
  'SLUT',
  'SMEG',
  'SPIC',
  'STFU',
  'TITS',
  'TWAT',
  'WANK',
]);

/**
  - checks if initials are in the blocklist
  - @param initials - the initials to check (will be normalized to uppercase)
  - @returns true if initials are blocked, false otherwise
*/
export function isBlockedInitials(initials: string): boolean {
  if (typeof initials !== 'string') {
    return false;
  }

  const normalized = initials.toUpperCase();
  return BLOCKED_INITIALS.has(normalized);
}
