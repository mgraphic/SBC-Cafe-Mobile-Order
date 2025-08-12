import { generateRandomString } from '@mgraphic/cipher-token';
import { Request, Response } from 'express';
import {
    IPageable,
    IUser,
    jwtPayloadFields,
    PAGINATED_DEFAULT_PAGESIZE,
    rbacPermissions,
    tokenizePassword,
    userRoles,
    UsersService,
    UserTrackerLogService,
    UserTrackerLogsLookup,
    Validator,
} from 'sbc-cafe-shared-module';
import { logger } from '../shared/logger.utils';

export async function getUsers(req: Request, res: Response): Promise<void> {
    if (!req.user?.hasPermission('USER')) {
        res.sendStatus(403);
        return;
    }

    const userService = new UsersService();
    const users = (await userService.getAllUsers()).map((user) => ({
        ...user,
        passwordHash: undefined,
        refreshTokens: undefined,
    }));

    res.status(200).json(users ?? []);
}

export async function getUser(req: Request, res: Response): Promise<void> {
    if (!req.user?.hasPermission('USER')) {
        res.sendStatus(403);
        return;
    }

    const email: string = req.params.email as string;

    if (!email) {
        res.status(400).json({ error: 'Email query parameter is required' });
        return;
    }

    const userService = new UsersService();
    const user = await userService.getUser(email);

    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    res.status(200).json({
        ...user,
        passwordHash: undefined,
        refreshTokens: undefined,
    });
}

export async function getUserById(req: Request, res: Response): Promise<void> {
    if (
        !req.user?.hasPermission('USER') ||
        !req.user?.hasPermission('USER_VIEW')
    ) {
        res.sendStatus(403);
        return;
    }

    const id: string = req.params.id as string;

    if (!id) {
        res.status(400).json({ error: 'ID query parameter is required' });
        return;
    }

    const userService = new UsersService();
    const user = await userService.getUserById(id);

    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    res.status(200).json({
        ...user,
        passwordHash: undefined,
        refreshTokens: undefined,
    });
}

export async function addUser(req: Request, res: Response): Promise<void> {
    if (
        !req.user?.hasPermission('USER') ||
        !req.user?.hasPermission('USER_ADD')
    ) {
        res.sendStatus(403);
        return;
    }

    const { email, firstName, lastName, isActive, role, permissions } =
        req.body as IUser;

    if (!email || !firstName || !lastName || !role || !permissions) {
        res.status(400).json({ error: 'Missing required user fields' });
        return;
    }

    if (
        !Array.isArray(permissions) ||
        (permissions.length > 0 &&
            permissions.every(
                (p) => Object.keys(rbacPermissions).includes(p) === false
            ))
    ) {
        res.status(400).json({ error: 'Permissions is invalid' });
        return;
    }

    if (!userRoles.includes(role)) {
        res.status(400).json({ error: 'Role is invalid' });
        return;
    }

    if (!Validator.email(email)) {
        res.status(400).json({ error: 'Email is invalid' });
        return;
    }

    if (
        typeof firstName !== 'string' ||
        typeof lastName !== 'string' ||
        firstName.trim().length === 0 ||
        lastName.trim().length === 0
    ) {
        res.status(400).json({ error: 'First name or last name is invalid' });
        return;
    }

    const userService = new UsersService();

    if (await userService.userExists(email)) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
    }

    const user: Omit<IUser, 'passwordHash' | 'refreshTokens'> = {
        id: generateRandomString(),
        createdAt: new Date().toISOString(),
        isActive: !!isActive,
        firstName,
        lastName,
        email,
        permissions,
        role,
    };

    const success = await userService.addUser(user);

    if (success) {
        res.status(201).json({
            message: 'User created successfully',
            data: user,
        });
        return;
    }

    res.status(500).json({ error: 'Failed to create user' });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
    if (
        !req.user?.hasPermission('USER') ||
        !req.user?.hasPermission('USER_EDIT')
    ) {
        res.sendStatus(403);
        return;
    }

    const id: string = req.params.id as string;

    if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
    }

    const userService = new UsersService();
    const user = await userService.getUserById(id);

    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    const updateData = ([...jwtPayloadFields, 'isActive'] as (keyof IUser)[])
        .filter(
            (field): boolean =>
                field in req.body && user[field] !== req.body[field]
        )
        .reduce(
            (obj, field) => ((obj[field] = req.body[field]), obj),
            {} as Partial<IUser>
        );

    userService.updateUser(user.id, updateData);

    res.status(200).json({ message: 'User updated successfully' });
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
    if (
        !req.user?.hasPermission('USER') ||
        !req.user?.hasPermission('USER_DELETE') ||
        req.user?.getUserId() === req.params.id
    ) {
        res.sendStatus(403);
        return;
    }

    const id: string = req.params.id as string;

    if (!id) {
        res.status(400).json({ error: 'ID query parameter is required' });
        return;
    }

    const userService = new UsersService();
    const user = await userService.getUserById(id);

    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    await userService.deleteUser(user.id);

    res.status(200).json({ message: 'User deleted successfully' });
}

export async function getUserLogs(req: Request, res: Response): Promise<void> {
    if (
        !req.user?.hasPermission('USER') ||
        !req.user?.hasPermission('USER_VIEW')
    ) {
        res.sendStatus(403);
        return;
    }

    const userLogService = new UserTrackerLogService();
    const lookup: UserTrackerLogsLookup | undefined = req.body.lookup;
    const lookupValue: string | undefined = req.body.lookupValue;
    const pagable: IPageable = {
        pageSize: req.body.pageSize ?? PAGINATED_DEFAULT_PAGESIZE,
        pageNumber: req.body.pageNumber ?? 1,
        totalItems: req.body.totalItems,
        totalPages: req.body.totalPages,
    };

    const result = await userLogService.getPaginatedLogs(
        pagable,
        lookup,
        lookupValue
    );

    res.status(200).json(result);
}

export async function canActivateUser(
    req: Request,
    res: Response
): Promise<void> {
    const id: string = req.params.id as string;

    if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
    }

    const userService = new UsersService();
    const user = await userService.getUserById(id);
    const errorResponse = checkActivateUser(user);

    if (errorResponse) {
        res.status(errorResponse.code).json({ error: errorResponse.error });
        return;
    }

    // If we reach this point, the user is authorized to activate the account
    res.status(200).json({
        message: 'User is authorized to activate account',
        data: { canActivate: true },
    });
}

export async function activateUser(req: Request, res: Response): Promise<void> {
    const id: string = req.params.id as string;

    if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
    }

    const userService = new UsersService();
    const user = await userService.getUserById(id);
    const errorResponse = checkActivateUser(user);

    if (errorResponse) {
        res.status(errorResponse.code).json({ error: errorResponse.error });
        return;
    }

    if (!req.body.password) {
        res.status(400).json({
            error: 'Password is required to activate account',
        });
        return;
    }

    // Activate the user account
    try {
        const passwordHash = tokenizePassword(user!, req.body.password);

        await userService.updateUser(user!.id, {
            passwordHash,
            refreshTokens: [],
        });
        res.status(200).json({
            message: 'User account activated successfully',
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to activate user account' });
        logger.error(error);
    }
}

const checkActivateUser = (
    user: IUser | undefined
): { error: string; code: number } | null => {
    if (!user) {
        return { code: 404, error: 'User not found' };
    }

    if (!user.isActive) {
        return { code: 400, error: 'Unable to activate user account' };
    }

    if (user.passwordHash) {
        return { code: 400, error: 'User account is already activated' };
    }

    return null;
};
