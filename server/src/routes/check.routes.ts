import express from 'express';
import type { Request, Response } from 'express';

import { intel } from '../services/puzzle.service.js';

import type { CheckQuery } from '../types.js';

const router = express.Router();

/**
  - GET /check/category
  - validates the guessed category
  - query params: guess
*/
router.get(
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
router.get(
  '/solution',
  (req: Request<object, boolean, object, CheckQuery>, res: Response<boolean>): void => {
    const { guess } = req.query;
    res.send(guess.trim().toLowerCase() === intel.solution.toLowerCase());
  }
);

export default router;
