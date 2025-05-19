const title = 'imagine';
const puzzleNum = process.env.REACT_APP_PUZZLE_NUM;
const share = `${title} #${puzzleNum}`;

const totalAttempts = 5;
const selectionsPerAttempt = 5;
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
    summary: `Imagine the class and species of an animal in ${totalAttempts} attempts.`,
    details: [
      `The ${board.rows} x ${board.cols} tile grid depicts one image of an animal.`,
      `The image starts pixelated and becomes clearer with each attempt.`,
      `Before each attempt select anywhere from 1 to ${selectionsPerAttempt} tiles to reveal a
      portion of the image.`,
      `After choosing the class of animal correctly, the options will narrow to species of that
      class.`,
      `The tiles on the scorecard change color based on your selections and results, which
      determine your final score.`
    ]
  },
  scoring: {
    subheader: 'Scoring',
    counts: {
      '🟥': '+0. Incorrect choice of class.',
      '🟨': '+1. Correct class, incorrect choice of species.',
      '🟩': '+2. Puzzle solved.',
      '⬛': '+3. Unselected.'
    }
  },
  example: {
    subheader: 'Example',
    overview: '{ class: Mammal, species: Red Panda, score: 101/146 }',
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