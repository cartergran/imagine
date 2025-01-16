import axios from 'axios';
import config from './config';
import metadata from '../../package.json';

const scorecard = {
  title: `${metadata.name} #${config.day}`,
  history: []
};

axios.interceptors.request.use((req) => {
  // req.params := { r, c }
  req.url.includes('tile') && scorecard.history.push({ loc: req.params });
  return req;
}, (err) => { return Promise.reject(err); });

axios.interceptors.response.use((res) => {
  if (res.config.url.includes('check')) {
    let last = scorecard.history.at(-1);
    last.correct = res.data;
  }
  return res;
}, (err) => { return Promise.reject(err); });

export default scorecard;