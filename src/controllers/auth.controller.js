import { generateAuthTokens } from "../services/token.service.js";
import { createUser } from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js";
import httpStatus from "http-status";
import { loginUser } from "../services/auth.service.js";

export const register = catchAsync(async (req, res) => {
  const user = await createUser(req.body);
  const tokens = await generateAuthTokens(user.id);
  res.status(httpStatus.CREATED).json({
    message: `registered successfully!`,
    user: user,
    tokens,
  });
});

export const login = catchAsync(async (req, res) => {
  let { email, password } = req.body;
  const user = await loginUser(email, password);
  const tokens = await generateAuthTokens(user.id);
  res.status(httpStatus.OK).json({ user, tokens });
});
