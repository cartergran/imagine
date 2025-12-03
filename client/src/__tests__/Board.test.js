import { render, screen } from '@testing-library/react';

import config from '../utils/config';
import Board from '../components/board';
import { PuzzleContext } from '../App';

test('renders all tiles on mount', () => {
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
  const expectedTiles = config.board.cols * config.board.rows;
  expect(tiles).toHaveLength(expectedTiles);
});
