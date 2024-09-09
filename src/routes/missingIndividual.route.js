import express from 'express';
const router = express.Router();
import { validate } from '../middleware/validate.js';
import createMissingIndividual from '../controllers/missingIndividual.controller.js';

router.post('/add/missing-Individual', createMissingIndividual);

export default router;