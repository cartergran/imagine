import Heroku from 'heroku-client';

const updatePuzzleAndRestart = async () => {
  try {
    const token = process.env.HEROKU_API_TOKEN || '';
    const appName = process.env.HEROKU_APP_NAME || '';
    const ogPuzzleNum = process.env.REACT_APP_PUZZLE_NUM || '-1';
    const newPuzzleNum = parseInt(ogPuzzleNum) + 1;

    const heroku = new Heroku({ token });
    const newEnvVar = {
      REACT_APP_PUZZLE_NUM: String(newPuzzleNum)
    };

    console.log('updatePuzzleAndRestart(): updating puzzle...', );
    await heroku.patch(`/apps/${appName}/config-vars`, { body: newEnvVar });

    const updatedEnvVars = await heroku.get(`/apps/${appName}/config-vars`);
    console.log('updatePuzzleAndRestart(): puzzle updated! now:', updatedEnvVars.REACT_APP_PUZZLE_NUM);

    // restart dynos
    await heroku.delete(`/apps/${appName}/dynos`);
  } catch (err) {
    console.log('updatePuzzleAndRestart() error!', err.message);
  }
};

export { updatePuzzleAndRestart };