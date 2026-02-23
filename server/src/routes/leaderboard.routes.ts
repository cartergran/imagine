import express from 'express';
import type { Request, Response } from 'express';

import * as cache from '../services/cache.service.js';
import {
  addScore,
  calculateScoreFromLogs,
  getScoresFile,
  hashDeviceId,
  isValidInitials,
  normalizeInitials,
  validateLogs,
} from '../services/scores.service.js';
import { config } from '../config.js';
import { dailyRateLimiter, submitRateLimiter } from '../middleware/leaderboard.middleware.js';
import { isBlockedInitials } from '../utils/blocklist.js';
import { storage } from '../services/gcs.service.js';

import type {
  DailyScore,
  LeaderboardEntry,
  LeaderboardQuery,
  LeaderboardResponse,
  SubmitScoreError,
  SubmitScoreRequest,
  SubmitScoreResponse,
} from '../types.js';

const router = express.Router();

const LEADERBOARD_DEFAULT_LIMIT = 25;
const LEADERBOARD_MAX_LIMIT = 100;

/**
  - POST /leaderboard/submit
  - submits a score to the daily leaderboard
  - body: { initials, logs, deviceId }
*/
router.post(
  '/submit',
  submitRateLimiter,
  async (
    req: Request<object, SubmitScoreResponse | SubmitScoreError, SubmitScoreRequest>,
    res: Response<SubmitScoreResponse | SubmitScoreError>
  ): Promise<void> => {
    try {
      const { initials, logs, deviceId } = req.body;

      if (!initials || !isValidInitials(initials)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_INITIALS',
          message: 'Initials must be 2-4 alphanumeric characters',
        });
        return;
      }

      if (isBlockedInitials(initials)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_INITIALS',
          message: 'Please choose different initials',
        });
        return;
      }

      if (!logs || !validateLogs(logs)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_LOG',
          message: 'Invalid game log structure',
        });
        return;
      }

      if (!deviceId || typeof deviceId !== 'string' || deviceId.length === 0) {
        res.status(400).json({
          success: false,
          error: 'INVALID_LOG',
          message: 'Missing or invalid device ID',
        });
        return;
      }

      const score = calculateScoreFromLogs(logs);
      const deviceIdHash = hashDeviceId(deviceId);

      const scoreEntry: DailyScore = {
        initials: normalizeInitials(initials),
        score,
        deviceIdHash,
        timestamp: new Date().toISOString(),
      };

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

        res.status(500).json({
          success: false,
          error: 'INVALID_LOG',
          message: 'Failed to save score. Please try again.',
        });
        return;
      }

      cache.invalidate(cache.leaderboardKey(config.puzzleNum));

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
  - query params: puzzleNum (optional), limit (optional, default 25, max 100), deviceId (optional)
*/
router.get(
  '/daily',
  dailyRateLimiter,
  async (
    req: Request<object, LeaderboardResponse, object, LeaderboardQuery>,
    res: Response<LeaderboardResponse>
  ): Promise<void> => {
    try {
      const puzzleNum = req.query.puzzleNum || config.puzzleNum;
      const { deviceId } = req.query;

      let limit = LEADERBOARD_DEFAULT_LIMIT;
      if (req.query.limit) {
        const parsedLimit = parseInt(req.query.limit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          limit = Math.min(parsedLimit, LEADERBOARD_MAX_LIMIT);
        }
      }

      const cacheKey = cache.leaderboardKey(puzzleNum);
      let cachedData = cache.get(cacheKey);

      if (!cachedData) {
        const { data: scoresFile } = await getScoresFile(storage, config.bucketName, puzzleNum);

        const allEntries: cache.CachedLeaderboardEntry[] = scoresFile.scores.map((score, index) => ({
          rank: index + 1,
          initials: score.initials,
          score: score.score,
          timestamp: score.timestamp,
          deviceIdHash: score.deviceIdHash,
        }));

        cachedData = {
          puzzleNum: scoresFile.puzzleNum,
          date: scoresFile.date,
          totalPlayers: scoresFile.scores.length,
          entries: allEntries,
        };

        cache.set(cacheKey, cachedData);
      }

      const hashedDeviceId = deviceId ? hashDeviceId(deviceId) : null;

      const publicEntries: LeaderboardEntry[] = cachedData.entries
        .slice(0, limit)
        .map((entry) => ({
          ...entry,
          ...(
            hashedDeviceId && entry.deviceIdHash === hashedDeviceId
              ? { isCurrentUser: true }
              : {}
          ),
        }));

      res.json({
        puzzleNum: cachedData.puzzleNum,
        date: cachedData.date,
        totalPlayers: cachedData.totalPlayers,
        entries: publicEntries,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('GET /leaderboard/daily error!', errorMessage);

      res.json({
        puzzleNum: config.puzzleNum,
        date: new Date().toISOString().split('T')[0] ?? '',
        totalPlayers: 0,
        entries: [],
        error: true,
      });
    }
  }
);

export default router;
