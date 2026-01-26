import { createHash } from 'crypto';
import type { Storage } from '@google-cloud/storage';
import type { DailyScore, GameLog, ScoresFile } from './types.js';


// constants (must match client-side scorecard.ts)

/**
  - board configuration
*/
export const BOARD_CONFIG = {
  rows: 8,
  cols: 8,
  totalTiles: 64, // rows * cols
  totalAttempts: 5,
  selectionsPerAttempt: 3,
} as const;

/**
  - scoring point values for each correctness level
*/
export const SCORE_POINTS = {
  incorrect: 0, // incorrect category guess
  category: 1, // correct category, incorrect solution
  solution: 3, // correct solution (puzzle solved)
  unselected: 5, // unselected tile bonus
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



// GCS scores file operations

/**
  - maximum retry attempts for optimistic locking conflicts
*/
const MAX_RETRY_ATTEMPTS = 3;

/**
  - scores file name constant
*/
const SCORES_FILE_NAME = 'scores.json';

/**
  - creates an empty scores file structure for a given puzzle
  - @param puzzleNum - the puzzle number
  - @returns empty ScoresFile object
*/
export function createEmptyScoresFile(puzzleNum: string): ScoresFile {
  const today = new Date().toISOString().split('T')[0] ?? '';
  return {
    puzzleNum,
    date: today,
    scores: [],
    metadata: {
      totalSubmissions: 0,
      lastUpdated: new Date().toISOString(),
    },
  };
}

/**
  - gets the GCS file path for a puzzle's scores
  - @param puzzleNum - the puzzle number
  - @returns file path string
*/
function getScoresFilePath(puzzleNum: string): string {
  return `${puzzleNum}/${SCORES_FILE_NAME}`;
}

/**
  - result type for getScoresFile including generation for optimistic locking
*/
export interface ScoresFileWithGeneration {
  data: ScoresFile;
  generation: number;
}

/**
  - reads the scores file from GCS
  - returns empty structure with generation 0 if file doesn't exist
  - @param storage - GCS Storage instance
  - @param bucketName - GCS bucket name
  - @param puzzleNum - the puzzle number
  - @returns scores file data with generation number
*/
export async function getScoresFile(
  storage: Storage,
  bucketName: string,
  puzzleNum: string
): Promise<ScoresFileWithGeneration> {
  const filePath = getScoresFilePath(puzzleNum);
  const file = storage.bucket(bucketName).file(filePath);

  try {
    // check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return {
        data: createEmptyScoresFile(puzzleNum),
        generation: 0,
      };
    }

    // get metadata first for generation number (used for optimistic locking)
    const [metadata] = await file.getMetadata();
    const generation = typeof metadata.generation === 'number'
      ? metadata.generation
      : typeof metadata.generation === 'string'
        ? parseInt(metadata.generation, 10)
        : 0;

    // download file contents
    const [contents] = await file.download();
    const data = JSON.parse(contents.toString()) as ScoresFile;

    return { data, generation };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('getScoresFile() error!', errorMessage);

    // return empty structure on error
    return {
      data: createEmptyScoresFile(puzzleNum),
      generation: 0,
    };
  }
}

/**
  - checks if a fingerprint has already submitted for the current puzzle
  - @param storage - GCS Storage instance
  - @param bucketName - GCS bucket name
  - @param puzzleNum - the puzzle number
  - @param fingerprint - the hashed fingerprint to check
  - @returns true if fingerprint has already submitted
*/
export async function hasAlreadySubmitted(
  storage: Storage,
  bucketName: string,
  puzzleNum: string,
  fingerprint: string
): Promise<boolean> {
  const { data } = await getScoresFile(storage, bucketName, puzzleNum);
  return data.scores.some((s) => s.fingerprint === fingerprint);
}

