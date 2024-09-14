import Joi from 'joi';
import mongoose from 'mongoose';

const objectId = (value, helpers) => {
  // Validate that the value is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message('"{{#label}}" must be a valid ObjectId');
  }
  return value;
};

const matchingStatusValidation = Joi.object({
  user_id: Joi.string().custom(objectId).required(),
  newCaseId: Joi.string().custom(objectId).required(),
  existingCaseId: Joi.string().custom(objectId).required(),
  matchingStatus: Joi.object({
    age: Joi.number().min(0).max(150), // Assuming age is in the range 0-150
    firstName: Joi.number().min(0).max(100),
    middleName: Joi.number().min(0).max(100),
    lastName: Joi.number().min(0).max(100),
    gender: Joi.number().min(0).max(100),
    skin_color: Joi.number().min(0).max(100),
    description: Joi.number().min(0).max(100),
    similarityScore: Joi.number().min(0).max(100),
    upperClothType: Joi.number().min(0).max(100),
    upperClothColor: Joi.number().min(0).max(100),
    lowerClothType: Joi.number().min(0).max(100),
    lowerClothColor: Joi.number().min(0).max(100),
    body_size: Joi.number().min(0).max(100),
    lastSeenLocation: Joi.number().min(0).max(100),
    medicalInformation: Joi.number().min(0).max(100),
    circumstanceOfDisappearance: Joi.number().min(0).max(100),
    aggregateSimilarity: Joi.number().min(0).max(100)
  }).required()
});

export default matchingStatusValidation;
