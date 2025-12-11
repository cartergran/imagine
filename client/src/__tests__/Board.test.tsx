import { render, screen } from '@testing-library/react';

import config from '../utils/config';
import Board from '../components/board';
import { PuzzleContext, PuzzleContextValue } from '../App';
import { SolvableContext } from '../App';

test('renders all tiles on mount', () => {
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
  const expectedTiles = config.board.cols * config.board.rows;
  expect(tiles).toHaveLength(expectedTiles);
});
