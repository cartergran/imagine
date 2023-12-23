const express = require("express");
const jimp = require("jimp");

const PORT = process.env.PORT || 3001;
const app = express();

var board = {
  numRows: 4,
  numCols: 4
};
var img = {
  width: 600,
  height: 600,
  url: "",
  data: {}
};
var tiles = {
  width: img.width / board.numRows,
  height: img.height / board.numCols,
  data: []
};

// TODO: store urls in db
// const getUrl = () => {};

const resizeImg = async (img) => {
  let imgRaw = await jimp.read(img.url);
  let imgSet = imgRaw.contain(img.width, img.height);
  img.data = imgSet.bitmap;
  console.log(img.data);
};

const cropTile = async (loc, tileWidth, tileHeight, imgData) => {
  let [r, c] = loc;
  let x = c * tileWidth;
  let y = r * tileHeight;

  let img = await jimp.read(imgData);
  let tileImg = img.crop(x, y, tileWidth, tileHeight);
  return tileImg.bitmap;
};

const getTiles = async (board, tiles, imgData) => {
  let res = [];
  for (let r = 0; r < board.numRows; r++) {
    let row = [];
    for (let c = 0; c < board.numCols; c++) {
      let tileData = await cropTile([r, c], tiles.width, tiles.height, imgData);
      row.push(tileData);
    }
    res.push(row);
  }
  tiles.data = res;
};

// call every 24 hours
const init = async (img) => {
  // img.url = getUrl();
  img.url = "https://banner2.cleanpng.com/20180425/ffq/kisspng-razer-inc-laptop-computer-mouse-computer-keyboard-the-snake-free-download-5ae0dbb66e7296.0182699015246857504524.jpg";
  // sets img.obj
  await resizeImg(img);
  img.data && await getTiles(board, tiles, img.data);
};

init(img);

app.get("/image", (req, res) => {
  res.json({ message: "TODO" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});