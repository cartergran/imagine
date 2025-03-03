import axios from 'axios';
import config from './config';

const magicNum = process.env.REACT_APP_MAGIC_NUM;

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
  for (let { tileClicks, correctness } of scorecard.logs) {
    for (let { r, c } of tileClicks) {
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
  logs: [{ tileClicks: [], correctness: 0 }],
  score: init2DArray(config.board.rows, config.board.cols, emojis[0])
};

axios.interceptors.request.use((req) => {
  if (req.url.includes('tile')) {
    let currentLog = scorecard.logs.at(-1);
    let currentTileClicks = currentLog.tileClicks;

    // req.params := { r, c }
    if (currentTileClicks.length < config.clicksPerAttempt)
      currentTileClicks.push(req.params);
    else {
      let newLog = { tileClicks: [req.params], correctness: 0 };
      scorecard.logs.push(newLog);
    }
  }
  return req;
}, (err) => { return Promise.reject(err); });

axios.interceptors.response.use((res) => {
  let endpoint = res.config.url;
  if (endpoint.includes('check')) {
    let correct = res.data;
    let currentLog = scorecard.logs.at(-1);

    if (endpoint.includes('solution')) {
      currentLog.correctness = correct ? magicNum : 1;
    } else {
      currentLog.correctness = correct ? 0 : -1;
    }

    if (currentLog.correctness === magicNum || scorecard.logs.length === config.numAttempts) {
      scorecard.init();
    }
  }
  return res;
}, (err) => { return Promise.reject(err); });

export default scorecard;