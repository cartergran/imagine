import { Heroku } from 'heroku-client';

const updateEnvVars = async () => {
  try {
    const heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN });

    const tmp = parseInt(process.env.REACT_APP_PUZZLE_NUM);

    const newEnvVars = {
      REACT_APP_DAY: parseInt(process.env.REACT_APP_DAY) + 1
    };

    console.log('updateEnvVars(): updating day...', );
    await heroku.patch(`/apps/${appName}/config-vars`, { body: newEnvVars });
    console.log('updateEnvVars(): environment variables updated!');
  
  } catch (err) {
    console.log('updateEnvVars() error!', err.message);

    // signal heroku scheduler job failed
    process.exit(1);
  }
};

updateEnvVars();