import httpStatus from 'http-status';
import MissingIndividual from '../models/missingPerson.model.js';
import ApiError from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import MatchingStatus from '../models/matchingStatus.model.js';

const calculateAgeSimilarity = (value, existingCaseAge) => {
    const ageRanges = {
        "1-4": { $gte: 1, $lte: 4 },
        "5-10": { $gte: 5, $lte: 10 },
        "11-15": { $gte: 11, $lte: 15 },
        "16-20": { $gte: 16, $lte: 20 },
        "21-30": { $gte: 21, $lte: 30 },
        "31-40": { $gte: 31, $lte: 40 },
        "41-50": { $gte: 41, $lte: 50 },
        ">51": { $gt: 51 },
    };

    if (existingCaseAge === value) {
        return 100;
    } else {
        const newReqAgeRange = Object.keys(ageRanges).find((range) => ageRanges[range].$gte <= value && ageRanges[range].$lte >= value);
        const existingReqAgeRange = Object.keys(ageRanges).find((range) => ageRanges[range].$gte <= existingCaseAge && ageRanges[range].$lte >= existingCaseAge);
        return newReqAgeRange === existingReqAgeRange ? 85 : 0;
    }
}

const calculateClothingSimilarity = (existingCase, key, value) => {
    const [_, clothingType, clothingAttribute] = key.split(".");
    const existingClothing = existingCase.clothing[clothingType][clothingAttribute];

    if ((existingClothing === "blue" && value === "light blue") ||
        (existingClothing === "light blue" && value === "blue") ||
        (existingClothing === "yellow" && value === "orange") ||
        (existingClothing === "orange" && value === "yellow")) {
        return 85;
    } else {
        return existingClothing === value ? 100 : 0;
    }
}

const calculateSimilarityScore = async (criteria, existingCase, descriptionSimilariyScore, newCase) => {
    logger.info(JSON.stringify(newCase))
    let matchingStatus = {};
    let aggregateSimilarity = 0;
    let fieldCount = 0;
    let highSimilarityFieldCount = 0;
    logger.info(`Comparing with case ${existingCase.id}`);
    for (const [key, value] of Object.entries(criteria)) {
        fieldCount++;
        let matchScore = 0;
        if (key === 'age') {
            matchingStatus.age = calculateAgeSimilarity(value, existingCase.age);
            matchScore = matchingStatus.age;
        } else if (key.startsWith('name.')) {
            const nameType = key.split(".")[1];
            matchingStatus[nameType] = (existingCase.name[nameType]).toUpperCase() === value.toUpperCase() ? 100 : 0;
            matchScore = matchingStatus[nameType];
        } else if (key.startsWith('clothing')) {
            let simplifiedKey = key.replace("clothing.", "");
            simplifiedKey = simplifiedKey.charAt(0).toUpperCase() + simplifiedKey.slice(1);
            matchingStatus[simplifiedKey] = calculateClothingSimilarity(existingCase, key, value);
            matchScore = matchingStatus[simplifiedKey];
        } else {
            matchingStatus[key] = existingCase[key] === value ? 100 : 0;
            matchScore = matchingStatus[key];
        }

        aggregateSimilarity += matchScore;
        if (matchScore >= 85) {
            highSimilarityFieldCount++;
        }
    }
    descriptionSimilariyScore.similarity.forEach((similarity) => {
        if (similarity.caseId.equals(existingCase.id)) {
            matchingStatus.description = similarity.similarityScore;
            aggregateSimilarity += similarity.similarityScore;
            if (similarity.similarityScore >= 85) {
                highSimilarityFieldCount++;
            }
        }
    });
    fieldCount++;
    matchingStatus.aggregateSimilarity = parseFloat((aggregateSimilarity / fieldCount).toFixed(2));
    if (matchingStatus.aggregateSimilarity >= 70) {
        await MatchingStatus.create({
            user_id: newCase.postedBy,
            newCaseId: descriptionSimilariyScore._id,
            existingCaseId: existingCase.id,
            matchingStatus,
          });
    }
}

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
    }

    return criteria;
};


const getExistingCases = async () => {
    return await MissingIndividual.find({ timeSinceDisappearance: { $gt: 2 } });
}

export const compareWithExistingCases = async (timeSinceDisappearance, newCase, descriptionSimilariyScore) => {
    const criteria = buildCriteria(newCase, timeSinceDisappearance);
    const existingCases = await getExistingCases();
    if (existingCases.length <= 1) {
        return new ApiError(httpStatus.NO_CONTENT, 'Nothing to compare with');
    }
    existingCases.map((existingCase) => calculateSimilarityScore(criteria, existingCase, descriptionSimilariyScore, newCase));
    logger.info('Comparison completed successfully');
    return existingCases;
};

