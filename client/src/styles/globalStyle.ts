import { createGlobalStyle } from 'styled-components';

import config from '../utils/config';
import variables from './variables';

const GlobalStyle = createGlobalStyle`
  ${variables};

  // start elements
  html {
    box-sizing: border-box;
    touch-action: pan-y;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  body {
    background-color: black;
    user-select: none;

    // CRA index.css
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
      'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  // reset
  body,
  h1, h2, h3, h4, h5, h6,
  dl, dd,
  ul {
    margin: 0;
    padding: 0;
  }

  // reset
  button {
    all: unset;

    display: inline-flex;
    justify-content: center;
    align-items: center;

    box-sizing: border-box;
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  // end elements

  // start classes
  .hidden {
    opacity: 0;
  }
  // end classes

  // start animations
  .fade-enter {
    opacity: 0;
  }
  .fade-enter-active {
    opacity: 1;
    transition: opacity ${config.duration * 3}ms ease-in;
  }
  .fade-exit {
    opacity: 1;
  }
  .fade-exit-active {
    opacity: 0;
    transition: opacity ${config.duration * 3}ms ease-out;
  }
  .fade-exit-done {
    opacity: 0;
  }
  // end animations
`;

export default GlobalStyle;
