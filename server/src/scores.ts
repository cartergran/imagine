import { createHash } from 'crypto';
import type { GameLog } from './types.js';


// constants (must match client-side scorecard.ts)

/**
  - scoring point values for each correctness level
*/
export const SCORE_POINTS = {
  incorrect: 0,    // incorrect category guess
  category: 1,     // correct category, incorrect solution
  solution: 3,     // correct solution (puzzle solved)
  unselected: 5,   // unselected tile bonus
} as const;

/**
  - board configuration
*/
export const BOARD_CONFIG = {
  rows: 8,
  cols: 8,
  totalTiles: 64,           // rows * cols
  totalAttempts: 5,
  selectionsPerAttempt: 3,
} as const;

/**
  - maximum possible score
  - calculated as: (totalTiles - selectionsPerAttempt) * unselected + selectionsPerAttempt * solution
  - = (64 - 3) * 5 + 3 * 3 = 305 + 9 = 314
*/
export const MAX_SCORE = 
  (BOARD_CONFIG.totalTiles - BOARD_CONFIG.selectionsPerAttempt) * SCORE_POINTS.unselected +
  BOARD_CONFIG.selectionsPerAttempt * SCORE_POINTS.solution;



// score calculation

/**
  - calculates the score from game logs (server-side verification)
  - mirrors the client-side calcScore() logic in scorecard.ts
  - @param logs - array of game log entries
  - @returns calculated score
*/
export function calculateScoreFromLogs(logs: GameLog[]): number {
  // sum up selected tiles and their scores
  const { numSelected, selectedScore } = logs.reduce(
    (acc, log) => {
      const numTilesInLog = log.tileSelection.length;
      acc.numSelected += numTilesInLog;
      // correctness of null (not evaluated) counts as 0
      acc.selectedScore += numTilesInLog * (log.correctness ?? 0);
      return acc;
    },
    { numSelected: 0, selectedScore: 0 }
  );

  // unselected tiles get bonus points
  const unselectedScore = (BOARD_CONFIG.totalTiles - numSelected) * SCORE_POINTS.unselected;

  return selectedScore + unselectedScore;
}



// log validation

/**
  - validates the structure and constraints of game logs
  - @param logs - array of game log entries to validate
  - @returns true if logs are valid, false otherwise
*/
export function validateLogs(logs: GameLog[]): boolean {
  // must have at least one log entry (even if empty initial log)
  if (!Array.isArray(logs) || logs.length === 0) {
    return false;
  }

  // cannot exceed max attempts
  // note: logs may include an initial empty log, so we check length <= totalAttempts + 1
  if (logs.length > BOARD_CONFIG.totalAttempts + 1) {
    return false;
  }

  // track all selected tiles to detect duplicates
  const selectedTiles = new Set<string>();

  for (const log of logs) {
    // validate log structure
    if (!log || typeof log !== 'object') {
      return false;
    }

    // tileSelection must be an array
    if (!Array.isArray(log.tileSelection)) {
      return false;
    }

    // each attempt can have 0 to selectionsPerAttempt tiles
    // (0 is valid for initial empty log or incomplete attempts)
    if (log.tileSelection.length > BOARD_CONFIG.selectionsPerAttempt) {
      return false;
    }

    // validate each tile selection
    for (const tile of log.tileSelection) {
      // must have r and c properties
      if (
        typeof tile !== 'object' ||
        tile === null ||
        typeof tile.r !== 'number' ||
        typeof tile.c !== 'number'
      ) {
        return false;
      }

      // row must be within bounds
      if (tile.r < 0 || tile.r >= BOARD_CONFIG.rows) {
        return false;
      }

      // column must be within bounds
      if (tile.c < 0 || tile.c >= BOARD_CONFIG.cols) {
        return false;
      }

      // check for duplicate tile selections
      const tileKey = `${tile.r}:${tile.c}`;
      if (selectedTiles.has(tileKey)) {
        return false;
      }
      selectedTiles.add(tileKey);
    }

    // validate correctness value
    // must be null, 0 (incorrect), 1 (category), or 3 (solution)
    const correctness = log.correctness;
    const isValidCorrectness =
      correctness === null ||
      correctness === SCORE_POINTS.incorrect ||
      correctness === SCORE_POINTS.category ||
      correctness === SCORE_POINTS.solution;

    if (!isValidCorrectness) {
      return false;
    }
  }

  return true;
}



// fingerprint hashing

/**
  - hashes a raw fingerprint string using SHA-256
  - @param raw - the raw fingerprint string from the client
  - @returns hex-encoded SHA-256 hash
*/
export function hashFingerprint(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}



// initials validation

/**
  - regex pattern for valid initials: 2-4 uppercase alphanumeric characters
*/
const INITIALS_PATTERN = /^[A-Z0-9]{2,4}$/;

/**
  - validates initials format (does not check blocklist)
  - @param initials - the initials string to validate
  - @returns true if initials are valid format, false otherwise
*/
export function isValidInitials(initials: string): boolean {
  if (typeof initials !== 'string') {
    return false;
  }

  // normalize to uppercase for validation
  const normalized = initials.toUpperCase();

  return INITIALS_PATTERN.test(normalized);
}

/**
  - normalizes initials to uppercase
  - @param initials - the initials string to normalize
  - @returns uppercase initials
*/
export function normalizeInitials(initials: string): string {
  return initials.toUpperCase();
}
