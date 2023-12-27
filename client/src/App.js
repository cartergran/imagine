import { ThemeProvider } from "styled-components";

import Layout from "./components/layout";
import Score from "./components/score";
import Board from "./components/board";
import GlobalStyle from "./styles/globalStyle";
import theme from "./styles/theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Layout>
        <Score numGuesses={5} />
        <Board numRows={4} numCols={4} />
        {/* <Input /> */}
      </Layout>
    </ThemeProvider>
  );
}

export default App;
