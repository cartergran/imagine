import Board from '../components/board';

import config from '../utils/config';
import { renderWithProviders, screen } from './utils';

test('renders all tiles on mount', () => {
  renderWithProviders(
    <Board
      attemptsLeft={config.totalAttempts}
      restoredTiles={new Map()}
      maxSelection={false}
      onSelection={() => {}}
    />
  );

  const tiles = screen.getAllByTestId('tile');
  const expectedTiles = config.board.cols * config.board.rows;
  expect(tiles).toHaveLength(expectedTiles);
});
