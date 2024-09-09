import express from 'express';
const router = express.Router();
import { register, login } from "../controllers/auth.controller.js";
import { validate } from '../middleware/validate.js';
import { createUserSchema } from '../validations/user.validation.js';
import { loginSchema } from '../validations/auth.validation.js';
import { rateLimiterRoute } from '../middleware/authLimiter.js';

router.post('/auth/register', validate(createUserSchema), register);
router.post('/auth/login', rateLimiterRoute, validate(loginSchema), login);

export default router;
