import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import config from "../config/config.js";
import { tokenTypes } from "../config/tokenTypes.js";
import Token from "../models/token.model.js";

const generateTokens = (userId, expires, type, secret = config.jwt.secret) => {
  const payLoad = {
    sub: userId,
    issueDate: dayjs().unix(),
    expTime: expires.unix(),
    type,
  };
  return jwt.sign(payLoad, secret);
};

const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });

  return tokenDoc;
};

export const generateAuthTokens = async (userId) => {
  const accessTokenExpires = dayjs().add(
    config.jwt.accessExpirationMinutes,
    "minutes"
  );
  const accessToken = generateTokens(
    userId,
    accessTokenExpires,
    tokenTypes.ACCESS
  );

  const refreshTokenExpires = dayjs().add(
    config.jwt.refreshExpirationDays,
    "days"
  );
  const refreshToken = generateTokens(
    userId,
    refreshTokenExpires,
    tokenTypes.REFRESH
  );

  await saveToken(
    refreshToken,
    userId,
    refreshTokenExpires,
    tokenTypes.REFRESH
  );

  return {
    access: { token: accessToken, expires: accessTokenExpires.toDate() },
    refresh: { token: refreshToken, expires: refreshTokenExpires.toDate() },
  };
};

export const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({
    token,
    type,
    user: payload.sub,
    blacklisted: false,
  });

  if(!tokenDoc){
    throw new Error('Token not found');
  };

  return tokenDoc;
}
