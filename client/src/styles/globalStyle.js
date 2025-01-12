import { createGlobalStyle } from 'styled-components';
import variables from './variables';

const GlobalStyle = createGlobalStyle`
  ${variables};

  // start elements
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
  // end elements

  // start classes
  .hidden {
    opacity: 0;
  }
  // end classes

  // start animations
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  // end animations
`;

export default GlobalStyle;