import mongoose from "mongoose";
const { Schema, model } = mongoose;

const clothingSchema = new Schema({
    upper: {
      clothType: {
        type: String,
        enum: ["tshirt", "hoodie", "sweater", "sweetshirt"],
        required: true,
      },
      clothColor: {
        type: String,
        enum: [
          "red",
          "blue",
          "white",
          "black",
          "orange",
          "light blue",
          "brown",
          "blue black",
          "yellow",
        ],
        required: true,
      },
    },
    lower: {
      clothType: {
        type: String,
        enum: ["trouser", "short", "nothing", "boxer"],
        required: true,
      },
      clothColor: {
        type: String,
        enum: [
          "red",
          "blue",
          "white",
          "black",
          "orange",
          "light blue",
          "brown",
          "blue black",
          "yellow",
        ],
        required: true,
      },
    },
    _id: false,
  });


const missingPersonSchema = new Schema({
  postedBy: {
    type: String,
    required: true,
    ref: "User",
  },
  dateReported: { type: Date, default: Date.now },
  image: { type: Schema.Types.ObjectId, ref: "Image" },
  status: { type: String, enum: ["missing", "pending", "found"], default: "missing" },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  skin_color: {
    type: String,
    enum: ["fair", "black", "white", "tseyim", "light"],
    required: true,
  },
  clothing: clothingSchema,
  body_size: {
    type: String,
    enum: [
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
      "medium",
    ],
  },
  timeSinceDisappearance: {
    type: Number
  },
  inputHash: {
    type: String,
    unique: true,
  },
});

export const MissingIndividual = model("MissingIndividual", missingPersonSchema);

export default MissingIndividual;