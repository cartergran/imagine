import cors from 'cors';
import express, { type Request, type Response, type NextFunction } from 'express';
import { fileURLToPath } from 'url';
import Jimp from 'jimp';
import path from 'path';
import { Storage } from '@google-cloud/storage';
import { scheduleJob } from 'node-schedule';

import {
  addScore,
  calculateScoreFromLogs,
  getScoresFile,
  hashFingerprint,
  isValidInitials,
  normalizeInitials,
  validateLogs,
} from './scores.js';
import { config, getGCSCredentials, validateConfig } from './config.js';
import { dailyRateLimiter, submitRateLimiter } from './rate-limit.js';
import { isBlockedInitials } from './blocklist.js';
import { updatePuzzleAndRestart } from './scheduler.js';

import type {
  BoardConfig,
  CheckQuery,
  DailyScore,
  ImgData,
  Intel,
  LeaderboardEntry,
  LeaderboardQuery,
  LeaderboardResponse,
  SubmitScoreError,
  SubmitScoreRequest,
  SubmitScoreResponse,
  TileLocation,
  TileQuery,
  Tiles,
} from './types.js';

// validate config at startup
validateConfig();

// compute derived paths
const imgPath = `${config.puzzleNum}/${config.imgFileName}`;
const intelPath = `${config.puzzleNum}/${config.intelFileName}`;

// get GCS credentials
const gcsCreds = getGCSCredentials();

// https://nodejs.org/api/esm.html#no-__filename-or-__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// initialize express app and GCS
const app = express();
const storage = new Storage({ credentials: gcsCreds });

// constants
const TOTAL_ATTEMPTS = 5;

// app state
const intel: Intel = {
  categories: [],
  category: '',
  subcategory: '',
  solution: '',
};

const imgData: ImgData = {
  width: 2002,
  height: 2002,
  img: null,
  base64: '',
  pixelated: [],
};

const board: BoardConfig = {
  rows: 8,
  cols: 8,
};

const tiles: Tiles = {
  width: imgData.width / board.rows,
  height: imgData.height / board.cols,
  base64Catalog: init3DArray(TOTAL_ATTEMPTS, board.rows, board.cols),
};

/**
  - initializes a 3D array with the specified dimensions
*/
function init3DArray(i: number, j: number, k: number): string[][][] {
  return Array.from({ length: i }, () =>
    Array.from({ length: j }, () =>
      Array<string>(k).fill('')
    )
  );
}

/**
  - downloads and processes an image from GCS
*/
async function processImg(
  bucketName: string,
  imgPath: string,
  width: number,
  height: number
): Promise<Jimp | null> {
  try {
    const imgFile = storage.bucket(bucketName).file(imgPath);
    const [imgContents] = await imgFile.download();
    const img = await Jimp.read(imgContents);
    img.contain(width, height);
    return img;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('processImg() error!', errorMessage);
    return null;
  }
}

/**
  - downloads and parses intel data from GCS
*/
async function processIntel(bucketName: string, intelPath: string): Promise<Intel | null> {
  try {
    const intelFile = storage.bucket(bucketName).file(intelPath);
    const [intelContents] = await intelFile.download();
    const intel = JSON.parse(intelContents.toString()) as Intel;
    return intel;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('processIntel() error!', errorMessage);
    return null;
  }
}

/**
  - generates pixelated versions of the original image
  - returns array of pixelated images in descending order (most pixelated first)
*/
function getPixelatedImgs(
  imgOriginal: Jimp,
  basePixelation: number,
  totalAttempts: number
): Jimp[] {
  const pixelatedImgs: Jimp[] = [];

  // generate pixelated versions in descending order (most pixelated first)
  for (let i = totalAttempts - 1; i > 0; i--) {
    const pixelation = basePixelation * i;
    const pixelatedImg = imgOriginal.clone();
    pixelatedImg.pixelate(pixelation);
    pixelatedImgs.push(pixelatedImg);
  }

  return pixelatedImgs;
}

/**
  - converts image to base64 string
*/
async function getBase64Img(img: Jimp, mimeType: string): Promise<string> {
  try {
    const base64Img = await img.getBase64Async(mimeType);
    return base64Img;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('getBase64Img() error!', errorMessage);
    return '';
  }
}

/**
  - crops a tile from the image at the specified location
*/
async function cropTile(
  loc: TileLocation,
  tileWidth: number,
  tileHeight: number,
  img: Jimp
): Promise<string> {
  const [r, c] = loc;
  const x = c * tileWidth;
  const y = r * tileHeight;

  // Jimp modifies the image in place, requires clone for repeated crop() calls
  const tileImgData = img.clone().crop(x, y, tileWidth, tileHeight);
  const tileImgBase64 = await getBase64Img(tileImgData, Jimp.MIME_JPEG);
  return tileImgBase64;
}

