import { createContext, useCallback, useMemo, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import config from './utils/config';
import GlobalStyle from './styles/globalStyle';

// TODO: index.js in ./components
import Layout from './components/layout';
import Attempts from './components/attempts';
import Board from './components/board';
import Solve from './components/solve';

export const PuzzleContext = createContext();

function App() {
  const [state, setState] = useState({
    attemptsLeft: config.totalAttempts,
    correctCategory: false,
    correctSolution: false,
    solvable: false,
    maxSelection: false
  });

  // TODO: optimize context
  const context = useMemo(() => ({
    correctCategory: state.correctCategory,
    correctSolution: state.correctSolution,
    solvable: state.solvable,
    buzzer: state.correctSolution || !state.attemptsLeft
  }), [state.correctCategory, state.correctSolution, state.solvable, state.attemptsLeft]);

  const toggle = useMemo(() => (
    { attemptsLeft: state.attemptsLeft, maxSelection: state.maxSelection }
  ), [state.attemptsLeft, state.maxSelection]);

  const handleSelection = useCallback((selectionsLeft) => {
    if (selectionsLeft === config.selectionsPerAttempt - 1) {
      setState((prevState) => { return { ...prevState, solvable: true }});
    } else if (selectionsLeft === 0) {
      setState((prevState) => { return { ...prevState, maxSelection: true }});
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <PuzzleContext.Provider value={context}>
        <Layout>
            <Board
              toggle={toggle}
              onSelection={handleSelection}
            />
            <Attempts count={state.attemptsLeft} />
            <Solve onSubmit={setState} /> { /* TODO: optimize setState */ }
        </Layout>
      </PuzzleContext.Provider>
    </ThemeProvider>
  );
}

export default App;