/**
  - initializes an empty scores file for a new puzzle
  - safe to call if file already exists (will not overwrite)
  - @param storage - GCS Storage instance
  - @param bucketName - GCS bucket name
  - @param puzzleNum - the puzzle number
  - @returns true if file was created or already exists
*/
export async function initializeScoresFile(
  storage: Storage,
  bucketName: string,
  puzzleNum: string
): Promise<boolean> {
  const filePath = getScoresFilePath(puzzleNum);
  const file = storage.bucket(bucketName).file(filePath);

  try {
    // check if file already exists
    const [exists] = await file.exists();
    if (exists) {
      console.log(`Scores file already exists for puzzle ${puzzleNum}`);
      return true;
    }

    // create empty scores file
    const emptyScores = createEmptyScoresFile(puzzleNum);
    const contents = JSON.stringify(emptyScores, null, 2);

    await file.save(contents, {
      contentType: 'application/json',
      // use ifGenerationMatch: 0 to avoid race condition with concurrent creates
      preconditionOpts: { ifGenerationMatch: 0 },
    });

    console.log(`Initialized scores file for puzzle ${puzzleNum}`);
    return true;
  } catch (err) {
    // 412 means file was created by another process - that's okay
    if (err instanceof Error && 'code' in err && (err as { code: number }).code === 412) {
      console.log(`Scores file already exists for puzzle ${puzzleNum} (concurrent create)`);
      return true;
    }

    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('initializeScoresFile() error!', errorMessage);
    return false;
  }
}

/**
  - result type for addScore operation
*/
export interface AddScoreResult {
  success: boolean;
  rank: number;
  totalPlayers: number;
  error?: 'ALREADY_SUBMITTED' | 'CONFLICT' | 'SAVE_FAILED';
}

/**
  - adds a score to the daily leaderboard with retry on conflict
  - @param storage - GCS Storage instance
  - @param bucketName - GCS bucket name
  - @param puzzleNum - the puzzle number
  - @param score - the score entry to add
  - @returns result with success status, rank, and total players
*/
export async function addScore(
  storage: Storage,
  bucketName: string,
  puzzleNum: string,
  score: DailyScore
): Promise<AddScoreResult> {
  for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
    // read current scores with generation
    const { data, generation } = await getScoresFile(storage, bucketName, puzzleNum);

    // check if fingerprint already submitted
    const alreadySubmitted = data.scores.some((s) => s.fingerprint === score.fingerprint);
    if (alreadySubmitted) {
      return {
        success: false,
        rank: 0,
        totalPlayers: data.scores.length,
        error: 'ALREADY_SUBMITTED',
      };
    }

    // add the new score
    data.scores.push(score);

    // sort by score descending (higher is better)
    data.scores.sort((a, b) => b.score - a.score);

    // update metadata
    data.metadata.totalSubmissions = data.scores.length;

    // find the rank of the newly added score
    const rank = data.scores.findIndex((s) => s.fingerprint === score.fingerprint) + 1;

    // attempt to save with optimistic locking
    const saved = await saveScoresFile(storage, bucketName, puzzleNum, data, generation);

    if (saved) {
      return {
        success: true,
        rank,
        totalPlayers: data.scores.length,
      };
    }

    // save failed due to conflict - retry
    console.warn(`addScore() conflict on attempt ${attempt + 1}, retrying...`);
  }

  // exhausted all retries
  console.error('addScore() exhausted all retry attempts');
  return {
    success: false,
    rank: 0,
    totalPlayers: 0,
    error: 'CONFLICT',
  };
}

/**
  - saves the scores file to GCS with optimistic locking
  - @param storage - GCS Storage instance
  - @param bucketName - GCS bucket name
  - @param puzzleNum - the puzzle number
  - @param data - the scores file data to save
  - @param generation - the expected generation number (0 for new files)
  - @returns true if save succeeded, false if generation conflict
*/
export async function saveScoresFile(
  storage: Storage,
  bucketName: string,
  puzzleNum: string,
  data: ScoresFile,
  generation: number
): Promise<boolean> {
  const filePath = getScoresFilePath(puzzleNum);
  const file = storage.bucket(bucketName).file(filePath);

  // update metadata timestamp
  data.metadata.lastUpdated = new Date().toISOString();

  const contents = JSON.stringify(data, null, 2);

  try {
    if (generation === 0) {
      // new file - use ifGenerationMatch: 0 to ensure we don't overwrite
      await file.save(contents, {
        contentType: 'application/json',
        preconditionOpts: { ifGenerationMatch: 0 },
      });
    } else {
      // existing file - use generation for optimistic locking
      await file.save(contents, {
        contentType: 'application/json',
        preconditionOpts: { ifGenerationMatch: generation },
      });
    }
    return true;
  } catch (err) {
    // check for precondition failed (412) - indicates concurrent modification
    if (err instanceof Error && 'code' in err && (err as { code: number }).code === 412) {
      console.warn('saveScoresFile() generation conflict - retry needed');
      return false;
    }

    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('saveScoresFile() error!', errorMessage);
    return false;
  }
}
