import { Storage } from '@google-cloud/storage';

import { getGCSCredentials } from '../config.js';

export const storage = new Storage({ credentials: getGCSCredentials() });
