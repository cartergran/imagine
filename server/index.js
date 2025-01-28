import express from 'express';
import jimp from 'jimp';
import fs from 'fs';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
// import { fileTypeFromBuffer } from 'file-type';

const PORT = process.env.PORT || 3001;
// https://nodejs.org/api/esm.html#no-__filename-or-__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// TODO
const category = 'Gaming';
const choices = ['Alienware', 'Dell', 'Logitech', 'Razer', 'Xbox'];
const solution = 'Razer';

const init2DArray = (r, c) => {
  return Array.from({ length: r }, _ => Array(c).fill(0));
};

var board = {
  rows: 4,
  cols: 4
};
var img = {
  width: 4000,
  height: 4000,
  url: '',
  data: {},
  base64: ''
};
var tiles = {
  width: img.width / board.rows,
  height: img.height / board.cols,
  base64Catalog: init2DArray(board.rows, board.cols)
};

// TODO: store urls in db
// const getUrl = () => {};

const resizeImg = async (img) => {
  let imgRaw = await jimp.read(img.url);
  let imgSet = imgRaw.contain(img.width, img.height);
  await imgSet.writeAsync(process.env.MAIN_IMG_PATH);
  return imgSet;
};

const cropTile = async (loc, tileWidth, tileHeight, imgData) => {
  let [r, c] = loc;
  let x = c * tileWidth;
  let y = r * tileHeight;
  let tilePath = `${process.env.TILE_IMG_PATH}${r}${c}.jpg`;

  let img = await jimp.read(imgData);
  let tileImg = img.crop(x, y, tileWidth, tileHeight);
  await tileImg.writeAsync(tilePath);

  fs.readFile(tilePath, { encoding: 'base64' }, (err, data) => handleTile(err, data, loc));
};

const handleTile = (err, data, loc) => {
  if (err) throw err;
  let [r, c] = loc;
  tiles.base64Catalog[r][c] = data;
};

const getTiles = async (board, tiles, imgData) => {
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      try {
        await cropTile([r, c], tiles.width, tiles.height, imgData);
      } catch(err) {
        console.log('cropTile() error!', err.message)
      }
    }
  }
};

// call every 24 hours
const init = async (img) => {
  // img.url = getUrl();
  // img.url = process.env.IMG_URL;
  img.url = process.env.MAIN_IMG_PATH;

  img.data = await resizeImg(img); // returns jimp obj (to use crop() for tiles)
  img.base64 = await img.data.getBase64Async(jimp.MIME_JPEG);

  if (img.data) {
    await getTiles(board, tiles, img.data);
  }
};

init(img);

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ACCESS_URL);
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