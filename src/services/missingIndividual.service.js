import httpStatus from 'http-status';
import { MissingIndividual } from '../models/missingPerson.model.js';
import { compareWithExistingCases } from '../services/compareMissingCases.service.js';
import { calculateHash } from '../utils/hashCalculaor.js';
import { logger } from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import descriptionService from './description.service.js';

const handleTimeSinceDisappearance = (timeSinceDisappearance, body) => {
      if (timeSinceDisappearance >= 2) {
            const { lastSeenLocation, medicalInformation, circumstanceOfDisappearance, ...base } = body;
            return { ...base, lastSeenLocation, medicalInformation, circumstanceOfDisappearance };
      } else {
            const { clothingUpperClothType, clothingUpperClothColor, clothingLowerClothType, clothingLowerClothColor, body_size, ...base } = body;
            return { ...base, clothingUpperClothType, clothingUpperClothColor, clothingLowerClothType, clothingLowerClothColor, body_size };
      }
};


const buildCriteria = (newCase, timeSinceDisappearance) => {
      const criteria = {
            "name.firstName": newCase.name.firstName,
            "name.middleName": newCase.name.middleName,
            "name.lastName": newCase.name.lastName,
            gender: newCase.gender,
            age: newCase.age,
            skin_color: newCase.skin_color,
            body_size: newCase.body_size,
            description: {
                  eyeDescription: newCase.description.eyeDescription,
                  noseDescription: newCase.description.noseDescription,
                  hairDescription: newCase.description.hairDescription,
                  lastSeenAddressDes: newCase.description.lastSeenAddressDes
            }
      };

      if (timeSinceDisappearance <= 2) {
            criteria["clothing.upper.clothType"] = newCase.clothing.upper.clothType;
            criteria["clothing.upper.clothColor"] = newCase.clothing.upper.clothColor;
            criteria["clothing.lower.clothType"] = newCase.clothing.lower.clothType;
            criteria["clothing.lower.clothColor"] = newCase.clothing.lower.clothColor;
      } else {
            criteria["lastSeenLocation"] = newCase.lastSeenLocation;
            criteria["medicalInformation"] = newCase.medicalInformation;
            criteria["circumstanceOfDisappearance"] = newCase.circumstanceOfDisappearance;
      }
      return criteria;
};


const getExistingCases = async (timeSinceDisappearance, newCaseId) => {
      const queryCondition = timeSinceDisappearance > 2
            ? { timeSinceDisappearance: { $gt: 2 }, _id: { $ne: newCaseId } }
            : { timeSinceDisappearance: { $lte: 2 }, _id: { $ne: newCaseId } };

      return await MissingIndividual.find(queryCondition);
};


export const createMissingIndividual = async (missingIndividualBody) => {
      const inputHash = calculateHash(missingIndividualBody);
      const isMissingCaseExist = await MissingIndividual.findOne({ inputHash });

      if (isMissingCaseExist) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Case already exists');
      }

      const newCase = await MissingIndividual.create({ ...missingIndividualBody, inputHash });
      logger.info('Missing case created successfully');
      const descriptionSimilarityScore = await descriptionService.handleDescriptionSimilarity(newCase, true);
      
      const { timeSinceDisappearance } = missingIndividualBody;
      const newReq = handleTimeSinceDisappearance(timeSinceDisappearance, missingIndividualBody);
      const criteria = buildCriteria(newReq, timeSinceDisappearance);
      const existingCases = await getExistingCases(timeSinceDisappearance, newCase.id);
      if (existingCases.length === 0) {
            throw new ApiError(httpStatus.NO_CONTENT, 'No existing cases found');
      }
      await compareWithExistingCases(criteria, existingCases, newReq, descriptionSimilarityScore, true);
};

export const compareMissingIndividual = async (missingIndividualBody) => {
      const { timeSinceDisappearance } = missingIndividualBody;
      const newReq = handleTimeSinceDisappearance(timeSinceDisappearance, missingIndividualBody);
      const criteria = buildCriteria(newReq, timeSinceDisappearance);
      const existingCases = await getExistingCases(timeSinceDisappearance, null);
      const descriptionSimilarityScore = await descriptionService.handleDescriptionSimilarity(newReq, false);
      if (existingCases.length === 0) {
            throw new ApiError(httpStatus.NO_CONTENT, 'No existing cases found');
      }
      return await compareWithExistingCases(criteria, existingCases, newReq, descriptionSimilarityScore, false);
}

const missingIndividualService = { createMissingIndividual, compareMissingIndividual };
export default missingIndividualService;