import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from 'styled-components';

// TODO: index.ts in ./components
import Attempts from './components/attempts';
import Board from './components/board';
import Layout from './components/layout';
import Solve from './components/solve';

import config from './utils/config';
import GlobalStyle from './styles/globalStyle';
import scorecard, { Log } from './utils/scorecard';
import theme from './styles/theme';

export interface AppState {
  attemptsLeft: number;
  correctCategory: boolean;
  correctSolution: boolean;
  solvable: boolean;
  guesses: string[];
}

export interface PuzzleContextValue {
  correctCategory: boolean;
  correctSolution: boolean;
  buzzer: boolean;
}

export const PuzzleContext = createContext<PuzzleContextValue>({
  correctCategory: false,
  correctSolution: false,
  buzzer: false
});

export const SolvableContext = createContext<boolean>(false);

const getTilesMapFromLogs = (logs: Log[]): Map<string, { color: string; attempt: number }> => {
  const tilesMap = new Map<string, { color: string; attempt: number }>();
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    if (log && log.tileSelection?.length > 0) {
      const correctness = log.correctness;
      let color: string;
      switch (correctness) {
        case 3:
          color = 'green';
          break;
        case 1:
          color = 'yellow';
          break;
        case 0:
          color = 'red';
          break;
        default:
          continue;
      }
      for (const { r, c } of log.tileSelection) {
        const key = `${r}:${c}`;
        tilesMap.set(key, { color, attempt: i });
      }
    }
  }
  return tilesMap;
};

function App() {
  const [state, setState] = useState<AppState>({
    attemptsLeft: config.totalAttempts,
    correctCategory: false,
    correctSolution: false,
    solvable: false,
    guesses: []
  });
  const [clickedTiles, setClickedTiles] = useState<Map<string, { color: string; attempt: number }>>(new Map());

  useEffect(() => {
    const savedData = scorecard.load();
    if (savedData.loaded) {
      const tilesMap = getTilesMapFromLogs(scorecard.logs);
      setClickedTiles(tilesMap);

      setState({
        attemptsLeft: 0,
        correctCategory: savedData.correctSolution ?? false,
        correctSolution: savedData.correctSolution ?? false,
        solvable: false,
        guesses: []
      });
    }
  }, []);

  const noMoreAttempts = state.attemptsLeft === 0;
  const puzzleContext = useMemo<PuzzleContextValue>(() => ({
    correctCategory: state.correctCategory,
    correctSolution: state.correctSolution,
    buzzer: state.correctSolution || noMoreAttempts
  }), [state.correctCategory, state.correctSolution, noMoreAttempts]);

  const handleSelection = useCallback((selectionsLeft: number) => {
    if (selectionsLeft === 0) {
      setState((prevState) => ({
        ...prevState,
        solvable: true
      }));
    }
  }, []);

  const handleSubmit = useCallback((updateFn: (prevState: AppState) => AppState) => {
    setState(updateFn);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <PuzzleContext.Provider value={puzzleContext}>
        <SolvableContext.Provider value={state.solvable}>
          <Layout>
              <Board
                attemptsLeft={state.attemptsLeft}
                clickedTiles={clickedTiles}
                maxSelection={state.solvable}
                onSelection={handleSelection}
              />
              <Attempts count={state.attemptsLeft} />
              <Solve
                guesses={state.guesses}
                onSubmit={handleSubmit}
              />
          </Layout>
        </SolvableContext.Provider>
      </PuzzleContext.Provider>
    </ThemeProvider>
  );
}

export default App;
