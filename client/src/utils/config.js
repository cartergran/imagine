const title = 'imagine';
const day = '0';
const numAttempts = 5;
const clicksPerAttempt = 5;
const duration = 805;

const board = {
  rows: 7,
  cols: 7
};

const actions = {
  submit: 'Submit',
  share: 'Share'
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
    summary: `Imagine the class and species of an animal in ${numAttempts} attempts.`,
    details: [
      `The ${board.rows} x ${board.cols} tile grid depicts one image of an animal.`,
      `Before each attempt select ${clicksPerAttempt} tiles to reveal a portion of the image.`,
      `After choosing the initial class of animal correctly, the options will change to species of
      that class.`,
      `On the scorecard, the color of the tiles change according to your attempts.`
    ],
    scoring: {
      '⬛': 'Unselected.',
      '🟥': 'Incorrect choice of class.',
      '🟨': 'Incorrect choice of species.',
      '🟩': 'Puzzle solved.'
    }
  },
  example: {
    subheader: 'Example',
    overview: '{ class: Mammal, species: Red Panda }',
    score: [
      ['⬛','⬛','⬛','⬛','⬛','🟩','🟥'],
      ['🟨','🟥','🟨','🟨','🟨','🟩','🟩'],
      ['🟨','🟨','🟨','🟥','🟨','🟩','🟩'],
      ['⬛','⬛','🟥','⬛','⬛','🟥','🟨'],
      ['⬛','⬛','⬛','⬛','⬛','⬛','🟨'],
      ['⬛','⬛','⬛','⬛','⬛','🟨','🟨'],
      ['⬛','⬛','⬛','⬛','⬛','🟨','🟨']
    ],
    img: process.env.REACT_APP_EXAMPLE_IMG
  }
};

const config = {
  title,
  day,
  numAttempts,
  clicksPerAttempt,
  duration,
  board,
  actions,
  msgs,
  tools
};

export default config;