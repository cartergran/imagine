import { useState } from "react";
import { ThemeProvider } from "styled-components";

// TODO: index.js in ./components
import Layout from "./components/layout";
import Score from "./components/score";
import Board from "./components/board";
import Input from "./components/input";
import GlobalStyle from "./styles/globalStyle";
import theme from "./styles/theme";

const config = {
  rows: 4,
  cols: 4
};

function App() {
  const [state, setState] = useState({
    clickable: true,
    guesses: 5
  });

  console.log("state:", state);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Layout>
        <Score numGuesses={state.guesses} />
        <Board
          rows={config.rows}
          cols={config.cols}
          clickable={state.clickable}
          onTileClick={setState}
        />
        <Input disabled={state.clickable} onSubmit={setState} />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
