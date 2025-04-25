import { Request, Response } from 'express';
import {
    UsersService,
    AuthUser,
    generateAccessToken,
    generateRefreshToken,
    JWT_CLEARCOOKIE_OPTIONS,
    JWT_COOKIE_OPTIONS,
    verifyRefreshToken,
} from 'sbc-cafe-shared-module';

export async function login(req: Request, res: Response): Promise<void> {
    const usersService = new UsersService();
    const { username, password } = req.body;
    const { cookies } = req;

    if (!username || !password) {
        res.status(400).json({
            message: 'Username and password are required',
        });
        return;
    }

    const user = await AuthUser.createInstance(username);

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
            const foundUser = await usersService.getUserByRefreshToken(jwt);

            if (foundUser?.email === user.getUserName()) {
                // attempted token reuse
                refreshTokens = [];
            }

            if (foundUser && foundUser.email !== user.getUserName()) {
                // attempted hijacked token
                refreshTokens = [];
                await usersService.updateUser(foundUser.id, {
                    refreshTokens: [],
                });
            }

            res.clearCookie('jwt', JWT_CLEARCOOKIE_OPTIONS);
        }

        await usersService.updateUser(user.getUserId(), {
            refreshTokens: [...refreshTokens, refreshToken],
        });

        res.cookie('jwt', refreshToken, JWT_COOKIE_OPTIONS);
        res.json({ accessToken });
        return;
    }

    res.sendStatus(401);
}

export async function logout(req: Request, res: Response): Promise<void> {
    const usersService = new UsersService();
    const { cookies } = req;

    if (!cookies?.jwt) {
        res.sendStatus(204);
        return;
    }

    const refreshToken = cookies.jwt;
    const foundUser = await usersService.getUserByRefreshToken(refreshToken);

    if (!foundUser) {
        res.clearCookie('jwt', JWT_CLEARCOOKIE_OPTIONS);
        res.sendStatus(204);
        return;
    }

    await usersService.updateUser(foundUser.id, {
        refreshTokens: foundUser.refreshTokens.filter(
            (rt) => rt !== refreshToken
        ),
    });

    res.clearCookie('jwt', JWT_CLEARCOOKIE_OPTIONS);
    res.sendStatus(204);
}

export async function refresh(req: Request, res: Response): Promise<void> {
    const usersService = new UsersService();
    const { cookies } = req;

    if (!cookies?.jwt) {
        res.sendStatus(401);
        return;
    }

    const refreshToken = cookies.jwt;

    res.clearCookie('jwt', JWT_CLEARCOOKIE_OPTIONS);

    const foundUser = await usersService.getUserByRefreshToken(refreshToken);

    if (!foundUser) {
        const verified = verifyRefreshToken(refreshToken);

        if (verified === false) {
            res.sendStatus(403);
            return;
        }

        await usersService.updateUser(verified.id, {
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
        await usersService.updateUser(foundUser.id, {
            refreshTokens: [...refreshTokens],
        });
    }

    if (verified === false || verified.id !== foundUser.id) {
        res.sendStatus(403);
        return;
    }

    const user = await AuthUser.createInstance(foundUser.email);
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await usersService.updateUser(foundUser.id, {
        refreshTokens: [...refreshTokens, newRefreshToken],
    });

    res.cookie('jwt', newRefreshToken, JWT_COOKIE_OPTIONS);
    res.json({ accessToken });
}

export async function register(req: Request, res: Response): Promise<void> {
    res.status(200).json({
        message: 'Registration successful',
    });
}
