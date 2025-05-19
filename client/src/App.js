import { createContext, useState } from 'react';
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

  const context = {
    correctCategory: state.correctCategory,
    correctSolution: state.correctSolution,
    solvable: state.solvable,
    buzzer: state.correctSolution || !state.attemptsLeft
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <PuzzleContext.Provider value={context}>
        <Layout>
            <Board
              toggle={{ attemptsLeft: state.attemptsLeft, maxSelection: state.maxSelection }}
              onSelection={setState}
            />
            <Attempts count={state.attemptsLeft} />
            <Solve onSubmit={setState} />
        </Layout>
      </PuzzleContext.Provider>
    </ThemeProvider>
  );
}

export default App;
