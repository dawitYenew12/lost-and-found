import mongooseLoader from './mongoose.js';
import expressLoader from './express.js';
import { logger } from '../utils/logger.js';

export default async (app) => {
    await mongooseLoader();
    logger.info('mongoose initiated!');
    await expressLoader(app);
}