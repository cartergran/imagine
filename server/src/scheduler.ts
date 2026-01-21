import Heroku from 'heroku-client';
import { config } from './config.js';
import type { HerokuConfigVars } from './types.js';

/**
  - updates the puzzle number in Heroku config vars and restarts the application
  - scheduled to run daily at midnight EST to increment the puzzle number
*/
export async function updatePuzzleAndRestart(): Promise<void> {
  try {
    const token = config.herokuApiToken;
    const appName = config.herokuAppName;
    const ogPuzzleNum = config.puzzleNum || '-1';
    const newPuzzleNum = parseInt(ogPuzzleNum, 10) + 1;

    const heroku = new Heroku({ token });
    const newEnvVar: Partial<HerokuConfigVars> = {
      PUZZLE_NUM: String(newPuzzleNum),
    };

    console.log('updatePuzzleAndRestart(): updating puzzle...');
    
    // update PUZZLE_NUM config var
    await heroku.patch(`/apps/${appName}/config-vars`, { body: newEnvVar });

    // verify update
    const updatedEnvVars = await heroku.get(`/apps/${appName}/config-vars`);
    console.log('updatePuzzleAndRestart(): puzzle updated! now:', updatedEnvVars.PUZZLE_NUM);

    // restart dynos to apply the new PUZZLE_NUM config var
    await heroku.delete(`/apps/${appName}/dynos`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('updatePuzzleAndRestart() error!', errorMessage);
  }
}
