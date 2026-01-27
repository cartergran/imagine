export interface AppState {
  attemptsLeft: number;
  correctCategory: boolean;
  correctSolution: boolean;
  solvable: boolean;
  guesses: string[];
}

export type TilesPropsMap = Map<string, { color: string; attempt: number }>;



// leaderboard types

/**
  - single entry in the leaderboard response
*/
export interface LeaderboardEntry {
  rank: number;
  initials: string;
  score: number;
  timestamp: string;
}

/**
  - response for fetching the daily leaderboard
*/
export interface LeaderboardResponse {
  puzzleNum: string;
  date: string;
  entries: LeaderboardEntry[];
  totalPlayers: number;
}

/**
  - successful response after submitting a score
*/
export interface SubmitScoreSuccess {
  success: true;
  score: number;
  rank: number;
  totalPlayers: number;
}

/**
  - error codes for score submission failures
*/
export type SubmitScoreErrorCode =
  | 'ALREADY_SUBMITTED'
  | 'INVALID_INITIALS'
  | 'INVALID_LOG'
  | 'RATE_LIMITED';

/**
  - error response for score submission
*/
export interface SubmitScoreError {
  success: false;
  error: SubmitScoreErrorCode;
  message: string;
}

/**
  - union type for submit score response
*/
export type SubmitScoreResponse = SubmitScoreSuccess | SubmitScoreError;
