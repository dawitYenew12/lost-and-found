import express from 'express';
import passport from 'passport';
import cors from 'cors';
import authRouter from '../routes/auth.route.js';
import config from '../config/config.js';
import { errorConverter, errorHandler } from '../middleware/error.js';
import { jwtStrategy } from '../config/passport.js';
import httpStatus from 'http-status';

export default async (app) => {
    app.use(express.json());

    //initialize passport
    app.use(passport.initialize());
    passport.use('jwt', jwtStrategy);
    
    if (config.env === 'production') {
        app.use(cors({ origin: url }));
        app.options('*', cors({ origin: url }));
    } else {
        app.use(cors());
        app.options('*', cors());
    }

    app.use(authRouter);
    app.use((req, res, next) => {
        next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
      });
    app.use(errorConverter);
    app.use(errorHandler);
}