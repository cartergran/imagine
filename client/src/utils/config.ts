import axios from 'axios';

type BoardConfig = {
  rows: number;
  cols: number;
};

type LabelsConfig = {
  attemptsLeft: string;
  category: string;
  correct: string;
  incorrect: string;
  share: string;
  solution: string;
  submit: string;
};

type ToolsConfig = {
  default: string;
  manual: string;
  summary: string;
};

type ManualScoringCounts = {
  '🟥': string;
  '🟨': string;
  '🟩': string;
  '⬛': string;
};

type ManualExample = {
  subheader: string;
  overview: string;
  card: string[][];
  score: number;
  img: string;
};

type ManualDescription = {
  summary: string;
  details: string[];
}; 

type ManualScoring = {
  subheader: string;
  counts: ManualScoringCounts;
};

interface ManualConfig {
  header: string;
  description: ManualDescription;
  scoring: ManualScoring;
  example: ManualExample;
}

interface Config {
  title: string;
  context: string;
  totalAttempts: number;
  selectionsPerAttempt: number;
  duration: number;
  board: BoardConfig;
  labels: LabelsConfig;
  tools: ToolsConfig;
}

const title = 'imagine';
let puzzleNum = '';

const getPuzzleNum = async (): Promise<void> => {
  try {
    const puzzleNumRes = await axios.get<string>('/puzzle/number');
    puzzleNum = puzzleNumRes.data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('getPuzzleNum() Error!', errorMessage);
  }
};

getPuzzleNum();

const getContext = (): string => `${title} #${puzzleNum || ''}`;

const totalAttempts = 5;
const selectionsPerAttempt = 3;
const duration = 805;

const board: BoardConfig = {
  rows: 8,
  cols: 8
};

const tools: ToolsConfig = {
  default: '',
  manual: 'manual',
  summary: 'summary'
};

const labels: LabelsConfig = {
  attemptsLeft: 'Blunders Left:',
  category: 'Category',
  share: 'Share',
  solution: 'Solution',
  submit: 'Submit',
  correct: 'Ball IQ',
  incorrect: 'Tough'
};

export const manualConfig: ManualConfig = {
  header: 'How To Play',
  description: {
    summary: `Imagine the image in ${totalAttempts} attempts.`,
    details: [
      `The ${board.rows} x ${board.cols} tile grid depicts a single image.`,
      `Select ${selectionsPerAttempt} tiles per attempt to reveal a portion of the image.`,
      `First, guess the general category of the image.`,
      `Once correct, enter your specific guess within that category to guess the solution.`,
      `A hint is provided after selecting the correct category.`,
      `The image starts heavily pixelated and becomes clearer after each attempt.`,
      `Tiles on the scorecard change color based on your selections, which determine your final
      score.`
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
    img: import.meta.env.VITE_EXAMPLE_IMG as string
  }
};

const config: Config = {
  title,
  // called as config.context but dynamically computes value
  get context() { return getContext(); },
  totalAttempts,
  selectionsPerAttempt,
  duration,
  board,
  labels,
  tools
};

export default config;
