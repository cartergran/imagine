import express from 'express';
import type { Request, Response } from 'express';

import { config } from '../config.js';
import { intel, imgData, tiles } from '../services/puzzle.service.js';

import type { TileQuery } from '../types.js';

const router = express.Router();

/**
  - GET /puzzle/categories
  - returns the list of available categories
*/
router.get('/categories', (_req: Request, res: Response<string[]>): void => {
  res.send(intel.categories);
});

/**
  - GET /puzzle/category
  - returns the correct category for the current puzzle
*/
router.get('/category', (_req: Request, res: Response<string>): void => {
  res.send(intel.category);
});

/**
  - GET /puzzle/subcategory
  - returns the subcategory for the current puzzle
*/
router.get('/subcategory', (_req: Request, res: Response<string>): void => {
  res.send(intel.subcategory);
});

/**
  - GET /puzzle/tile
  - returns a specific tile's base64 image
  - query params: attempt (0-4), r (row), c (column)
*/
router.get(
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
router.get('/img', (_req: Request, res: Response<string>): void => {
  res.send(imgData.base64);
});

/**
  - GET /puzzle/solution
  - returns the solution text
*/
router.get('/solution', (_req: Request, res: Response<string>): void => {
  res.send(intel.solution);
});

/**
  - GET /puzzle/number
  - returns the current puzzle number
*/
router.get('/number', (_req: Request, res: Response<string>): void => {
  res.send(config.puzzleNum);
});

export default router;
