import { RateLimiterMongo } from "rate-limiter-flexible";
import mongoose from "mongoose";
import config from "../config/config.js";
import { tokenTypes } from "../config/tokenTypes.js";
import { generateAuthTokens, verifyToken } from "./token.service.js";
import { getUserByEmail } from "./user.service.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

export const loginUser = async (email, password, ipAddress) => {
  const rateLimitOptions = {
    storeClient: mongoose.connection,
    dbName: "blog",
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 5 wrong attempts
  };

  const limitConsecutiveFailsByEmailAndIp = new RateLimiterMongo({
    ...rateLimitOptions,
    points: config.rateLimit.maxConsecutiveFailsByEmailAndIp,
    duration: 60 * 10,
  });

  const limitSlowBruteByIp = new RateLimiterMongo({
    ...rateLimitOptions,
    points: config.rateLimit.maxFailsByIp,
    duration: 60 * 60 * 24,
  });

  const limitConsecutiveFailsByEmail = new RateLimiterMongo({
    ...rateLimitOptions,
    points: config.rateLimit.maxConsecutiveFailsByEmail,
    duration: 60 * 60 * 24,
  });

  const promises = [limitSlowBruteByIp.consume(ipAddress)];
  const user = await getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    user && promises.push(
      limitConsecutiveFailsByEmailAndIp.consume(`${email}_${ipAddress}`),
      limitConsecutiveFailsByEmail.consume(email)
    );
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }
  return user;
};

export const refreshAuthTokens = async (refreshToken) => {
  try {
    const refreshTokenDoc = await verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.deleteOne();
    return generateAuthTokens(user.id);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};
