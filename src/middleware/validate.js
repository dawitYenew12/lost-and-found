import ApiError from '../utils/ApiError.js';

export const validate = (schema, source = 'body') => (req, res, next) => {
  const data = req[source];
  const { value, error } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message).join(', ');
    return next(new ApiError(400, errors));
  }
  req.validated = value;

  return next();
};
