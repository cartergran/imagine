import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import config from '../utils/config';
import { PuzzleContext } from '../App';
import Board from '../components/board';

jest.mock('axios');

test('tile background updates after click when not solvable', async () => {
  (axios.get).mockResolvedValue({
    data: 'data:image/jpeg;base64,AAA' // fake base64 img
  });

  const testToggle = {
    attemptsLeft: config.totalAttempts,
    maxSelection: false
  };

  render(
    <PuzzleContext.Provider value={{ solvable: false }}>
      <Board toggle={testToggle} onSelection={() => {}} />
    </PuzzleContext.Provider>
  );

  const tiles = screen.getAllByTestId('tile');
  const tileImages = screen.getAllByTestId('tile-img');
  const randomTileNum = Math.floor(Math.random() * (config.board.cols * config.board.rows));
  const randomTile = tiles[randomTileNum];
  const randomTileImg = tileImages[randomTileNum];

  const styleBefore = getComputedStyle(randomTileImg);
  expect(styleBefore.backgroundImage).toBe('url()');

  fireEvent.click(randomTile);

  await waitFor(() => {
    const styleAfter = getComputedStyle(randomTileImg);
    expect(styleAfter.backgroundImage).toContain('data:image/jpeg;base64');
  });
});