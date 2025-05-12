import 'dotenv/config';
import { LoggerLevel } from 'sbc-cafe-shared-module';

const env = getEnvironmentVariable('APP_ENV', 'local');
const redactedRegex = getEnvironmentVariable(
    'REDACTED_REGEX',
    '/jwt=[A-Za-z0-9.+=-]+/i'
).split(',');
const redactedKeys = getEnvironmentVariable(
    'REDACTED_KEYS',
    'password,username,accessTokenSecret,refreshTokenSecret,jwt'
).split(',');

export const environment: {
    service: string;
    level: LoggerLevel;
    env: string;
    port: number;
    accessToken: string | null;
    redactedRegex: string[];
    redactedKeys: string[];
} = {
    service: 'cafe-service',
    level: getEnvironmentVariable('LEVEL', 'info') as LoggerLevel,
    env,
    port: parseInt(getEnvironmentVariable('PORT', '3000'), 10),
    accessToken: getEnvironmentVariable('ACCESS_TOKEN', null),
    redactedRegex,
    redactedKeys,
};

function getEnvironmentVariable<T>(
    variable: string,
    defaultValue: T
): string | T {
    const envValue = process.env[variable];

    if (envValue !== undefined && envValue !== null && envValue.trim() !== '') {
        return envValue;
    }

    return defaultValue;
}
