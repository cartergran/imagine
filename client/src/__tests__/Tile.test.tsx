import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import Board from '../components/board';
import { PuzzleContext, PuzzleContextValue } from '../App';
import { SolvableContext } from '../App';

import axios from 'axios';
import config from '../utils/config';

vi.mock('axios');

test('tile background updates after click when not solvable', async () => {
  vi.mocked(axios.get).mockResolvedValue({
    data: 'data:image/jpeg;base64,AAA', // fake base64 img
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any
  });

  const testPuzzleContext: PuzzleContextValue = {
    correctCategory: false,
    correctSolution: false,
    buzzer: false
  };

  render(
    <PuzzleContext.Provider value={testPuzzleContext}>
      <SolvableContext.Provider value={false}>
        <Board 
          attemptsLeft={config.totalAttempts}
          clickedTiles={new Map()}
          maxSelection={false}
          onSelection={() => {}}
        />
      </SolvableContext.Provider>
    </PuzzleContext.Provider>
  );

  const tiles = screen.getAllByTestId('tile');
  const tileImages = screen.getAllByTestId('tile-img');
  const randomTileNum = Math.floor(Math.random() * (config.board.cols * config.board.rows));
  const randomTile = tiles[randomTileNum];
  const randomTileImg = tileImages[randomTileNum];

  if (!randomTile || !randomTileImg) {
    throw new Error('Random tile or tile image not found');
  }

  const styleBefore = getComputedStyle(randomTileImg);
  expect(styleBefore.backgroundImage).toBe('url("")');

  fireEvent.click(randomTile);

  await waitFor(() => {
    const styleAfter = getComputedStyle(randomTileImg);
    expect(styleAfter.backgroundImage).toContain('data:image/jpeg;base64');
  }, { timeout: config.duration });
});
