import winston from 'winston';
import { AnyObject, LoggerLevel } from './logger.model';
import { SplunkHecTransport } from './splunk.transport';

// winston stores extra arguments passed to a leveled log method (e.g. logger.info('msg', 1))
// under this symbol instead of `info.meta` unless the last argument is a plain object.
const SPLAT = Symbol.for('splat');

/**
 * Creates a new winston logger with the given level and service name.
 *
 * Options:
 *
 * - `redact`: An object with two properties: `redactedKeys` and `redactedRegex`.
 *   `redactedKeys` is an array of strings that will be redacted from log messages.
 *   `redactedRegex` is an array of regex patterns that will be used to redact log messages.
 *   If a regex pattern matches the log message, the matched text will be replaced with
 *   `[REDACTED]`.
 *
 * @param level The log level of the logger.
 * @param service The name of the service that the logger is for.
 * @param environment The current environment (e.g. dev, prod).
 * @param redact An object with options for redacting log messages.
 * @returns A new winston logger instance.
 */
export function getLogger(
    level: LoggerLevel,
    service: string,
    environment: string,
    options: {
        redactedKeys?: string[];
        redactedRegex?: RegExp[];
        splunk?: {
            url?: string;
            token?: string;
            index?: string;
            source?: string;
            sourcetype?: string;
        };
    } = {},
): winston.Logger {
    const { redactedKeys, redactedRegex, splunk } = options;
    const { combine, timestamp, colorize, printf } = winston.format;
    const splunkUrl = splunk?.url?.trim();
    const splunkToken = splunk?.token?.trim();
    const transports: winston.transport[] = [
        new winston.transports.Console({
            format: combine(
                colorize(),
                printf((info) => {
                    let message = info.message as any;

                    switch (typeof message) {
                        case 'object':
                        case 'function':
                        case 'symbol':
                            message = stringify(message);
                    }

                    let meta = (info.meta as any) ?? (info as any)[SPLAT];

                    if (Array.isArray(meta) && meta.length === 1) {
                        meta = meta[0];
                    }

                    switch (typeof meta) {
                        case 'object':
                        case 'function':
                        case 'symbol':
                            meta = stringify(meta);
                    }

                    return `${info.timestamp} [${info.level}] [${info.service}] [${info.environment}] : ${message} ${meta ? `${meta}` : ''}`;
                }),
            ),
        }),
    ];

    if (splunkUrl && splunkToken) {
        transports.push(
            new SplunkHecTransport({
                url: splunkUrl,
                token: splunkToken,
                index: splunk?.index,
                source: splunk?.source ?? service,
                sourcetype: splunk?.sourcetype,
            }),
        );
    }

    return winston.createLogger({
        level,
        transports,
        format: combine(
            timestamp(),
            tagger({ service, environment }),
            redactor({ redactedKeys, redactedRegex }),
        ),
    });
}

const tagger = winston.format((info: any, meta: any = {}): any => ({
    ...info,
    ...meta,
}));

const redactor = winston.format((info, meta: any): any => {
    const { redactedKeys, redactedRegex } = meta;
    let message = info.message as any;

    if (redactedKeys) {
        message = deepRedactKeys(message, redactedKeys);
    }

    if (redactedRegex) {
        message = deepRedactByRegex(message, redactedRegex);
    }

    return {
        ...info,
        message,
    };
});

function deepRedactByRegex<T extends AnyObject>(
    obj: T,
    regexList: RegExp[],
    redactWith: any = '[REDACTED]',
    seen = new WeakMap(),
): T {
    if (obj === null || typeof obj !== 'object') {
        if (typeof obj === 'string') {
            for (const regex of regexList) {
                if (regex.test(obj)) {
                    return redactWith;
                }
            }
        }
        return obj;
    }

    if (seen.has(obj)) {
        return seen.get(obj);
    }

    if (Array.isArray(obj)) {
        const redactedArray = obj.map((item) =>
            deepRedactByRegex(item, regexList, redactWith, seen),
        );
        seen.set(obj, redactedArray);
        return redactedArray as any;
    }

    const redactedObj: AnyObject = {};
    seen.set(obj, redactedObj);

    for (const [key, value] of Object.entries(obj)) {
        redactedObj[key] = deepRedactByRegex(
            value,
            regexList,
            redactWith,
            seen,
        );
    }

    return redactedObj as T;
}

function deepRedactKeys<T extends AnyObject>(
    obj: T,
    keysToRedact: string[],
    redactWith: any = '[REDACTED]',
    seen = new WeakMap(),
): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (seen.has(obj)) {
        return seen.get(obj);
    }

    if (Array.isArray(obj)) {
        const redactedArray = obj.map((item) =>
            deepRedactKeys(item, keysToRedact, redactWith, seen),
        );
        seen.set(obj, redactedArray);
        return redactedArray as any;
    }

    const redactedObj: AnyObject = {};
    seen.set(obj, redactedObj);

    for (const [key, value] of Object.entries(obj)) {
        if (keysToRedact.includes(key)) {
            redactedObj[key] = redactWith;
        } else {
            redactedObj[key] = deepRedactKeys(
                value,
                keysToRedact,
                redactWith,
                seen,
            );
        }
    }

    return redactedObj as T;
}

function stringify(obj: any): string {
    const cache: any[] = [];
    const str = JSON.stringify(obj, (_, value: any): any => {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                return '[CIRCULAR]';
            }

            cache.push(value);
        }

        return value;
    });

    return str;
}

/**
 * Convert a string to a regular expression.
 *
 * If the string starts and ends with a slash, it is interpreted as a
 * regular expression with flags. The flags are the characters after the
 * last slash. For example, "/.+/i" is equivalent to `new RegExp('.*', 'i')`.
 *
 * If the string does not start and end with a slash, it is interpreted as a
 * regular expression without flags. For example, ".*" is equivalent to
 * `new RegExp('.*')`.
 *
 * @param pattern The string to convert.
 * @returns The converted regular expression.
 */
export function stringToRegex(pattern: string): RegExp {
    if (new RegExp('^/.*/[dgimsuvy]+$').test(pattern)) {
        const [flags, source] = pattern.split('/').reverse();
        return new RegExp(source, flags);
    }

    return new RegExp(pattern);
}
