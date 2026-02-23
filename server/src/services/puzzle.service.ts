import Jimp from 'jimp';

import { config } from '../config.js';
import { getPixelatedImgs, getBase64Img, getTiles, init3DArray } from './image.service.js';
import { storage } from './gcs.service.js'

import type { Intel, ImgData, BoardConfig, Tiles } from '../types.js';

const TOTAL_ATTEMPTS = 5;

const imgPath = `${config.puzzleNum}/${config.imgFileName}`;
const intelPath = `${config.puzzleNum}/${config.intelFileName}`;

export const intel: Intel = {
  categories: [],
  category: '',
  subcategory: '',
  solution: '',
};

export const imgData: ImgData = {
  width: 2002,
  height: 2002,
  img: null,
  base64: '',
  pixelated: [],
};

export const board: BoardConfig = {
  rows: 8,
  cols: 8,
};

export const tiles: Tiles = {
  width: imgData.width / board.rows,
  height: imgData.height / board.cols,
  base64Catalog: init3DArray(TOTAL_ATTEMPTS, board.rows, board.cols),
};

async function loadImg(
  bucketName: string,
  filePath: string,
  width: number,
  height: number
): Promise<Jimp | null> {
  try {
    const imgFile = storage.bucket(bucketName).file(filePath);
    const [imgContents] = await imgFile.download();
    const img = await Jimp.read(imgContents);
    img.contain(width, height);
    return img;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('loadImg() error!', errorMessage);
    return null;
  }
}

async function loadIntel(bucketName: string, filePath: string): Promise<Intel | null> {
  try {
    const intelFile = storage.bucket(bucketName).file(filePath);
    const [intelContents] = await intelFile.download();
    return JSON.parse(intelContents.toString()) as Intel;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('loadIntel() error!', errorMessage);
    return null;
  }
}

/**
  - initializes puzzle state by loading data from GCS and generating tiles
  - called on startup and daily via scheduler
*/
export async function init(): Promise<void> {
  const intelData = await loadIntel(config.bucketName, intelPath);
  if (intelData) {
    Object.assign(intel, intelData);
  }

  imgData.img = await loadImg(config.bucketName, imgPath, imgData.width, imgData.height);

  if (imgData.img) {
    imgData.pixelated = getPixelatedImgs(imgData.img, config.basePixelation, TOTAL_ATTEMPTS);
    await getTiles(board, tiles, imgData.img, imgData.pixelated);
    imgData.base64 = await getBase64Img(imgData.img, Jimp.MIME_JPEG);
  }
}
