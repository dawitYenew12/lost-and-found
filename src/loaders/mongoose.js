import mongoose from "mongoose";
import config from "../config/config.js";
import { logger } from '../utils/logger.js';

export default async () => {
    const connection = await mongoose.connect(config.dbUri);
    return connection;
}