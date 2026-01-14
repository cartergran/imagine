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
