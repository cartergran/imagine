import Layout from "./components/layout";
import Board from "./components/board";
import GlobalStyle from "./styles/globalStyle";

function App() {
  return (
    <>
      <GlobalStyle />
      <Layout>
        {/* <Score /> */}
        <Board numRows={4} numCols={4} />
        {/* <Input /> */}
      </Layout>
    </>
  );
}

export default App;
