import httpStatus from 'http-status';
import missingIndividualService from '../services/missingIndividual.service.js';
import catchAsync from '../utils/catchAsync.js';
import { logger } from '../utils/logger.js';

export const createMissingIndividual = catchAsync(async (req, res) => {
    await missingIndividualService.createMissingIndividual(req.body);
    res.status(httpStatus.CREATED).json({ success: true, message: "missing individual case created successfully" });
});

export const compareMissingIndividual = catchAsync(async (req, res) => {});
export const getMissingCases = catchAsync(async (req, res) => {});

const missingIndvController = {
    createMissingIndividual,
    compareMissingIndividual,
    getMissingCases,
};

export default missingIndvController;