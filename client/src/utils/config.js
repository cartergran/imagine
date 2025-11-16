const title = 'imagine';
const puzzleNum = process.env.REACT_APP_PUZZLE_NUM;
const context = `${title} #${puzzleNum}`;

const totalAttempts = 5;
const selectionsPerAttempt = 3;
const duration = 805;

const board = {
  rows: 8,
  cols: 8
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
      `Before each attempt select ${selectionsPerAttempt} tiles to reveal a portion of the image.`,
      `First, imagine the general category of the image. Once correct, choose from specific options
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
      '🟩': '+3. Puzzle solved.',
      '⬛': '+5. Unselected.'
    }
  },
  example: {
    subheader: 'Example',
    overview: 'category: Animal | type: Species | solution: Red Panda \n score: 265/314',
    card: [
      ['⬛','⬛','⬛','⬛','⬛','⬛','🟥', '⬛'],
      ['🟨','🟥','⬛','⬛','⬛','🟩','⬛', '⬛'],
      ['🟨','🟨','⬛','🟥','⬛','🟩','🟩', '⬛'],
      ['⬛','⬛','🟥','⬛','⬛','🟥','⬛', '⬛'],
      ['⬛','⬛','⬛','⬛','⬛','⬛','⬛', '⬛'],
      ['⬛','⬛','⬛','⬛','⬛','🟨','🟨', '⬛'],
      ['⬛','🟥','⬛','⬛','⬛','⬛','🟨', '⬛'],
      ['⬛','⬛','⬛','⬛','⬛','⬛','⬛', '⬛']
    ],
    score: 265,
    img: process.env.REACT_APP_EXAMPLE_IMG
  }
};

const config = {
  title,
  context,
  totalAttempts,
  selectionsPerAttempt,
  duration,
  board,
  actions,
  msgs,
  tools
};

export default config;