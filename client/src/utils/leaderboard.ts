import axios from 'axios';

import type { LeaderboardResponse, SubmitScoreResponse, SubmitScoreError } from '../lib/types';
import type { Log } from './scorecard';

/**
  - submits a score to the daily leaderboard
  - @param initials - player initials (2-4 characters)
  - @param logs - game log entries from scorecard
  - @param deviceId - hashed device ID for duplicate prevention
  - @returns submit response (success or error)
*/
export async function submitScore(
  initials: string,
  logs: Log[],
  deviceId: string
): Promise<SubmitScoreResponse> {
  try {
    const response = await axios.post<SubmitScoreResponse>('/leaderboard/submit', {
      initials,
      logs,
      fingerprint: deviceId,
    });
    return response.data;
  } catch (err) {
    // handle axios error responses
    if (axios.isAxiosError(err) && err.response?.data) {
      const errorData = err.response.data as SubmitScoreError;
      if (errorData.success === false && errorData.error) {
        return errorData;
      }
    }

    // fallback error for network issues or unexpected errors
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('submitScore() error!', errorMessage);

    return {
      success: false,
      error: 'INVALID_LOG',
      message: 'Failed to submit score. Please try again.',
    };
  }
}

/**
  - fetches the daily leaderboard
  - @param puzzleNum - optional puzzle number (defaults to current puzzle)
  - @param limit - optional limit on number of entries (default 25, max 100)
  - @returns leaderboard response
*/
export async function fetchLeaderboard(
  puzzleNum?: string,
  limit?: number
): Promise<LeaderboardResponse> {
  try {
    const params: Record<string, string> = {};
    if (puzzleNum) {
      params.puzzleNum = puzzleNum;
    }
    if (limit) {
      params.limit = String(limit);
    }

    const response = await axios.get<LeaderboardResponse>('/leaderboard/daily', { params });
    return response.data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('fetchLeaderboard() error!', errorMessage);

    // return empty leaderboard on error
    return {
      puzzleNum: puzzleNum || '',
      date: new Date().toISOString().split('T')[0] || '',
      entries: [],
      totalPlayers: 0,
      error: true
    };
  }
}
