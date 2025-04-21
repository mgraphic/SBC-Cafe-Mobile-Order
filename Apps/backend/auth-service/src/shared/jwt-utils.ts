import jwt from 'jsonwebtoken';
import { environment } from '../environment';
import { AuthUser } from './auth-user';
import { CookieOptions } from 'express';
import { jwtPayloadFields, JwtUserPayload } from './user.model';

// Tokens
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '8d';

export function generateAccessToken(user: AuthUser): string {
    const jwtPayload = extractJwtPayload(user);
    const accessToken = jwt.sign(jwtPayload, environment.accessTokenSecret, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    return accessToken;
}

export function verifyAccessToken(token: string): JwtUserPayload | false {
    let verified: JwtUserPayload | false = false;

    jwt.verify(token, environment.accessTokenSecret, (err, user) => {
        if (!err) {
            verified = user ? (user as JwtUserPayload) : false;
        }
    });

    return verified;
}

export function generateRefreshToken(user: AuthUser): string {
    const jwtPayload = extractJwtPayload(user);
    const accessToken = jwt.sign(jwtPayload, environment.refreshTokenSecret, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    return accessToken;
}

export function verifyRefreshToken(token: string): JwtUserPayload | false {
    let verified: JwtUserPayload | false = false;

    jwt.verify(token, environment.refreshTokenSecret, (err, user) => {
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

// Cookies
export const JWT_COOKIE_EXPIRY = 8 * 24 * 60 * 60 * 1000; // 8 days
export const JWT_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: JWT_COOKIE_EXPIRY,
};
export const JWT_CLEARCOOKIE_OPTIONS: CookieOptions = JSON.parse(
    JSON.stringify({ ...JWT_COOKIE_OPTIONS, maxAge: undefined })
);
