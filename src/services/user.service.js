import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import ApiError from '../utils/ApiError.js';

export const createUser = async (userBody) => {
    const { email } = userBody;
    if(await User.isEmailRegistered(email)){
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already registered!');
    }
    const user = await User.create(userBody);
    return user;
}

export const getUserByEmail = async (email) => {
    return await User.findOne({ email });
}

export const getUserById = async (id) => {
    return await User.findById(id);
}