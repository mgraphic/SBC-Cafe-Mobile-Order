import { CookieOptions } from 'express';

export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '8d';

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
