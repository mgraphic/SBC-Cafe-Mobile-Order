import jwt from 'jsonwebtoken';
import { environment } from '../environment';
import { User } from './user';
import { CookieOptions } from 'express';
import { JwtUserPayload } from './model';

// Tokens
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '8d';

export function generateAccessToken(user: User): string {
    const { userName, email, firstName, lastName } = user.getUserData();
    const accessToken = jwt.sign(
        { userName, email, firstName, lastName } as JwtUserPayload,
        environment.accessTokenSecret,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

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

export function generateRefreshToken(user: User): string {
    const { userName, email, firstName, lastName } = user.getUserData();
    const accessToken = jwt.sign(
        { userName, email, firstName, lastName } as JwtUserPayload,
        environment.refreshTokenSecret,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

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

// Cookies
export const JWT_COOKIE_EXPIRY = 8 * 24 * 60 * 60 * 1000; // 8 days
export const JWT_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: JWT_COOKIE_EXPIRY,
};
export const JWT_CLEARCOOKIE_OPTIONS: CookieOptions = JSON.parse(
    JSON.stringify({ JWT_COOKIE_OPTIONS, maxAge: undefined })
);
