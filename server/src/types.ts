import type Jimp from 'jimp';

/**
  - intel containing puzzle metadata and solution
*/
export interface Intel {
  categories: string[];
  category: string;
  subcategory: string;
  solution: string;
}

/**
  - image data containing dimensions and original / pixelated versions
*/
export interface ImgData {
  width: number;
  height: number;
  img: Jimp | null;
  base64: string;
  pixelated: Jimp[]; // descending order from most pixelated
}

/**
  - board config
*/
export interface BoardConfig {
  rows: number;
  cols: number;
}

/**
  - tiles data containing dimensions and catalog of base64-encoded tile images
*/
export interface Tiles {
  width: number;
  height: number;
  base64Catalog: string[][][]; // [attempt][row][col]
}

/**
  - query parameters for tile endpoint
*/
export interface TileQuery {
  attempt: string;
  r: string;
  c: string;
}

/**
  - query parameters for category / solution check endpoint
*/
export interface CheckQuery {
  guess: string;
}

/**
  - coordinates for a tile [row, column]
*/
export type TileLocation = [number, number];

/**
  - GCS credentials structure
*/
export interface GCSCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  [key: string]: unknown;
}

/**
  - Heroku config vars structure
*/
export interface HerokuConfigVars {
  PUZZLE_NUM: string;
  [key: string]: string;
}

/**
  - app config loaded from environment variables
*/
export interface Config {
  // server
  port: number;
  nodeEnv: string;
  accessURL: string;

  // puzzle
  basePixelation: number;
  puzzleNum: string;
  imgFileName: string;
  intelFileName: string;

  // GCS
  bucketName: string;
  gcsKeyBase64: string;

  // Heroku
  herokuApiToken: string;
  herokuAppName: string;
}



// leaderboard types

/**
  - individual score entry on the daily leaderboard
*/
export interface DailyScore {
  initials: string;
  score: number;
  deviceIdHash: string;
  timestamp: string;
}

/**
  - base leaderboard entry with shared fields
*/
export interface BaseLeaderboardEntry {
  rank: number;
  initials: string;
  score: number;
  timestamp: string;
}

/**
  - single entry in the leaderboard API response
*/
export interface LeaderboardEntry extends BaseLeaderboardEntry {
  isCurrentUser?: boolean;
}

/**
  - base leaderboard data with shared fields
*/
export interface BaseLeaderboardData {
  puzzleNum: string;
  date: string;
  totalPlayers: number;
}

/**
  - leaderboard API response
*/
export interface LeaderboardResponse extends BaseLeaderboardData {
  entries: LeaderboardEntry[];
  error?: boolean;
}

/**
  - query parameters for leaderboard endpoint
*/
export interface LeaderboardQuery {
  puzzleNum?: string;
  limit?: string;
  deviceId?: string;
}

/**
  - tile selection coordinates for a single tile
*/
export interface TileSelection {
  r: number;
  c: number;
}

/**
  - game log entry for a single attempt
  - correctness: 0 = incorrect, 1 = correct category, 3 = correct solution, null = not yet evaluated
*/
export interface GameLog {
  tileSelection: TileSelection[];
  correctness: number | null;
}

/**
  - metadata for the scores file
*/
export interface ScoresMetadata {
  totalSubmissions: number;
  lastUpdated: string;
}

/**
  - complete scores file structure stored in GCS
*/
export interface ScoresFile {
  puzzleNum: string;
  date: string;
  scores: DailyScore[];
  metadata: ScoresMetadata;
}

/**
  - request body for submitting a score
*/
export interface SubmitScoreRequest {
  initials: string;
  logs: GameLog[];
  deviceId: string;
}

/**
  - successful response after submitting a score
*/
export interface SubmitScoreResponse {
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
