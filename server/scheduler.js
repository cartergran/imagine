import Heroku from 'heroku-client';

const updateEnvVars = async () => {
  try {
    const token = process.env.HEROKU_API_TOKEN || '';
    const appName = process.env.HEROKU_APP_NAME || '';
    const puzzleNum = process.env.REACT_APP_PUZZLE_NUM || '-1';

    const heroku = new Heroku({ token });
    const newEnvVar = {
      REACT_APP_PUZZLE_NUM: parseInt(puzzleNum) + 1
    };

    console.log('updateEnvVars(): updating day...', );
    await heroku.patch(`/apps/${appName}/config-vars`, { body: newEnvVar });
    console.log('updateEnvVars(): day updated!');
  } catch (err) {
    console.log('updateEnvVars() error!', err.message);
    process.exit(1);
  }
};

export { updateEnvVars };