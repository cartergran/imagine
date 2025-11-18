import axios from 'axios';
import config from './config';

var buzzer = false;
var currentTurn = true;

const counts = {
  incorrect: 0,
  category: 1,
  solution: 3,
  unselected: 5
};
const emojis = {
  [counts.incorrect]: '🟥',
  [counts.category]: '🟨',
  [counts.solution]: '🟩',
  [counts.unselected]: '⬛',
};
var numTiles = config.board.cols * config.board.rows;
var maxUnselectedScore =  counts.unselected * (numTiles - config.selectionsPerAttempt);
var solutionScore = counts.solution * config.selectionsPerAttempt;
var maxScore = maxUnselectedScore + solutionScore;

const init2DArray = (r, c, content) => {
  return Array.from({ length: r }, _ => Array(c).fill(content));
};

const signCard = (scorecard) => {
  for (let { tileSelection, correctness } of scorecard.logs) {
    for (let { r, c } of tileSelection) {
      scorecard.card[r][c] = emojis[correctness];
    }
  }
}

const calcScore = (scorecard) => {
  let { numSelected, selectedScore } = scorecard.logs.reduce((acc, log) => {
    let numTilesLog = log.tileSelection.length;
    acc.numSelected += numTilesLog;
    acc.selectedScore += numTilesLog * log.correctness;
    return acc;
  }, { numSelected: 0, selectedScore: 0 });
  let unselectedScore = (numTiles - numSelected) * counts.unselected;
  scorecard.score = selectedScore + unselectedScore;
};

const getTodayKey = () => {
  const today = new Date();
  return `scorecard-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
};

const saveToLocalStorage = () => {
  try {
    const key = getTodayKey();

    const { card, logs, score, title } = scorecard;
    const correctSolution = scorecard.logs.some(log => log.correctness === counts.solution);

    const data = { card, logs, score, title, buzzer, correctSolution };

    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.log('saveToLocalStorage() Error!', err.message);
  }
};

const loadFromLocalStorage = () => {
  try {
    const key = getTodayKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
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
    console.log('loadFromLocalStorage() Error!', err.message);
  }
  return { loaded: false };
};

const scorecard = {
  card: init2DArray(config.board.rows, config.board.cols, emojis[counts.unselected]),
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

axios.interceptors.request.use((req) => {
  // check for buzzer - 'flip all' requests happen after buzzer
  if (req.url.includes('tile') && !buzzer) {
    let currentLog = scorecard.logs.at(-1);
    let currentTileSelection = currentLog.tileSelection;

    // req.params := { r, c }
    if (currentTurn && currentTileSelection.length < config.selectionsPerAttempt)
      currentTileSelection.push(req.params);
    else {
      currentTurn = true;

      let newLog = { tileSelection: [req.params], correctness: null };
      scorecard.logs.push(newLog);
    }
  }
  return req;
}, (err) => { return Promise.reject(err); });

axios.interceptors.response.use((res) => {
  let endpoint = res.config.url;
  if (endpoint.includes('check')) {
    let correct = res.data;
    currentTurn = correct;
    let currentLog = scorecard.logs.at(-1);

    if (endpoint.includes('solution')) {
      currentLog.correctness = correct ? counts.solution : counts.category;
    } else {
      currentLog.correctness = correct ? counts.category : counts.incorrect;
    }

    let correctSolution = currentLog.correctness === counts.solution;
    let atMaxAttempts = scorecard.logs.length === config.totalAttempts;
    buzzer = correctSolution || atMaxAttempts
    if (buzzer) {
      scorecard.init();
    }
  }
  return res;
}, (err) => { return Promise.reject(err); });

export default scorecard;