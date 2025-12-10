import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import Board from '../components/board';
import { PuzzleContext } from '../App';

import axios from 'axios';
import config from '../utils/config';

vi.mock('axios');

test('tile background updates after click when not solvable', async () => {
  vi.mocked(axios.get).mockResolvedValue({
    data: 'data:image/jpeg;base64,AAA' // fake base64 img
  });

  render(
    <PuzzleContext.Provider value={{ solvable: false }}>
      <Board attemptsLeft={config.totalAttempts} maxSelection={false} onSelection={() => {}} />
    </PuzzleContext.Provider>
  );

  const tiles = screen.getAllByTestId('tile');
  const tileImages = screen.getAllByTestId('tile-img');
  const randomTileNum = Math.floor(Math.random() * (config.board.cols * config.board.rows));
  const randomTile = tiles[randomTileNum];
  const randomTileImg = tileImages[randomTileNum];

  const styleBefore = getComputedStyle(randomTileImg);
  expect(styleBefore.backgroundImage).toBe('url("")');

  fireEvent.click(randomTile);

  await waitFor(() => {
    const styleAfter = getComputedStyle(randomTileImg);
    expect(styleAfter.backgroundImage).toContain('data:image/jpeg;base64');
  }, { timeout: config.duration });
});
