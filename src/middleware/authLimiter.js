import { RateLimiterMongo } from "rate-limiter-flexible";
import mongoose from "mongoose";
import config from '../config/config.js';
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

const rateLimitOptions = {
    storeClient: mongoose.connection,
    dbName: 'blog',
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 5 wrong attempts
}

const limitConsecutiveFailsByEmailAndIp = new RateLimiterMongo({
    ...rateLimitOptions,
    points: config.rateLimit.maxConsecutiveFailsByEmailAndIp,
    duration: 60 * 10,
})

const limitSlowBruteByIp = new RateLimiterMongo({
    ...rateLimitOptions,
    points: config.rateLimit.maxFailsByIp,
    duration: 60 * 60 * 24,
})

const limitConsecutiveFailsByEmail = new RateLimiterMongo({
    ...rateLimitOptions,
    points: config.rateLimit.maxConsecutiveFailsByEmail,
    duration: 60 * 60 * 24,
})

export const rateLimiterRoute = async (req, res, next) => {
    const ipAddress = req.connection.remoteAddress;
    const emailAndIpKey = `${req.body.email}_${ipAddress}`;
    const email = req.body.email;

    const [resEmailAndIP, resSlowByIP, resEmailBrute] = await Promise.all([
        limitConsecutiveFailsByEmailAndIp.get(emailAndIpKey),
        limitSlowBruteByIp.get(ipAddress),
        limitConsecutiveFailsByEmail.get(email),
    ])

    let retrySecs = 0;
    if (resSlowByIP && resSlowByIP.consumedPoints >= config.rateLimit.maxFailsByIp) {
        retrySecs = Math.floor(resSlowByIP.msBeforeNext / 1000) || 1;
    } else if(resEmailAndIP && resEmailAndIP.consumedPoints >= config.rateLimit.maxConsecutiveFailsByEmailAndIp) {
        retrySecs = Math.floor(resEmailAndIP.msBeforeNext / 1000) || 1;
    } else if(resEmailBrute && resEmailBrute.consumedPoints >= config.rateLimit.maxConsecutiveFailsByEmail) {     
        retrySecs = Math.floor(resEmailBrute.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
        res.set('Retry-After', String(retrySecs));
        return next( new ApiError(httpStatus.TOO_MANY_REQUESTS, 'Too Many Requests'));
    }
    next();
}


