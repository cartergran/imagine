import express from 'express';
import cors from 'cors';
import jimp from 'jimp';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { Storage } from '@google-cloud/storage';
// import { fileTypeFromBuffer } from 'file-type';
// import fs from 'fs';

// env vars
const PORT = process.env.PORT || 3001;
const accessURL = process.env.ACCESS_URL || '';
const bucketName = process.env.BUCKET_NAME || '';
const folderName = process.env.FOLDER_NAME || '';
const imgPath = `${folderName}/${process.env.IMG_FILE_NAME || ''}`;
const intelPath = `${folderName}/${process.env.INTEL_FILE_NAME || ''}`;
const gcsCredsBase64 = process.env.GCS_KEY_BASE64 || '';
const gcsCreds = JSON.parse(Buffer.from(gcsCredsBase64, 'base64').toString('utf8'));

// https://nodejs.org/api/esm.html#no-__filename-or-__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const storage = new Storage({ credentials: gcsCreds });

var numAttempts = 5;
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
  distorted: [] // descending order from most distorted
};
var board = {
  rows: 7,
  cols: 7
};
var tiles = {
  width: img.width / board.rows,
  height: img.height / board.cols,
  base64Catalog: init3DArray(numAttempts, board.rows, board.cols)
};
var baseDistortion = {
  lines: 4004,
  maxLineHeight: 44,
  maxShift: 44,
};

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

const distortImg = (imgOriginal, imgData, distortion) => {
  let width = imgOriginal.bitmap.width;
  let height = imgOriginal.bitmap.height;
  let { lines, maxLineHeight, maxShift } = distortion;

  for (let i = 0; i < lines; i++){
    let y = Math.floor(Math.random() * height);
    // [1 - maxLineHeight]px line
    let lineHeight = Math.floor(Math.random() * maxLineHeight) + 1;
    // shift left or right
    let shift = Math.floor(Math.random() * (maxShift * 2)) - maxShift;

    for (let dy = 0; dy < lineHeight; dy++) {
      for (let x = 0; x < width; x++) {
        let srcX = x + shift;
        let deltaY = y + dy;

        if (srcX >= 0 && srcX < width && deltaY < height) {
          let color = imgOriginal.getPixelColor(srcX, deltaY);
          imgData.setPixelColor(color, x, deltaY);
        }
      }
    }
  }
  return imgData;
};

const getDistortedImgs = (imgOriginal, baseDistortion, numAttempts) => {
  let distortedImgs = [];
  // descending order from most distorted
  for (let i = numAttempts - 1; i > 0; i--) {
    let distortion = Object.fromEntries(Object.entries(baseDistortion).map(([k, v]) => [k, v * i]));
    let distortedImg =  distortImg(imgOriginal, imgOriginal.clone(), distortion);
    // distortedImg.writeAsync(`${process.env.DISTORTED_IMG_PATH}${i}.jpg`);

    distortedImgs.push(distortedImg);
  }
  return distortedImgs;
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

const getTiles = async (board, tiles, imgOriginal, imgsDistorted) => {
  // descending order from most distorted
  const imgsData = [...imgsDistorted, imgOriginal];

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
    img.distorted = getDistortedImgs(img.data, baseDistortion, numAttempts);

    await getTiles(board, tiles, img.data, img.distorted);
    img.base64 = await getBase64Img(img.data, jimp.MIME_JPEG)
  }
};

init(intel, img, board, tiles);

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