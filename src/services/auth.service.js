import { tokenTypes } from "../config/tokenTypes.js";
import { generateAuthTokens, verifyToken } from "./token.service.js";
import { getUserByEmail } from "./user.service.js";

export const loginUser = async (email, password) => {
    const user = await getUserByEmail(email);
    if(!user || !(await user.isPasswordMatch(password))){
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }
    return user;
}

export const refreshAuthTokens = async (refreshToken) => {
    try {
        const refreshTokenDoc = await verifyToken(refreshToken, tokenTypes.REFRESH);
        const user = await getUserById(refreshTokenDoc.user);
        if(!user){
            throw new Error();
        }
        await refreshTokenDoc.deleteOne();
        return generateAuthTokens(user.id);
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
}