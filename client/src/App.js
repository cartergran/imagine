import { createContext, useState } from 'react';
import { ThemeProvider } from 'styled-components';

// TODO: index.js in ./components
import Modal from './components/modal';
import Stats from './components/stats';
import Layout from './components/layout';
import Score from './components/score';
import Board from './components/board';
import Solve from './components/solve';
import GlobalStyle from './styles/globalStyle';
import theme from './styles/theme';
import config from './utils/config';

export const CategoryContext = createContext();

function App() {
  const [state, setState] = useState({
    attempts: config.attempts,
    correctCategory: false,
    correctSolution: false,
    solvable: false
  });

  console.log('state:', state);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {
        (state.correctSolution || !state.attempts) &&
          <Modal>
            <Stats correct={state.correctSolution} />
          </Modal>
      }
      <Layout>
        <CategoryContext.Provider value={state.correctCategory}>
          <Board
            rows={config.boardLayout.rows}
            cols={config.boardLayout.cols}
            toggle={{ attempts: state.attempts, solvable: state.solvable }}
            onTileClick={setState}
          />
          <Score attempts={state.attempts} />
          <Solve solvable={state.solvable} onSubmit={setState} />
        </CategoryContext.Provider>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
