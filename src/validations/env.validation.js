import joi from 'joi';

const envVarSchema = joi.object({
    PORT: joi.number().default(3000),
    MONGODB_URL: joi.string().required(),
}).unknown();

export default envVarSchema;