import dotenv from "dotenv";
dotenv.config();

import envVarSchema from "../validations/env.validation.js";

const { error, value: envVars } = envVarSchema.validate(process.env);

export default {
  port: envVars.PORT,
  dbUri: envVars.MONGO_URI,
  env: envVars.NODE_ENV,
  jwt: {
    secret: envVars.JWT_SECRET_KEY,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESS_EXPIRATION_DAYS,
  },
};
