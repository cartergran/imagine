import { createGlobalStyle } from 'styled-components';
import variables from './variables';

const GlobalStyle = createGlobalStyle`
  ${variables};

  html {
    box-sizing: border-box;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  body {
    background-color: black;
    user-select: none;
  }

  h2 {
    font-size: 32px;
    margin: 0;
  }
`;

export default GlobalStyle;