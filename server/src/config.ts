import 'dotenv/config';

import { GCSCredentials, Config } from './types';

function getEnvString(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`Invalid numeric value for ${key}: ${value}. Using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

// app config
export const config: Config = {
  // server
  port: getEnvNumber('PORT', 3001),
  nodeEnv: getEnvString('NODE_ENV', 'prod'),
  accessURL: getEnvString('ACCESS_URL', 'http://localhost:3000'),

  // puzzle
  basePixelation: getEnvNumber('BASE_PIXELATION', 7),
  puzzleNum: getEnvString('PUZZLE_NUM', ''),
  imgFileName: getEnvString('IMG_FILE_NAME', ''),
  intelFileName: getEnvString('INTEL_FILE_NAME', ''),

  // GCS
  bucketName: getEnvString('BUCKET_NAME', ''),
  gcsKeyBase64: getEnvString('GCS_KEY_BASE64', ''),

  // Heroku
  herokuApiToken: getEnvString('HEROKU_API_TOKEN', ''),
  herokuAppName: getEnvString('HEROKU_APP_NAME', ''),
} as const;

export function getGCSCredentials(): GCSCredentials {
  try {
    const gcsKey = Buffer.from(config.gcsKeyBase64, 'base64').toString('utf8');
    return JSON.parse(gcsKey) as GCSCredentials;
  } catch (error) {
    throw new Error(`Failed to parse GCS credentials: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
  - validates and logs a warning for any missing required environment variables at startup
*/
export function validateConfig(): void {
  const required: Array<[keyof typeof config, string]> = [
    ['puzzleNum', 'PUZZLE_NUM'],
    ['imgFileName', 'IMG_FILE_NAME'],
    ['intelFileName', 'INTEL_FILE_NAME'],
    ['bucketName', 'BUCKET_NAME'],
    ['gcsKeyBase64', 'GCS_KEY_BASE64'],
    ['herokuApiToken', 'HEROKU_API_TOKEN'],
    ['herokuAppName', 'HEROKU_APP_NAME'],
  ];

  const missing = required.filter(([key]) => !config[key]);

  if (missing.length > 0) {
    const missingEnvVars = missing.map(([, envVar]) => envVar).join(', ');
    throw new Error(`Missing required environment variables: ${missingEnvVars}`);
  }
}
