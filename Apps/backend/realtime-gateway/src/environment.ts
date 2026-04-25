import { config } from 'dotenv';
import { resolve } from 'path';
import { LoggerLevel, sharedEnvironment } from 'sbc-cafe-shared-module';

config({ path: resolve(process.cwd(), '../../../.env') });

const env = getEnvironmentVariable('APP_ENV', 'local');
const redactedRegex = getEnvironmentVariable(
    'REDACTED_REGEX',
    '/jwt=[A-Za-z0-9.+=-]+/i,/Bearer [A-Za-z0-9.+=-]+/i',
).split(',');
const redactedKeys = getEnvironmentVariable(
    'REDACTED_KEYS',
    'password,username,accessTokenSecret,refreshTokenSecret,jwt',
).split(',');

export const environment: typeof sharedEnvironment & {
    service: string;
    level: LoggerLevel;
    env: string;
    port: number;
    redactedRegex: string[];
    redactedKeys: string[];
    corsOrigins: string[];
    socketPath: string;
} = {
    ...sharedEnvironment,
    service: 'realtime-gateway',
    level: getEnvironmentVariable('LEVEL', 'info') as LoggerLevel,
    env,
    port: parseInt(getEnvironmentVariable('PORT', '3200'), 10),
    redactedRegex,
    redactedKeys,
    corsOrigins: getEnvironmentVariable('CORS_ORIGINS', 'http://localhost:4200')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
    socketPath: getEnvironmentVariable('SOCKET_PATH', '/socket.io'),
};

function getEnvironmentVariable<T>(
    variable: string,
    defaultValue: T,
): string | T {
    const envValue = process.env[variable];

    if (envValue !== undefined && envValue !== null && envValue.trim() !== '') {
        return envValue;
    }

    return defaultValue;
}
