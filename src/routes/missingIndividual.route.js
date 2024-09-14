import express from 'express';
const router = express.Router();
import { validate } from '../middleware/validate.js';
import { createMissingIndividualSchema } from '../validations/missingIndividual.validation.js';
import missingIndvController from '../controllers/missingIndividual.controller.js';

router.post('/add-missing-Individual', validate(createMissingIndividualSchema, 'body'), missingIndvController.createMissingIndividual);
router.post('/compare-missing-Individual', validate(createMissingIndividualSchema, 'body'), missingIndvController.compareMissingIndividual);
router.get('/get-missing-cases', missingIndvController.getMissingCases);

export default router;