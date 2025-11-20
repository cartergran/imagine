import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import config from './utils/config';
import GlobalStyle from './styles/globalStyle';
import scorecard from './utils/scorecard';

// TODO: index.js in ./components
import Layout from './components/layout';
import Attempts from './components/attempts';
import Board from './components/board';
import Solve from './components/solve';

export const PuzzleContext = createContext();
export const SolvableContext = createContext();

const getTilesMapFromLogs = (logs) => {
  const tilesMap = new Map();
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    if (log.tileSelection?.length > 0) {
      const correctness = log.correctness;
      let color;
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
  const [state, setState] = useState({
    attemptsLeft: config.totalAttempts,
    correctCategory: false,
    correctSolution: false,
    solvable: false,
    guesses: []
  });
  const [clickedTiles, setClickedTiles] = useState(new Map());

  useEffect(() => {
    const savedData = scorecard.load();
    if (savedData.loaded) {
      const tilesMap = getTilesMapFromLogs(scorecard.logs);
      setClickedTiles(tilesMap);

      setState({
        attemptsLeft: 0,
        correctCategory: savedData.correctSolution,
        correctSolution: savedData.correctSolution,
        solvable: false,
        guesses: []
      });
    }
  }, []);

  const noMoreAttempts = state.attemptsLeft === 0;
  const puzzleContext = useMemo(() => ({
    correctCategory: state.correctCategory,
    correctSolution: state.correctSolution,
    buzzer: state.correctSolution || noMoreAttempts
  }), [state.correctCategory, state.correctSolution, noMoreAttempts]);

  const handleSelection = useCallback((selectionsLeft) => {
    if (selectionsLeft === 0) {
      setState((prevState) => ({
        ...prevState,
        solvable: true
      }));
    }
  }, []);

  const handleSubmit = useCallback((updateFn) => (
    setState(updateFn)
  ), []);

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
