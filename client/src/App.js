import { useState } from 'react';
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
import { boardLayout } from './config';

function App() {
  const [state, setState] = useState({
    solvable: false,
    guesses: 5,
    correct: false,
    modal: false // TODO: logic for truthy (end game, icon, etc.)
  });

  console.log('state:', state);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      { state.modal && <Modal><Stats /></Modal> }
      <Layout>
        <Board
          rows={boardLayout.rows}
          cols={boardLayout.cols}
          state={state}
          onTileClick={setState}
        />
        <Score guesses={state.guesses} />
        <Solve active={state.solvable} onSubmit={setState} />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
