import { css } from 'styled-components';

const variables = css`
  :root {
    // colors
    --disabled: gray;

    // spacing
    --space-xs: 4px;
    --space-s: 8px;
    --space-m: 16px;
    --space-l: 24px;
    --space-xl: 32px;

    // sizing
    @media (width <= 400px) {
      --tile-size: 40px;
    }
    --tile-size: 44px;
  }
`;

export default variables;