/**
  - generates all tile base64 strings for each attempt level
*/
async function getTiles(
  board: BoardConfig,
  tiles: Tiles,
  imgOriginal: Jimp,
  imgsPixelated: Jimp[]
): Promise<void> {
  // combine pixelated images with original (descending order from most pixelated)
  const imgs = [...imgsPixelated, imgOriginal];

  for (const [i, img] of imgs.entries()) {
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        try {
          const attempt = tiles.base64Catalog[i];
          const row = attempt?.[r];
          if (row) {
            row[c] = await cropTile([r, c], tiles.width, tiles.height, img);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error(`cropTile() error @ i:${i} r:${r} c:${c}!`, errorMessage);
        }
      }
    }
  }
}

/**
  - initializes the app state by loading puzzle data and generating tiles
  - called on startup and every 24 hours (via scheduler)
*/
async function init(intel: Intel, imgData: ImgData, board: BoardConfig, tiles: Tiles): Promise<void> {
  // load intel data
  const intelData = await processIntel(config.bucketName, intelPath);
  if (intelData) {
    Object.assign(intel, intelData);
  }

  // load and process image
  imgData.img = await processImg(config.bucketName, imgPath, imgData.width, imgData.height);

  if (imgData.img) {
    // generate pixelated versions
    imgData.pixelated = getPixelatedImgs(imgData.img, config.basePixelation, TOTAL_ATTEMPTS);

    // generate all tiles
    await getTiles(board, tiles, imgData.img, imgData.pixelated);
    
    // get base64 of the original image
    imgData.base64 = await getBase64Img(imgData.img, Jimp.MIME_JPEG);
  }
}

// initialize app state
await init(intel, imgData, board, tiles);



