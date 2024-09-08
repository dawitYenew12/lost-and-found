import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const imageEmbeddingSchema = new Schema({
    imageId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Image'
      },
      embedding: {
        type: [Number],
        required: true,
      },
})

export const personImageEmbedding = model('PersonImageEmbedding', imageEmbeddingSchema);

export default personImageEmbedding;