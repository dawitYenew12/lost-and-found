import httpStatus from 'http-status';
import MissingIndividual from '../models/missingPerson.model.js';
import ApiError from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import MatchingStatus from '../models/matchingStatus.model.js';

const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};

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

//                                     criteria, existingCase, descriptionSimilarityScore, newReq
const calculateSimilarityScore = async (criteria, existingCase, descriptionSimilarityScore, newReq, saveToDb) => {
    let matchingStatus = {};
    let aggregateSimilarity = 0;
    let fieldCount = 0;
    let highSimilarityFieldCount = 0;

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
            const [_, clothingType, clothingAttribute] = key.split(".");
            const attribute = clothingAttribute.charAt(0).toUpperCase() + clothingAttribute.slice(1);
            const clothing = `${clothingType}${attribute}`;
            matchingStatus[clothing] = calculateClothingSimilarity(existingCase, key, value);
            matchScore = matchingStatus[clothing];
        } else {
            matchingStatus[key] = existingCase[key] === value ? 100 : 0;
            matchScore = matchingStatus[key];
        }

        aggregateSimilarity += matchScore;
        if (matchScore >= 85) {
            highSimilarityFieldCount++;
        }
    }

    descriptionSimilarityScore.similarity.forEach((similarity) => {
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

    if (matchingStatus.aggregateSimilarity >= 70 && saveToDb) {
        await MatchingStatus.create({
            user_id: newReq.postedBy,
            newCaseId: descriptionSimilarityScore.caseId,
            existingCaseId: existingCase.id,
            matchingStatus,
        });
    }
    return matchingStatus;
};


export const compareWithExistingCases = async (criteria, existingCases, newReq, descriptionSimilarityScore, saveToDb) => {
    let matchingStatuses = [];
    await asyncForEach(existingCases, async (existingCase) => {
        const matchingStatus = await calculateSimilarityScore(criteria, existingCase, descriptionSimilarityScore, newReq, saveToDb);
        matchingStatuses.push({ caseId: existingCase.id, matchingStatus });
    });
    return matchingStatuses;
};

