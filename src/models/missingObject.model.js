import { required } from 'joi';
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const missingObjectSchema = new Schema({
    postedBy: {
        type: string,
        required: true,
        ref: "User"
    },

})