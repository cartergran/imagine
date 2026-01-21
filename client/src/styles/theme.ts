import { css } from 'styled-components';

interface RecycleStyles {
  flexCenter: ReturnType<typeof css>;
}

export interface Theme {
  recycle: RecycleStyles;
}

const recycle: RecycleStyles = {
  flexCenter: css`
    display: flex;
    justify-content: center;
    align-items: center;
  `
};

const theme: Theme = {
  recycle
};

export default theme;
