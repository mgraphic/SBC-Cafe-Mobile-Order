import { Request, Response } from 'express';
import {
    UsersService,
    AuthUser,
    MailerService,
    generateAccessToken,
    generateRefreshToken,
    JWT_CLEARCOOKIE_OPTIONS,
    JWT_COOKIE_OPTIONS,
    verifyRefreshToken,
    SmsService,
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

    try {
        user.login(password);
    } catch (error) {
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();
            const isInvalidCredentialDecryptError =
                errorMessage.includes('unable to authenticate data') ||
                errorMessage.includes('unsupported state');

            if (isInvalidCredentialDecryptError) {
                res.status(401).json({
                    message: 'Invalid username or password',
                });
                return;
            }
        }

        console.error('Unexpected error during login:', error);
        res.sendStatus(500);
        return;
    }

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

export async function loginOtp(req: Request, res: Response): Promise<void> {
    const usersService = new UsersService();
    const { username, otp } = req.body;
    const { cookies } = req;

    if (!username || !otp) {
        res.status(400).json({
            message: 'Username and OTP are required',
        });
        return;
    }

    const user = await AuthUser.createInstance(username);
    const otpValid = user.validateOtp(otp);

    if (!user.isUser()) {
        res.status(401).json({
            message: 'Invalid username or OTP',
        });
        return;
    }

    if (!otpValid) {
        res.status(401).json({
            message: 'Invalid username or OTP',
        });
        return;
    }

    user.loginOtp(otp);

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

export async function getOtp(req: Request, res: Response): Promise<void> {
    const usersService = new UsersService();
    const { username, sendTo } = req.body;

    if (!username) {
        res.status(400).json({
            message: 'Username is required',
        });
        return;
    }

    const user = await AuthUser.createInstance(username);

    if (!user.isUser()) {
        res.status(401).json({
            message: 'Invalid username',
        });
        return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    await usersService.updateUser(user.getUserId(), {
        otp: `${otp}:${Date.now()}`, // Store OTP with timestamp
    });

    switch (sendTo) {
        case 'email':
            const mailerService = MailerService.getInstance();

            await mailerService.sendOtpEmail(
                user.getUserData().email,
                'Your OTP verification code',
                {
                    recipientName: user.getUserData().firstName,
                    otp: otp.toString(),
                    validityMinutes: AuthUser.OTP_VALIDITY_DURATION / 60000, // Convert milliseconds to minutes
                },
            );
            break;

        case 'sms':
            const smsService = new SmsService();
            await smsService.sendMessage({
                recipient: user.getUserData().mobile,
                content: `Your OTP code is ${otp}`,
                type: 'transactional',
                tag: 'otp',
                unicodeEnabled: false,
            });
            break;

        default:
            res.status(400).json({
                message: 'Invalid sendTo value. Must be "email" or "sms".',
            });
            return;
    }

    res.status(200).json({
        message: 'OTP generated successfully',
    });
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
            (rt) => rt !== refreshToken,
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
        (rt) => rt !== refreshToken,
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
