import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const imageSchema = new Schema({
    imagePath: {
        type: String,
        required: true,
      },
})

export const Image = model('Image', imageSchema);

export default Image;