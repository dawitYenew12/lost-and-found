import { pipeline } from "@xenova/transformers";
import DescriptionEmbedding from '../models/descriptionEmbedding.model.js';
import { logger } from '../utils/logger.js';
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

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

export const handleDescriptionSimilarity = async (newCase) => {
    try {
        const description = `${newCase.description.eyeDescription} ${newCase.description.noseDescription} ${newCase.description.hairDescription} ${newCase.description.lastSeenAddressDes}`;
        const newCaseEmbedding = await generateEmbedding(description);
        const embeddingArray = newCaseEmbedding;
        const existingEmbeddings = await DescriptionEmbedding.find();
        let similarityArray = [];
        if (existingEmbeddings.length === 0) {
            await DescriptionEmbedding.create({ caseId: newCase.id, embedding: embeddingArray, similarity: similarityArray });
            logger.info('initial embedding sotered successfully');
            return;
        }

        const bulkOperations = [];
        for (const existingEmbedding of existingEmbeddings) {
            const score = calculateCosineSimilarity(embeddingArray, existingEmbedding.embedding);
            const similarityScore = parseFloat((score * 100).toFixed(2));
            existingEmbedding.similarity.push({ caseId: newCase.id, similarityScore });
            similarityArray.push({ caseId: existingEmbedding.caseId, similarityScore });
            bulkOperations.push({
                updateOne: {
                    filter: { _id: existingEmbedding._id },
                    update: { $set: { similarity: existingEmbedding.similarity } }
                }
            }); 
        }
        await DescriptionEmbedding.bulkWrite(bulkOperations);
        const newEmbedding = await DescriptionEmbedding.create({ caseId: newCase.id, embedding: embeddingArray, similarity: similarityArray });
        logger.info('embedding sotered successfully');
        return newEmbedding;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
    }
}

const descriptionService = { handleDescriptionSimilarity, generateEmbedding, calculateCosineSimilarity };
export default descriptionService;