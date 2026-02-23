import Heroku from 'heroku-client';
import type { Storage } from '@google-cloud/storage';

import { config } from '../config.js';
import { initializeScoresFile } from './scores.service.js';

import type { HerokuConfigVars } from '../types.js';

/**
  - updates the puzzle number in Heroku config vars and restarts the application
  - scheduled to run daily at midnight EST to increment the puzzle number
  - initializes an empty scores file for the new puzzle before updating
  - @param storage - GCS Storage instance (injected from caller)
*/
export async function updatePuzzleAndRestart(storage: Storage): Promise<void> {
  try {
    const token = config.herokuApiToken;
    const appName = config.herokuAppName;
    const ogPuzzleNum = config.puzzleNum || '-1';
    const newPuzzleNumInt = parseInt(ogPuzzleNum, 10) + 1;
    const newPuzzleNumStr = String(newPuzzleNumInt);

    console.log('updatePuzzleAndRestart(): updating puzzle...');

    const scoresInitialized = await initializeScoresFile(
      storage,
      config.bucketName,
      newPuzzleNumStr
    );

    if (!scoresInitialized) {
      console.error('updatePuzzleAndRestart(): failed to initialize scores file, aborting update');
      return;
    }

    const heroku = new Heroku({ token });
    const newEnvVar: Partial<HerokuConfigVars> = {
      PUZZLE_NUM: newPuzzleNumStr,
    };

    await heroku.patch(`/apps/${appName}/config-vars`, { body: newEnvVar });

    const updatedEnvVars = await heroku.get(`/apps/${appName}/config-vars`);
    console.log('updatePuzzleAndRestart(): puzzle updated! now:', updatedEnvVars.PUZZLE_NUM);

    await heroku.delete(`/apps/${appName}/dynos`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('updatePuzzleAndRestart() error!', errorMessage);
  }
}
