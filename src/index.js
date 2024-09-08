import express from 'express';
import http from 'http';
import config from './config/config.js';
import { logger } from './utils/logger.js';
import loader from './loaders/index.js';

function exitHandler (server) {
    if (server) {
        server.close(() => {
            logger.info('Server closed!');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
}

function unExpectedErrorHandler (server) {
    return function(error) {
        logger.error(error);
        exitHandler(server);
    }
}

const startServer = async () => {
    const app = express();
    loader(app);
    const httpServer = http.createServer(app);
    const server = httpServer.listen(config.port, () => {
       logger.info(`Server running on port ${config.port}`);
    });
    process.on('uncaughtException', unExpectedErrorHandler(server));
    process.on('unhandledRejection', unExpectedErrorHandler(server));
    process.on('SIGTERM', () => {
        logger.info('SIGTERM recieved');
        if (server) {
            server.close();
        }
    })
}

startServer();