import axios from 'axios';

export interface BoardConfig {
  rows: number;
  cols: number;
}

export interface ActionsConfig {
  submit: string;
  share: string;
}

export interface MessagesConfig {
  correct: string;
  incorrect: string;
}

export interface ToolsConfig {
  summary: string;
  manual: string;
  default: string;
}

export interface ManualScoringCounts {
  '🟥': string;
  '🟨': string;
  '🟩': string;
  '⬛': string;
}

export interface ManualExample {
  subheader: string;
  overview: string;
  card: string[][];
  score: number;
  img: string;
}

export interface ManualDescription {
  summary: string;
  details: string[];
}

export interface ManualScoring {
  subheader: string;
  counts: ManualScoringCounts;
}

export interface ManualConfig {
  header: string;
  description: ManualDescription;
  scoring: ManualScoring;
  example: ManualExample;
}

export interface Config {
  title: string;
  context: string;
  totalAttempts: number;
  selectionsPerAttempt: number;
  duration: number;
  board: BoardConfig;
  actions: ActionsConfig;
  msgs: MessagesConfig;
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

const actions: ActionsConfig = {
  submit: 'Submit',
  share: 'Share'
};

const msgs: MessagesConfig = {
  correct: 'Ball IQ.',
  incorrect: 'Tuff.'
};

const tools: ToolsConfig = {
  summary: 'summary',
  manual: 'manual',
  default: ''
};

export const manualConfig: ManualConfig = {
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
  actions,
  msgs,
  tools
};

export default config;
