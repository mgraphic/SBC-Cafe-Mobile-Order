import { Request, Response } from 'express';
import {
    IPageable,
    PAGINATED_DEFAULT_PAGESIZE,
    UsersService,
    UserTrackerLogService,
    UserTrackerLogsLookup,
} from 'sbc-cafe-shared-module';

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

export async function getUserLogs(req: Request, res: Response): Promise<void> {
    if (
        !(
            req.user?.hasPermission('USER') ||
            req.user?.hasPermission('USER_VIEW')
        )
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
