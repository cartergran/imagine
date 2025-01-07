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
import config from './config';

function App() {
  const [state, setState] = useState({
    solvable: false,
    attempts: config.attempts,
    correct: false
  });

  console.log('state:', state);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      { state.correct && <Modal><Stats correct={state.correct}/></Modal> }
      <Layout>
        <Board
          rows={config.boardLayout.rows}
          cols={config.boardLayout.cols}
          state={state}
          onTileClick={setState}
        />
        <Score attempts={state.attempts} />
        <Solve solvable={state.solvable} onSubmit={setState} />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
