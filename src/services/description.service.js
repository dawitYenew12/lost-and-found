import httpStatus from "http-status";
import DescriptionEmbedding from '../models/descriptionEmbedding.model.js';
import ApiError from "../utils/ApiError.js";
import { pipeline } from "@xenova/transformers";
import { logger } from '../utils/logger.js';
import config from "../config/config.js";

const calculateCosineSimilarity = (embedding1, embedding2) => {
    let dotProduct = 0;
    for (let i = 0; i < embedding1.length; i++) {
        dotProduct += embedding1[i] * embedding2[i];
    }
    const magnitude1 = Math.sqrt(
        embedding1.reduce((acc, val) => acc + Math.pow(val, 2), 0)
    );
    const magnitude2 = Math.sqrt(
        embedding2.reduce((acc, val) => acc + Math.pow(val, 2), 0)
    );
    const similarity = dotProduct / (magnitude1 * magnitude2);
    return similarity;
};

const generateEmbedding = async (description) => {
    const model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = await model(description);
    return Array.from(output.data);
}

const calculateDescriptionSimilarity = async (newCaseEmbedding) => {
    const existingEmbeddings = await DescriptionEmbedding.find();
    let similarityArray = [];

    for (const existingEmbedding of existingEmbeddings) {
        const score = calculateCosineSimilarity(newCaseEmbedding, existingEmbedding.embedding);
        const similarityScore = parseFloat((score * config.cosSimilarityMultiplier).toFixed(2));
        similarityArray.push({ caseId: existingEmbedding.caseId, similarityScore });
    }

    return similarityArray;
};

export const handleDescriptionSimilarity = async (newCase, saveToDb = true) => {
    try {
        const description = [
            newCase.description.eyeDescription,
            newCase.description.noseDescription,
            newCase.description.hairDescription,
            newCase.description.lastSeenAddressDes
        ].join(' ');
        const newCaseEmbedding = await generateEmbedding(description);
        const similarityScores = await calculateDescriptionSimilarity(newCaseEmbedding);
        if (!saveToDb) {
            return {similarity: similarityScores};
        }

        const bulkOperations = similarityScores.map((score) => ({
            updateOne: {
                filter: { caseId: score.caseId },
                update: { $push: { similarity: { caseId: newCase.id, similarityScore: score.similarityScore } } },
            },
        }));

        await DescriptionEmbedding.bulkWrite(bulkOperations);

        const newEmbeddingEntry = await DescriptionEmbedding.create({
            caseId: newCase.id,
            embedding: newCaseEmbedding,
            similarity: similarityScores
        });

        logger.info('embedding sotered successfully');
        return newEmbeddingEntry;
    } catch (error) {
        logger.error(error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
    }
}

const descriptionService = { handleDescriptionSimilarity, generateEmbedding, calculateCosineSimilarity };
export default descriptionService;