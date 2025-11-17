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

function App() {
  const [state, setState] = useState({
    attemptsLeft: config.totalAttempts,
    correctCategory: false,
    correctSolution: false,
    solvable: false,
    guesses: { current: '', previous: [] }
  });

  useEffect(() => {
    const savedData = scorecard.load();
    if (savedData.loaded) {
      setState({
        attemptsLeft: 0,
        correctCategory: savedData.correctSolution,
        correctSolution: savedData.correctSolution,
        solvable: false,
        guesses: { current: '', previous: [] }
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

  const handleGuessChange = useCallback((newGuess) => {
    setState(prevState => ({
      ...prevState,
      guesses: {
        ...prevState.guesses,
        current: newGuess
      }
    }));
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
                maxSelection={state.solvable}
                onSelection={handleSelection}
              />
              <Attempts count={state.attemptsLeft} />
              <Solve
                guesses={state.guesses}
                handleGuessChange={handleGuessChange}
                onSubmit={handleSubmit}
              />
          </Layout>
        </SolvableContext.Provider>
      </PuzzleContext.Provider>
    </ThemeProvider>
  );
}

export default App;
