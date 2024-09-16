import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    logger.info(error);
    const statusCode =
      error.statusCode || error instanceof mongoose.Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

export const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;
    const response = {
      error: true,
      code: statusCode,
      message: message,
      ...(config.env === 'development' && { stack: err.stack }),
    }

    if (config.env === 'production' && !err.isOperational) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR,
        message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    }

    res.status(statusCode).send(response);
}
