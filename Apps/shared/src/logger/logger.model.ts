export type AnyObject = { [key: string]: any };

export const loggerLevels = [
    'alert',
    'crit',
    'debug',
    'emerg',
    'error',
    'info',
    'notice',
    'warning',
] as const;

export type LoggerLevel = (typeof loggerLevels)[number];
