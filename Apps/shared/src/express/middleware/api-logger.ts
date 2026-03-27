import { NextFunction, Request, RequestHandler } from 'express';
import { Logger } from 'winston';

/**
 * Middleware that logs incoming HTTP requests using the provided logger.
 *
 * @param logger - A Winston logger instance used for logging requests.
 * @returns An Express request handler that logs the incoming request and
 *          passes control to the next middleware in the stack.
 */

export function apiLogger(logger: Logger): RequestHandler {
    return (req: Request, _: unknown, next: NextFunction): void => {
        logger.info(req);
        next();
    };
}
