import jwt from 'jsonwebtoken';
import { sharedEnvironment } from '../shared-environment';
import { AuthUser } from './auth-user';
import { jwtPayloadFields, JwtUserPayload } from './user.model';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from './jwt.config';

export function generateAccessToken(user: AuthUser): string {
    const jwtPayload = extractJwtPayload(user);
    const accessToken = jwt.sign(
        jwtPayload,
        sharedEnvironment.accessTokenSecret,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY,
        }
    );

    return accessToken;
}

export function verifyAccessToken(token: string): JwtUserPayload | false {
    let verified: JwtUserPayload | false = false;

    jwt.verify(token, sharedEnvironment.accessTokenSecret, (err, user) => {
        if (!err) {
            verified = user ? (user as JwtUserPayload) : false;
        }
    });

    return verified;
}

export function generateRefreshToken(user: AuthUser): string {
    const jwtPayload = extractJwtPayload(user);
    const accessToken = jwt.sign(
        jwtPayload,
        sharedEnvironment.refreshTokenSecret,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY,
        }
    );

    return accessToken;
}

export function verifyRefreshToken(token: string): JwtUserPayload | false {
    let verified: JwtUserPayload | false = false;

    jwt.verify(token, sharedEnvironment.refreshTokenSecret, (err, user) => {
        if (!err) {
            verified = user ? (user as JwtUserPayload) : false;
        }
    });

    return verified;
}

function extractJwtPayload(user: AuthUser): JwtUserPayload {
    const userData = user.getUserData();
    const jwtPayload = jwtPayloadFields.reduce<JwtUserPayload>(
        (acc, field) => ({ ...acc, [field]: userData[field] }),
        {} as JwtUserPayload
    );

    return jwtPayload;
}
