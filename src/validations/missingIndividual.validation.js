import Joi from "joi";
const clothingSchema = Joi.object({
  upper: Joi.object({
    clothType: Joi.string()
      .valid("tshirt", "hoodie", "sweater", "sweetshirt")
      .required(),
    clothColor: Joi.string()
      .valid(
        "red",
        "blue",
        "white",
        "black",
        "orange",
        "light blue",
        "brown",
        "blue black",
        "yellow"
      )
      .required(),
  }).required(),
  lower: Joi.object({
    clothType: Joi.string()
      .valid("trouser", "short", "nothing", "boxer")
      .required(),
    clothColor: Joi.string()
      .valid(
        "red",
        "blue",
        "white",
        "black",
        "orange",
        "light blue",
        "brown",
        "blue black",
        "yellow"
      )
      .required(),
  }).required(),
});

export const createMissingIndividualSchema = Joi.object({
    postedBy: Joi.string().required(),
    dateReported: Joi.date().default(Date.now),
    image: Joi.string().required(), // Assuming the image is referenced by ObjectId (string)
    status: Joi.string()
      .valid("missing", "pending", "found")
      .default("missing"),
    gender: Joi.string()
      .valid("male", "female")
      .required(),
    age: Joi.number().required(),
    skin_color: Joi.string()
      .valid("fair", "black", "white", "tseyim", "light")
      .required(),
    clothing: clothingSchema.required(), // Embedding the clothing schema
    body_size: Joi.string().valid(
      "thin",
      "average",
      "muscular",
      "overweight",
      "obese",
      "fit",
      "athletic",
      "curvy",
      "petite",
      "fat",
      "medium"
    ),
    timeSinceDisappearance: Joi.number(),
    inputHash: Joi.string().required(), // Assuming it's a hash, adjust regex if specific format is needed
  });
  
  export default createMissingIndividualSchema;