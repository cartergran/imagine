const title = 'imagine';
const day = '0';
const numAttempts = 5;
const clicksPerAttempt = 5;
const duration = 805;

const board = {
  rows: 7,
  cols: 7
};

const msgs = {
  correct: 'Ball IQ.',
  incorrect: 'Tuff.'
};

const tools = {
  summary: 'summary',
  manual: 'manual',
  default: ''
};

export const manualConfig = {
  header: 'How To Play',
  description: {
    summary: `Imagine the class & species of an animal in ${numAttempts} attempts.`,
    details: [
      `The ${board.rows} x ${board.cols} tile grid depicts one image of an animal.`,
      `Before each attempt select ${clicksPerAttempt} tiles to reveal a portion of the image.`,
      `After selecting the initial class of animal correctly, the options will change to species of
      that class.`,
      `On the scorecard, the color of the tiles change according to your attempts.`
    ]
  },
  // TODO
  example: {}
};

const config = {
  title,
  day,
  numAttempts,
  clicksPerAttempt,
  duration,
  board,
  msgs,
  tools
};

export default config;