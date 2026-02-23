import { scheduleJob } from 'node-schedule';

import { config, validateConfig } from './config.js';
import { createApp } from './app.js';
import { init } from './services/puzzle.service.js';
import { storage } from './services/gcs.service.js';
import { updatePuzzleAndRestart } from './services/scheduler.service.js';

validateConfig();

await init();

const app = createApp();

app.listen(config.port, (): void => {
  console.log(`Server listening on ${config.port}`);
});

// schedule daily puzzle update at midnight EST
scheduleJob({ rule: '0 0 * * *', tz: 'America/New_York' }, () => updatePuzzleAndRestart(storage));
