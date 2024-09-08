import { Strategy as JwtStrategy , ExtractJwt } from "passport-jwt";
import config from './config.js';
import {tokenTypes} from './tokenTypes.js';
import { getUserById } from '../services/user.service.js';

const jwt_options = {secretOrKey: config.jwt.secret, jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()}

export const jwtStrategy = new JwtStrategy(jwt_options, async(payload, done) => {
    try {
        if (payload.type !== tokenTypes.ACCESS) {
            throw new Error('Invalid token type');
        }
        const user = getUserById(payload.sub);
        if(!user) {
            return done(null, false);
        }
        done(null, user);
    } catch (error) {
        done(error, false);
    }
})
