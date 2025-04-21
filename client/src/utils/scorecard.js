import axios from 'axios';
import config from './config';

const magicNum = process.env.REACT_APP_MAGIC_NUM;
var buzzer = false;
var currentTurn = true;

const emojis = {
  [-1]: '🟥', // eslint-disable-next-line
  [0]: '⬛', // eslint-disable-next-line
  [1]: '🟨',
  [magicNum]: '🟩'
};

const init2DArray = (r, c, content) => {
  return Array.from({ length: r }, _ => Array(c).fill(content));
};

const initScore = (scorecard) => {
  for (let { tileSelection, correctness } of scorecard.logs) {
    for (let { r, c } of tileSelection) {
      scorecard.score[r][c] = emojis[correctness];
    }
  }
}

const scorecard = {
  init() {
    initScore(this);
    // TODO: calcStats(); ?
  },
  title: config.share,
  logs: [{ tileSelection: [], correctness: 0 }],
  score: init2DArray(config.board.rows, config.board.cols, emojis[0])
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

      let newLog = { tileSelection: [req.params], correctness: 0 };
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
      currentLog.correctness = correct ? magicNum : 1;
    } else {
      currentLog.correctness = correct ? 0 : -1;
    }

    buzzer = currentLog.correctness === magicNum || scorecard.logs.length === config.numAttempts
    if (buzzer) {
      scorecard.init();
    }
  }
  return res;
}, (err) => { return Promise.reject(err); });

export default scorecard;