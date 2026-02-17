import { css } from 'styled-components';

const variables = css`
  :root {
    // colors
    --disabled: gray;
    --error: #ff6b6b;

    --divider-lightest: rgba(255, 255, 255, 0.1); // used for dividers in <Leaderboard />
    --divider-light: rgba(255, 255, 255, 0.3); // used for dividers in <Summary />
    --highlight-light: rgba(255, 215, 0, 0.15); // used for highlighted entries in <Leaderboard />

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
