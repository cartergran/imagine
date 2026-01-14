declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // server
      readonly PORT?: string;
      readonly NODE_ENV?: 'dev' | 'prod';
      readonly ACCESS_URL?: string;

      // puzzle
      readonly BASE_PIXELATION?: string;
      readonly PUZZLE_NUM: string;
      readonly IMG_FILE_NAME: string;
      readonly INTEL_FILE_NAME: string;

      // GCS
      readonly BUCKET_NAME: string;
      readonly GCS_KEY_BASE64: string;

      // Heroku
      readonly HEROKU_API_TOKEN: string;
      readonly HEROKU_APP_NAME: string;
    }
  }
}

// common pattern to ensure file is a module
export {};
