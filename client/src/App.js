import { createContext, useState } from 'react';
import { ThemeProvider } from 'styled-components';

// TODO: index.js in ./components
import Modal from './components/modal';
import Summary from './components/summary';
import Layout from './components/layout';
import Attempts from './components/attempts';
import Board from './components/board';
import Solve from './components/solve';
import GlobalStyle from './styles/globalStyle';
import theme from './styles/theme';
import config from './utils/config';

export const PuzzleContext = createContext();

function App() {
  const [state, setState] = useState({
    attempts: config.attempts,
    correctCategory: false,
    correctSolution: false,
    solvable: false
  });

  const buzzer = state.correctSolution || !state.attempts;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {
        (buzzer) &&
          <Modal>
            <Summary correct={state.correctSolution} />
          </Modal>
      }
      <Layout>
        <PuzzleContext.Provider value={{ correctCategory: state.correctCategory, buzzer }}>
          <Board
            rows={config.board.rows}
            cols={config.board.cols}
            toggle={{ attempts: state.attempts, solvable: state.solvable }}
            onTileClick={setState}
          />
          <Attempts count={state.attempts} />
          <Solve solvable={state.solvable} onSubmit={setState} />
        </PuzzleContext.Provider>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
