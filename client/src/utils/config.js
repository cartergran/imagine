const title = 'imagine';
const puzzleNum = process.env.REACT_APP_PUZZLE_NUM;
const share = `${title} #${puzzleNum}`;

const totalAttempts = 5;
const selectionsPerAttempt = 3;
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
    summary: `Imagine the image in ${totalAttempts} attempts.`,
    details: [
      `The ${board.rows} x ${board.cols} tile grid depicts a single image.`,
      `Before each attempt select up to ${selectionsPerAttempt} tiles to reveal a portion of the
      image.`,
      `First, guess the general category of the image. Once correct, choose from specific options
      within that category.`,
      `The image starts heavily pixelated and becomes clearer after each attempt.`,
      `Tiles on the scorecard change color based on your selections and results, which determine
      your final score.`
    ]
  },
  scoring: {
    subheader: 'Scoring',
    counts: {
      '🟥': '+0. Incorrect category.',
      '🟨': '+1. Correct category, incorrect solution.',
      '🟩': '+2. Puzzle solved.',
      '⬛': '+3. Unselected.'
    }
  },
  example: {
    subheader: 'Example',
    overview: '{ category: Animal, solution: Red Panda, score: 101/146 }',
    card: [
      ['⬛','⬛','⬛','⬛','⬛','⬛','🟥'],
      ['🟨','🟥','🟨','🟨','🟨','🟩','⬛'],
      ['🟨','🟨','🟨','🟥','🟨','🟩','🟩'],
      ['⬛','⬛','🟥','⬛','⬛','🟥','🟨'],
      ['⬛','⬛','⬛','⬛','⬛','⬛','🟨'],
      ['⬛','⬛','⬛','⬛','⬛','🟨','🟨'],
      ['⬛','⬛','⬛','⬛','⬛','🟨','🟨']
    ],
    score: 101,
    img: process.env.REACT_APP_EXAMPLE_IMG
  }
};

const config = {
  title,
  share,
  totalAttempts,
  selectionsPerAttempt,
  duration,
  board,
  actions,
  msgs,
  tools
};

export default config;