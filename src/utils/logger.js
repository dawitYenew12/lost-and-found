import {createLogger, format, transports } from "winston";
import config from "../config/config.js";

const { combine, timestamp, printf, colorize } = format;

const winstonFormat = printf(( {level, message, timestamp, stack} ) => {
    return `${timestamp}: ${level}: ${stack || message}`;
})
export const logger = createLogger({
    level: config.env === "development" ? "debug" : "info",
    format: combine(
        timestamp(),
        config.env === 'production' ? winstonFormat : combine(colorize(), winstonFormat),
    ),
    transports: [new transports.Console()],
})