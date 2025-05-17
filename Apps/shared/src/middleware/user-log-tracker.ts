import { RequestHandler, NextFunction, Request } from 'express';
import { TrackerLog } from '../tracker/tracker.model';
import { UserTrackerLogService } from '../tracker/user-tracker-log.service';

export function userLogTracker(): RequestHandler {
    return (req: Request, _: unknown, next: NextFunction): void => {
        const log: TrackerLog = {
            userId: req.user?.getUserId() || '',
            endpoint: req.url || '',
            ip: req.ip || '',
            userAgent: req.headers['user-agent'] || '',
        };

        new UserTrackerLogService().addLog(log);

        next();
    };
}
