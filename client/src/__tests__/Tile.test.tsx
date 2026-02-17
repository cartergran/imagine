import axios from 'axios';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import Board from '../components/board';

import config from '../utils/config';
import { screen, waitFor, renderWithProviders } from './utils';

test('tile background updates after click when not solvable', async () => {
  const user = userEvent.setup();

  vi.mocked(axios.get).mockResolvedValue({
    data: 'data:image/jpeg;base64,AAA', // fake base64 img
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any
  });

  renderWithProviders(
    <Board
      attemptsLeft={config.totalAttempts}
      restoredTiles={new Map()}
      maxSelection={false}
      onSelection={() => {}}
    />
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

  await user.click(randomTile);

  await waitFor(() => {
    const styleAfter = getComputedStyle(randomTileImg);
    expect(styleAfter.backgroundImage).toContain('data:image/jpeg;base64');
  }, { timeout: config.duration });
});
