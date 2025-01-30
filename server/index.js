import express from 'express';
import jimp from 'jimp';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { Storage } from '@google-cloud/storage';
// import { fileTypeFromBuffer } from 'file-type';
// import fs from 'fs';

// env vars
const PORT = process.env.PORT || 3001;
const accessURL = process.env.ACCESS_URL
const bucketName = process.env.BUCKET_NAME;
const fileName = process.env.FILE_NAME;

// https://nodejs.org/api/esm.html#no-__filename-or-__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const storage = new Storage();

// TODO: gcs
const category = 'Gaming';
const choices = ['Alienware', 'Dell', 'Logitech', 'Razer', 'Xbox'];
const solution = 'Razer';

const init2DArray = (r, c) => {
  return Array.from({ length: r }, _ => Array(c).fill(0));
};

var img = {
  width: 4000,
  height: 4000,
  data: {},
  base64: ''
};
var board = {
  rows: 4,
  cols: 4
};
var tiles = {
  width: img.width / board.rows,
  height: img.height / board.cols,
  base64Catalog: init2DArray(board.rows, board.cols)
};

const processImg = async (bucketName, fileName, width, height) => {
  let img;
  try {
    let file = storage.bucket(bucketName).file(fileName);
    let [contents] = await file.download();
    img = await jimp.read(contents);
    img.contain(width, height);

    // await img.writeAsync(process.env.MAIN_IMG_PATH);
  } catch(err) {
    console.error('processImg() error!', err.message);
  }
  return img;
};

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

const getTiles = async (board, tiles, imgData) => {
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      try {
        tiles.base64Catalog[r][c] = await cropTile([r, c], tiles.width, tiles.height, imgData);
      } catch(err) {
        console.error(`cropTile() error @ r:${r} c:${c}!`, err.message);
      }
    }
  }
};

// call every 24 hours
const init = async (img, board, tiles) => {
  img.data = await processImg(bucketName, fileName, img.width, img.height);
  if (img.data) {
    await getTiles(board, tiles, img.data);
    img.base64 = await getBase64Img(img.data, jimp.MIME_JPEG)
  }
};

init(img, board, tiles);

app.use(function (_req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', accessURL);
  next();
});

// serve static files from CRA
app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get('/tile', (req, res) => {
  let { r, c } = req.query;
  res.send(tiles.base64Catalog[r][c]);
});

app.get('/choices', (_req, res) => {
  res.send(choices);
});

app.get('/check-category', (req, res) => {
  let { guess } = req.query;
  res.send(guess === category)
});

app.get('/check-solution', (req, res) => {
  let { guess } = req.query;
  res.send(guess === solution);
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