import axios from 'axios';
import config from './config';
import metadata from '../../package.json';

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

const scorecard = {
  title: `${metadata.name} #${config.day}`,
  log: [],
  score: init2DArray(config.boardLayout.rows, config.boardLayout.cols, emojis[0])
};

const initScore = () => {
  for (let { loc, correctness } of scorecard.log) {
    scorecard.score[loc.r][loc.c] = emojis[correctness];
  }
};

axios.interceptors.request.use((req) => {
  // req.params := { r, c }
  req.url.includes('tile') && scorecard.log.push({ loc: req.params });
  return req;
}, (err) => { return Promise.reject(err); });

axios.interceptors.response.use((res) => {
  let endpoint = res.config.url;
  if (endpoint.includes('check')) {
    let correct = res.data;
    let last = scorecard.log.at(-1);
    if (endpoint.includes('solution')) { /* /check-solution */
      last.correctness = correct ? magicNum : 1;
      correct && initScore();
    } else { /* /check-category */
      last.correctness = correct ? 0 : -1;
    }
  }
  return res;
}, (err) => { return Promise.reject(err); });

export default scorecard;