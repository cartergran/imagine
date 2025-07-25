import express from 'express';
import cors from 'cors';
import jimp from 'jimp';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { Storage } from '@google-cloud/storage';
import { scheduleJob } from 'node-schedule';
import { updateEnvVars } from './scheduler.js';
// import { fileTypeFromBuffer } from 'file-type';
// import fs from 'fs';

// env vars
const PORT = process.env.PORT || 3001;
const nodeEnv = process.env.NODE_ENV || '';
const accessURL = process.env.ACCESS_URL || '';
const bucketName = process.env.BUCKET_NAME || '';
const folderName = process.env.REACT_APP_PUZZLE_NUM || '';
const imgPath = `${folderName}/${process.env.IMG_FILE_NAME || ''}`;
const intelPath = `${folderName}/${process.env.INTEL_FILE_NAME || ''}`;
const gcsCredsBase64 = process.env.GCS_KEY_BASE64 || '';
const gcsCreds = JSON.parse(Buffer.from(gcsCredsBase64, 'base64').toString('utf8'));

// https://nodejs.org/api/esm.html#no-__filename-or-__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const storage = new Storage({ credentials: gcsCreds });

var totalAttempts = 5;
var intel = {
  categories: [],
  choices: [],
  category: '',
  solution: ''
};
var img = {
  width: 2002,
  height: 2002,
  data: {},
  base64: '',
  pixelated: [] // descending order from most pixelated
};
var board = {
  rows: 7,
  cols: 7
};
var tiles = {
  width: img.width / board.rows,
  height: img.height / board.cols,
  base64Catalog: init3DArray(totalAttempts, board.rows, board.cols)
};
var basePixelation = 11;

// hoist
function init3DArray(i, j, k) {
  return Array.from({ length: i }, _ =>
    Array.from({ length: j }, _ =>
      Array(k).fill(0)
    )
  );
}

const processImg = async (bucketName, imgPath, width, height) => {
  let img;
  try {
    let imgFile = storage.bucket(bucketName).file(imgPath);
    let [imgContents] = await imgFile.download();
    img = await jimp.read(imgContents);
    img.contain(width, height);

    // await img.writeAsync(process.env.MAIN_IMG_PATH);
  } catch(err) {
    console.error('processImg() error!', err.message);
  }
  return img;
};

const processIntel = async(bucketName, intelPath) => {
  let intel;
  try {
    let intelFile = storage.bucket(bucketName).file(intelPath);
    let [intelContents] = await intelFile.download();
    intel = JSON.parse(intelContents.toString());
  } catch (err) {
    console.error('processIntel() error!', err.message);
  }
  return intel;
};

const getPixelatedImgs = (imgOriginal, basePixelation, totalAttempts) => {
  let pixelatedImgs = [];
  // descending order from most pixelated
  for (let i = totalAttempts - 1; i > 0; i--) {
    let pixelation = basePixelation * i;
    let pixelatedImg = imgOriginal.clone();
    pixelatedImg.pixelate(pixelation);
    // pixelatedImg.writeAsync(`${process.env.PIXELATED_IMG_PATH}${i}.jpg`);

    pixelatedImgs.push(pixelatedImg);
  }
  return pixelatedImgs;
}

const getBase64Img = async (imgData, mimeType) => {
  let base64Img = '';
  try {
    base64Img = await imgData.getBase64Async(mimeType);
  } catch (err) {
    console.error('getBase64Img() error!', err.message);
  }
  return base64Img;
};

const cropTile = async (loc, tileWidth, tileHeight, imgData) => {
  let [r, c] = loc;
  let x = c * tileWidth;
  let y = r * tileHeight;
  // let tilePath = `${process.env.TILE_IMG_PATH}${r}${c}.jpg`;

  // jimp modifies the image in place, requires clone for repeated crop() calls o/w offset >
  let tileImgData = imgData.clone().crop(x, y, tileWidth, tileHeight);
  let tileImgBase64 = getBase64Img(tileImgData, jimp.MIME_JPEG);
  return tileImgBase64;

  // await tileImg.writeAsync(tilePath);
  // fs.readFile(tilePath, { encoding: 'base64' }, (err, data) => handleTile(err, data, loc));
};

/*
const handleTile = (err, data, loc) => {
  if (err) throw err;
  let [r, c] = loc;
  tiles.base64Catalog[r][c] = data;
};
*/

const getTiles = async (board, tiles, imgOriginal, imgsPixelated) => {
  // descending order from most pixelated
  const imgsData = [...imgsPixelated, imgOriginal];

  for (let [i, imgData] of imgsData.entries()) {
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        try {
          tiles.base64Catalog[i][r][c] = await cropTile([r, c], tiles.width, tiles.height, imgData);
        } catch(err) {
          console.error(`cropTile() error @ i:${i} r:${r} c:${c}!`, err.message);
        }
      }
    }
  }
};

// call every 24 hours
const init = async (intel, img, board, tiles) => {
  Object.assign(intel, await processIntel(bucketName, intelPath));
  img.data = await processImg(bucketName, imgPath, img.width, img.height);

  if (img.data) {
    img.pixelated = getPixelatedImgs(img.data, basePixelation, totalAttempts);

    await getTiles(board, tiles, img.data, img.pixelated);
    img.base64 = await getBase64Img(img.data, jimp.MIME_JPEG)
  }
};

init(intel, img, board, tiles);

app.use((req, res, next) => {
  // MDN docs := x-forwarded-proto de-facto standard header for identifying the protocols
  if (nodeEnv !== 'dev' && req.header('x-forwarded-proto') !== 'https') {
    // 301 := moved permanently
    res.redirect(301, `https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

app.use(cors({
  origin: accessURL,
  methods: ['GET']
}));

// serve static files from CRA
app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get('/categories', (_req, res) => {
  res.send(intel.categories);
});

app.get('/tile', (req, res) => {
  let { attempt, r, c } = req.query;
  res.send(tiles.base64Catalog[attempt][r][c]);
});

app.get('/choices', (_req, res) => {
  res.send(intel.choices);
});

app.get('/check/category', (req, res) => {
  let { guess } = req.query;
  res.send(guess === intel.category)
});

app.get('/check/solution', (req, res) => {
  let { guess } = req.query;
  res.send(guess === intel.solution);
});

app.get('/img', (_req, res) => {
  res.send(img.base64);
});

// catch all other requests & return to home
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

scheduleJob('0 0 * * *', updateEnvVars);