import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { screen, waitFor, renderWithProviders } from './utils';
import Summary from '../components/summary';
import config from '../utils/config';
import { submitScore } from '../utils/leaderboard';

import type { LeaderboardResponse, SubmitScoreResponse } from '../lib/types';

// mock response data with proper types (hoisted so vi.mock can access them)
const { mockSubmitResponse, mockLeaderboardResponse } = vi.hoisted(() => {
  const mockSubmitResponse: SubmitScoreResponse = {
    success: true,
    score: 250,
    rank: 1,
    totalPlayers: 1
  };

  const mockLeaderboardResponse: LeaderboardResponse = {
    puzzleNum: '23',
    date: '2026-02-03',
    entries: [
      {
        rank: 1,
        initials: 'ABC',
        score: 250,
        timestamp: '2026-02-03T12:00:00Z',
        isCurrentUser: true
      }
    ],
    totalPlayers: 1
  };

  return { mockSubmitResponse, mockLeaderboardResponse };
});

// mock leaderboard API calls
vi.mock('../utils/leaderboard', () => ({
  submitScore: vi.fn().mockResolvedValue(mockSubmitResponse),
  fetchLeaderboard: vi.fn().mockResolvedValue(mockLeaderboardResponse)
}));

describe('Leaderboard Feature', () => {
  describe('Initials Prompt', () => {
    test('initials prompt appears when user completes puzzle', () => {
      renderWithProviders(<Summary />);

      // verify the initials prompt title is displayed
      const titleElement = screen.getByText(config.labels.submitYourScore);
      expect(titleElement).toBeInTheDocument();

      // verify the initials input field is displayed
      const inputElement = screen.getByPlaceholderText('AAA');
      expect(inputElement).toBeInTheDocument();

      // verify the submit button is displayed
      const submitButton = screen.getByRole('button', { name: config.labels.submitScore });
      expect(submitButton).toBeInTheDocument();

      // verify the skip button is displayed
      const skipButton = screen.getByRole('button', { name: config.labels.skip });
      expect(skipButton).toBeInTheDocument();
    });

    test('initials input has correct attributes', () => {
      renderWithProviders(<Summary />);

      const inputElement = screen.getByPlaceholderText('AAA') as HTMLInputElement;

      // verify input has correct id and maxLength
      expect(inputElement.id).toBe('initials-input');
      expect(inputElement.maxLength).toBe(4);
    });

    test('initials label displays instructions', () => {
      renderWithProviders(<Summary />);

      // verify the instructions label is displayed
      const labelElement = screen.getByText(config.labels.initialsLabel);
      expect(labelElement).toBeInTheDocument();
    });
  });

  describe('Score Submission', () => {
    const SUBMITTED_LAST_KEY = 'imagine-submitted-last';
    beforeEach(() => localStorage.removeItem(SUBMITTED_LAST_KEY));

    const submitScoreAndShowLeaderboard = async (
      user: ReturnType<typeof userEvent.setup>
    ): Promise<{ unmount: () => void }> => {
      const { unmount } = renderWithProviders(<Summary />);

      // enter initials
      const inputElement = screen.getByPlaceholderText('AAA');
      await user.type(inputElement, 'ABC');

      // click submit button
      const submitButton = screen.getByRole('button', { name: config.labels.submitScore });
      await user.click(submitButton);

      // wait for the leaderboard to load and display the user's entry
      await waitFor(() => expect(screen.getByText('ABC')).toBeInTheDocument());

      return { unmount };
    }

    const expectLeaderboardShowsSubmission = (): void => {
      expect(screen.getByText('250/314')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText(/1 Players/i)).toBeInTheDocument();
    }

    test('submitted score appears on the leaderboard', async () => {
      const user = userEvent.setup();
      await submitScoreAndShowLeaderboard(user);

      // wait for the submission to be called
      await waitFor(() => {
        expect(submitScore).toHaveBeenCalledWith(
          'ABC',
          expect.anything(),
          expect.any(String)
        );
      });

      // verify the score is displayed
      // verify the rank is displayed
      // verify the total players count is displayed
      expectLeaderboardShowsSubmission();
    });

    test('after refresh user is not re-prompted and can view leaderboard', async () => {
      const user = userEvent.setup();
      const { unmount } = await submitScoreAndShowLeaderboard(user);

      expectLeaderboardShowsSubmission();

      // simulate page refresh: unmount and mount again
      unmount();
      renderWithProviders(<Summary />);

      // after refresh, user should not be re-prompted
      expect(screen.queryByText(config.labels.submitYourScore)).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('AAA')).not.toBeInTheDocument();

      // after refresh and leaderboard loads, user can view leaderboard
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });
      expect(screen.getByText('ABC')).toBeInTheDocument();
      expect(screen.getByText('250/314')).toBeInTheDocument();
    });
  });
});