/**
  - middleware: redirect HTTP to HTTPS in production
*/
app.use((req: Request, res: Response, next: NextFunction): void => {
  // x-forwarded-proto is the de-facto standard header for identifying the protocol
  if (config.nodeEnv !== 'dev' && req.header('x-forwarded-proto') !== 'https') {
    // 301 := moved permanently
    res.redirect(301, `https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

/**
  - middleware: CORS configuration
*/
app.use(cors({ origin: config.accessURL, methods: ['GET', 'POST'] }));

/**
  - middleware: parse JSON request bodies
*/
app.use(express.json());

/**
  - middleware: serve static files from Vite build
*/
app.use(express.static(path.resolve(__dirname, '../../client/dist')));



/**
  - puzzle router: handles all puzzle-related endpoints
*/
const puzzleRouter = express.Router();

/**
  - GET /puzzle/categories
  - returns the list of available categories
*/
puzzleRouter.get('/categories', (_req: Request, res: Response<string[]>): void => {
    res.send(intel.categories);
  }
);

/**
  - GET /puzzle/category
  - returns the correct category for the current puzzle
*/
puzzleRouter.get('/category', (_req: Request, res: Response<string>): void => {
  res.send(intel.category);
});

/**
  - GET /puzzle/subcategory
  - returns the subcategory for the current puzzle
*/
puzzleRouter.get('/subcategory', (_req: Request, res: Response<string>): void => {
  res.send(intel.subcategory);
});

/**
  - GET /puzzle/tile
  - returns a specific tile's base64 image
  - query params: attempt (0-4), r (row), c (column)
*/
puzzleRouter.get(
  '/tile',
  (req: Request<object, string, object, TileQuery>, res: Response<string>): void => {
    const { attempt, r, c } = req.query;
    const attemptIdx = parseInt(attempt, 10);
    const rowIdx = parseInt(r, 10);
    const colIdx = parseInt(c, 10);
    
    const tile = tiles.base64Catalog[attemptIdx]?.[rowIdx]?.[colIdx];
    res.send(tile ?? '');
  }
);

/**
  - GET /puzzle/img
  - returns the full solution image in base64
*/
puzzleRouter.get('/img', (_req: Request, res: Response<string>): void => {
  res.send(imgData.base64);
});

/**
  - GET /puzzle/solution
  - returns the solution text
*/
puzzleRouter.get('/solution', (_req: Request, res: Response<string>): void => {
  res.send(intel.solution);
});

/**
  - GET /puzzle/number
  - returns the current puzzle number
*/
puzzleRouter.get('/number', (_req: Request, res: Response<string>): void => {
  res.send(config.puzzleNum);
});

app.use('/puzzle', puzzleRouter);



/**
  - check router: handles validation endpoints
*/
const checkRouter = express.Router();

/**
 - GET /check/category
 - validates the guessed category
 - query params: guess
*/
checkRouter.get(
  '/category',
  (req: Request<object, boolean, object, CheckQuery>, res: Response<boolean>): void => {
    const { guess } = req.query;
    res.send(guess === intel.category);
  }
);

/**
 - GET /check/solution
 - validates the guessed solution (case-insensitive, trimmed)
 - query params: guess
*/
checkRouter.get(
  '/solution',
  (req: Request<object, boolean, object, CheckQuery>, res: Response<boolean>): void => {
    const { guess } = req.query;
    res.send(guess.trim().toLowerCase() === intel.solution.toLowerCase());
  }
);

app.use('/check', checkRouter);



/**
  - leaderboard router: handles daily leaderboard endpoints
*/
const leaderboardRouter = express.Router();

/**
  - leaderboard constants
*/
const LEADERBOARD_DEFAULT_LIMIT = 25;
const LEADERBOARD_MAX_LIMIT = 100;

/**
  - POST /leaderboard/submit
  - submits a score to the daily leaderboard
  - body: { initials, logs, fingerprint }
*/
leaderboardRouter.post(
  '/submit',
  submitRateLimiter,
  async (
    req: Request<object, SubmitScoreResponse | SubmitScoreError, SubmitScoreRequest>,
    res: Response<SubmitScoreResponse | SubmitScoreError>
  ): Promise<void> => {
    try {
      const { initials, logs, fingerprint } = req.body;

      // validate initials format
      if (!initials || !isValidInitials(initials)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_INITIALS',
          message: 'Initials must be 2-4 alphanumeric characters',
        });
        return;
      }

      // check initials against blocklist
      if (isBlockedInitials(initials)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_INITIALS',
          message: 'Please choose different initials',
        });
        return;
      }

      // validate logs structure
      if (!logs || !validateLogs(logs)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_LOG',
          message: 'Invalid game log structure',
        });
        return;
      }

      // validate fingerprint
      if (!fingerprint || typeof fingerprint !== 'string' || fingerprint.length === 0) {
        res.status(400).json({
          success: false,
          error: 'INVALID_LOG',
          message: 'Missing or invalid fingerprint',
        });
        return;
      }

      // calculate score server-side (don't trust client)
      const score = calculateScoreFromLogs(logs);

      // hash the fingerprint for storage
      const hashedFingerprint = hashFingerprint(fingerprint);

      // create the score entry
      const scoreEntry: DailyScore = {
        initials: normalizeInitials(initials),
        score,
        fingerprint: hashedFingerprint,
        timestamp: new Date().toISOString(),
      };

      // add score to leaderboard
      const result = await addScore(
        storage,
        config.bucketName,
        config.puzzleNum,
        scoreEntry
      );

      if (!result.success) {
        if (result.error === 'ALREADY_SUBMITTED') {
          res.status(400).json({
            success: false,
            error: 'ALREADY_SUBMITTED',
            message: 'You have already submitted a score today',
          });
          return;
        }

        // CONFLICT or SAVE_FAILED - return 500
        res.status(500).json({
          success: false,
          error: 'INVALID_LOG',
          message: 'Failed to save score. Please try again.',
        });
        return;
      }

      // success
      res.status(201).json({
        success: true,
        score,
        rank: result.rank,
        totalPlayers: result.totalPlayers,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('POST /leaderboard/submit error!', errorMessage);
      res.status(500).json({
        success: false,
        error: 'INVALID_LOG',
        message: 'Internal server error',
      });
    }
  }
);

/**
  - GET /leaderboard/daily
  - returns the daily leaderboard
  - query params: puzzleNum (optional), limit (optional, default 25, max 100)
*/
leaderboardRouter.get(
  '/daily',
  dailyRateLimiter,
  async (
    req: Request<object, LeaderboardResponse, object, LeaderboardQuery>,
    res: Response<LeaderboardResponse>
  ): Promise<void> => {
    try {
      // use current puzzle if not specified
      const puzzleNum = req.query.puzzleNum || config.puzzleNum;

      // parse and clamp limit
      let limit = LEADERBOARD_DEFAULT_LIMIT;
      if (req.query.limit) {
        const parsedLimit = parseInt(req.query.limit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          limit = Math.min(parsedLimit, LEADERBOARD_MAX_LIMIT);
        }
      }

      // fetch scores from GCS
      const { data } = await getScoresFile(storage, config.bucketName, puzzleNum);

      // scores are already sorted by score descending in addScore()
      // slice to limit and add ranks
      const entries: LeaderboardEntry[] = data.scores
        .slice(0, limit)
        .map((score, index) => ({
          rank: index + 1,
          initials: score.initials,
          score: score.score,
          timestamp: score.timestamp,
        }));

      res.json({
        puzzleNum: data.puzzleNum,
        date: data.date,
        entries,
        totalPlayers: data.scores.length,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('GET /leaderboard/daily error!', errorMessage);

      // return empty leaderboard on error
      res.json({
        puzzleNum: config.puzzleNum,
        date: new Date().toISOString().split('T')[0] ?? '',
        entries: [],
        totalPlayers: 0,
      });
    }
  }
);

app.use('/leaderboard', leaderboardRouter);



/**
  - catch-all route: return the client app for all other requests
*/
app.get('*', (_req: Request, res: Response): void => {
  res.sendFile(path.resolve(__dirname, '../../client/dist', 'index.html'));
});

/**
  - start the server
*/
app.listen(config.port, (): void => {
  console.log(`Server listening on ${config.port}`);
});

/**
  - schedule daily puzzle update at midnight EST
*/
scheduleJob({ rule: '0 0 * * *', tz: 'America/New_York' }, updatePuzzleAndRestart);
