import { Request, Response } from 'express';
import {
    generateAccessToken,
    generateRefreshToken,
    JWT_CLEARCOOKIE_OPTIONS,
    JWT_COOKIE_OPTIONS,
    verifyRefreshToken,
} from '../shared/jwt-utils';
import { User } from '../shared/user';
import { usersService } from '../shared/users.service';

export function login(req: Request, res: Response): void {
    const { username, password } = req.body;
    const { cookies } = req;

    if (!username || !password) {
        res.status(400).json({
            message: 'Username and password are required',
        });
        return;
    }

    const user = new User(username);

    if (!user.isUser()) {
        res.status(401).json({
            message: 'Invalid username or password',
        });
        return;
    }

    user.login(password);

    if (user.isAuthenticated()) {
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        let refreshTokens: string[] = cookies?.jwt
            ? user.getRefreshTokens().filter((rt) => rt !== cookies.jwt)
            : user.getRefreshTokens();

        if (cookies?.jwt) {
            const { jwt } = cookies;
            const foundUser = usersService.getUserByRefreshToken(jwt);

            if (foundUser?.userName === user.getUserName()) {
                // attempted token reuse
                refreshTokens = [];
            }

            if (foundUser && foundUser.userName !== user.getUserName()) {
                // attempted hijacked token
                refreshTokens = [];
                usersService.updateUser(foundUser.userName, {
                    refreshTokens: [],
                });
            }

            res.clearCookie('jwt', JWT_CLEARCOOKIE_OPTIONS);
        }

        usersService.updateUser(user.getUserName(), {
            refreshTokens: [...refreshTokens, refreshToken],
        });

        res.cookie('jwt', refreshToken, JWT_COOKIE_OPTIONS);
        res.json({ accessToken });
        return;
    }

    res.sendStatus(401);
}

export function logout(req: Request, res: Response): void {
    const { cookies } = req;

    if (!cookies?.jwt) {
        res.sendStatus(204);
        return;
    }

    const refreshToken = cookies.jwt;
    const foundUser = usersService.getUserByRefreshToken(refreshToken);

    if (!foundUser) {
        res.clearCookie('jwt', JWT_CLEARCOOKIE_OPTIONS);
        res.sendStatus(204);
        return;
    }

    usersService.updateUser(foundUser.userName, {
        refreshTokens: foundUser.refreshTokens.filter(
            (rt) => rt !== refreshToken
        ),
    });

    res.clearCookie('jwt', JWT_CLEARCOOKIE_OPTIONS);
    res.sendStatus(204);
}

export function refresh(req: Request, res: Response): void {
    const { cookies } = req;

    if (!cookies?.jwt) {
        res.sendStatus(401);
        return;
    }

    const refreshToken = cookies.jwt;

    res.clearCookie('jwt', JWT_CLEARCOOKIE_OPTIONS);

    const foundUser = usersService.getUserByRefreshToken(refreshToken);

    if (!foundUser) {
        const verified = verifyRefreshToken(refreshToken);

        if (verified === false) {
            res.sendStatus(403);
            return;
        }

        usersService.updateUser(verified.userName, {
            refreshTokens: [],
        });

        res.sendStatus(403);
        return;
    }

    const refreshTokens = foundUser.refreshTokens.filter(
        (rt) => rt !== refreshToken
    );
    const verified = verifyRefreshToken(refreshToken);

    if (verified === false) {
        usersService.updateUser(foundUser.userName, {
            refreshTokens: [...refreshTokens],
        });
    }

    if (verified === false || verified.userName !== foundUser.userName) {
        res.sendStatus(403);
        return;
    }

    const user = new User(verified.userName);
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    usersService.updateUser(foundUser.userName, {
        refreshTokens: [...refreshTokens, newRefreshToken],
    });

    res.cookie('jwt', newRefreshToken, JWT_COOKIE_OPTIONS);
    res.json({ accessToken });
}

export function register(req: Request, res: Response): void {
    res.status(200).json({
        message: 'Registration successful',
    });
}
