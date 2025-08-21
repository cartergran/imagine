import axios from 'axios';
import config from './config';

var buzzer = false;
var currentTurn = true;

const counts = {
  incorrect: 0,
  category: 1,
  solution: 2,
  unselected: 3
};
const emojis = {
  [counts.incorrect]: '🟥',
  [counts.category]: '🟨',
  [counts.solution]: '🟩',
  [counts.unselected]: '⬛',
};
var numTiles = config.board.cols * config.board.rows;
var maxScore = ((numTiles - 1) * counts.unselected) + counts.solution;

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

const scorecard = {
  init() {
    signCard(this);
    calcScore(this);
    // \u{1F0CF} := joker playing card emoji
    scorecard.title = `${config.context} \u{1F0CF}${scorecard.score}/${maxScore}`;
    // TODO: calcStats(); ?
  },
  title: '',
  logs: [{ tileSelection: [], correctness: null }],
  card: init2DArray(config.board.rows, config.board.cols, emojis[counts.unselected]),
  score: 0
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