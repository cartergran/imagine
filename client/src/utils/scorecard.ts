import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import config from './config';

export interface TileSelection {
  r: number;
  c: number;
}

export interface Log {
  tileSelection: TileSelection[];
  correctness: number | null;
}

export interface Scorecard {
  card: string[][];
  logs: Log[];
  score: number;
  title: string;
  init: () => void;
  load: () => LoadedScorecard;
}

export interface LoadedScorecard {
  correctSolution?: boolean;
  loaded: boolean;
  attemptsLeft?: number;
}

interface SavedScorecardData {
  card: string[][];
  logs: Log[];
  score: number;
  title: string;
  buzzer: boolean;
  correctSolution: boolean;
}

let buzzer = false;
let currentTurn = true;

const counts = {
  incorrect: 0,
  category: 1,
  solution: 3,
  unselected: 5
} as const;

const emojis: Record<number, string> = {
  [counts.incorrect]: '🟥',
  [counts.category]: '🟨',
  [counts.solution]: '🟩',
  [counts.unselected]: '⬛',
};

const numTiles = config.board.cols * config.board.rows;
const maxUnselectedScore = counts.unselected * (numTiles - config.selectionsPerAttempt);
const solutionScore = counts.solution * config.selectionsPerAttempt;
const maxScore = maxUnselectedScore + solutionScore;

const init2DArray = (r: number, c: number, content: string): string[][] => {
  return Array.from({ length: r }, () => Array(c).fill(content));
};

const signCard = (scorecard: Scorecard): void => {
  for (const { tileSelection, correctness } of scorecard.logs) {
    if (correctness !== null) {
      for (const { r, c } of tileSelection) {
        const row = scorecard.card[r];
        const emoji = emojis[correctness] ?? emojis[counts.unselected];
        if (row && emoji) {
          row[c] = emoji;
        }
      }
    }
  }
};

const calcScore = (scorecard: Scorecard): void => {
  const { numSelected, selectedScore } = scorecard.logs.reduce((acc, log) => {
    const numTilesLog = log.tileSelection.length;
    acc.numSelected += numTilesLog;
    acc.selectedScore += numTilesLog * (log.correctness ?? 0);
    return acc;
  }, { numSelected: 0, selectedScore: 0 });
  
  const unselectedScore = (numTiles - numSelected) * counts.unselected;
  scorecard.score = selectedScore + unselectedScore;
};

const getTodayKey = (): string => {
  const today = new Date();
  return `scorecard-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
};

const saveToLocalStorage = (): void => {
  try {
    const key = getTodayKey();

    const { card, logs, score, title } = scorecard;
    const correctSolution = scorecard.logs.some(log => log.correctness === counts.solution);

    const data: SavedScorecardData = { card, logs, score, title, buzzer, correctSolution };

    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.log('saveToLocalStorage() Error!', errorMessage);
  }
};

const loadFromLocalStorage = (): LoadedScorecard => {
  try {
    const key = getTodayKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved) as SavedScorecardData;
      const { card, logs, score, title } = data;

      Object.assign(scorecard, { card, logs, score, title });
      buzzer = data.buzzer;

      return {
        correctSolution: data.correctSolution,
        loaded: true
        // TODO: attemptsLeft: data.attemptsLeft
      };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.log('loadFromLocalStorage() Error!', errorMessage);
  }
  return { loaded: false };
};

const scorecard: Scorecard = {
  card: init2DArray(config.board.rows, config.board.cols, emojis[counts.unselected] ?? '⬛'),
  logs: [{ tileSelection: [], correctness: null }],
  score: 0,
  title: '',
  init() {
    signCard(this);
    calcScore(this);
    // \u{1F0CF} := joker playing card emoji
    scorecard.title = `${config.context} \u{1F0CF}${scorecard.score}/${maxScore}`;
    // TODO: calcStats(); ?
    saveToLocalStorage();
  },
  load() {
    const savedScorecard = loadFromLocalStorage();
    // logs includes an initial empty log, subtract 1
    if (savedScorecard.loaded) {
      const usedAttempts = scorecard.logs.length - 1;
      savedScorecard.attemptsLeft = config.totalAttempts - usedAttempts;
    }
    return savedScorecard;
  }
};

axios.interceptors.request.use(
  (req: InternalAxiosRequestConfig) => {
    // check for buzzer - 'flip all' requests happen after buzzer
    if (req.url?.includes('/puzzle/tile') && !buzzer) {
      const currentLog = scorecard.logs.at(-1);
      if (currentLog) {
        const currentTileSelection = currentLog.tileSelection;

        // req.params := { r, c }
        if (currentTurn && currentTileSelection.length < config.selectionsPerAttempt) {
          currentTileSelection.push(req.params as TileSelection);
        } else {
          currentTurn = true;

          const newLog: Log = { tileSelection: [req.params as TileSelection], correctness: null };
          scorecard.logs.push(newLog);
        }
      }
    }
    return req;
  },
  (err) => {
    return Promise.reject(err);
  }
);

axios.interceptors.response.use(
  (res: AxiosResponse) => {
    const endpoint = res.config.url;
    if (endpoint?.includes('check')) {
      const correct = res.data as boolean;
      currentTurn = correct;
      const currentLog = scorecard.logs.at(-1);

      if (currentLog) {
        if (endpoint.includes('solution')) {
          currentLog.correctness = correct ? counts.solution : counts.category;
        } else {
          currentLog.correctness = correct ? counts.category : counts.incorrect;
        }

        const correctSolution = currentLog.correctness === counts.solution;
        const atMaxAttempts = scorecard.logs.length === config.totalAttempts;
        buzzer = correctSolution || atMaxAttempts;
        if (buzzer) {
          scorecard.init();
        }
      }
    }
    return res;
  },
  (err) => {
    return Promise.reject(err);
  }
);

export default scorecard;
