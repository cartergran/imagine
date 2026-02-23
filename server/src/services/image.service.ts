import Jimp from 'jimp';

import type { TileLocation, BoardConfig, Tiles } from '../types.js';

/**
  - initializes a 3D array with the specified dimensions
*/
export function init3DArray(i: number, j: number, k: number): string[][][] {
  return Array.from({ length: i }, () =>
    Array.from({ length: j }, () =>
      Array<string>(k).fill('')
    )
  );
}

/**
  - generates pixelated versions of the original image
  - returns array in descending order (most pixelated first)
*/
export function getPixelatedImgs(
  imgOriginal: Jimp,
  basePixelation: number,
  totalAttempts: number
): Jimp[] {
  const pixelatedImgs: Jimp[] = [];

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
export async function getBase64Img(img: Jimp, mimeType: string): Promise<string> {
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

  // Jimp modifies in place, requires clone for repeated crop() calls
  const tileImgData = img.clone().crop(x, y, tileWidth, tileHeight);
  return getBase64Img(tileImgData, Jimp.MIME_JPEG);
}

/**
  - generates all tile base64 strings for each attempt level
*/
export async function getTiles(
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
