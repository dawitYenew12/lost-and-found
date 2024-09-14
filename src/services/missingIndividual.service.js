import httpStatus from 'http-status';
import { MissingIndividual } from '../models/missingPerson.model.js';
import { compareWithExistingCases } from '../services/compareMissingCases.service.js';
import { calculateHash } from '../utils/hashCalculaor.js';
import { logger } from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import descriptionService from './description.service.js';

export const createMissingIndividual = async (missingIndividualBody) => {
      const inputHash = calculateHash(missingIndividualBody);
      const isMissingCaseExist = await MissingIndividual.findOne({ inputHash });
      let descriptionSimilariyScore;
      if (isMissingCaseExist) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Case already exists');
      } else {
           const newCase = await MissingIndividual.create({...missingIndividualBody, inputHash});
           logger.info('Missing case created successfully');
           descriptionSimilariyScore = await descriptionService.handleDescriptionSimilarity(newCase);
      }


      const { timeSinceDisappearance } = missingIndividualBody;
      let newReq;
      if (timeSinceDisappearance >= 2) {
            const {
                  lastSeenLocation,
                  medicalInformation,
                  circumstanceOfDisappearance,
                  ...base
            } = missingIndividualBody;
            newReq = {
                  ...base,
                  lastSeenLocation,
                  medicalInformation,
                  circumstanceOfDisappearance,
            };
      } else {
            const {
                  clothingUpperClothType,
                  clothingUpperClothColor,
                  clothingLowerClothType,
                  clothingLowerClothColor,
                  body_size,
                  ...base
            } = missingIndividualBody;
            newReq = {
                  ...base,
                  clothingUpperClothType,
                  clothingUpperClothColor,
                  clothingLowerClothType,
                  clothingLowerClothColor,
                  body_size,
            };
      }

      await compareWithExistingCases(timeSinceDisappearance, newReq, descriptionSimilariyScore);
}

const missingIndividualService = { createMissingIndividual };
export default missingIndividualService;