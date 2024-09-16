import joi from 'joi';

const envVarSchema = joi.object({
    PORT: joi.number().default(3000),
    MONGO_URI: joi.string().required().description('MongoDB URI is required'),
    NODE_ENV: joi.string().valid('production', 'development', 'test').default('development'),
    JWT_SECRET_KEY: joi.string().required().description('JWT Secret Key is required'),
    JWT_ACCESS_EXPIRATION_MINUTES: joi.number().default(30),
    JWT_REFRESS_EXPIRATION_DAYS: joi.number().default(7),
    MAX_FAILS_BY_IP_PER_DAY: joi.number().default(100),
    MAX_CONSECUTIVE_FAILS_BY_EMAIL_AND_IP: joi.number().default(5),
    MAX_CONSECUTIVE_FAILS_BY_EMAIL: joi.number().default(3),
    COSINE_SIMILARITY_MULTIPLIER: joi.number().default(100),
}).unknown();

export default envVarSchema;
