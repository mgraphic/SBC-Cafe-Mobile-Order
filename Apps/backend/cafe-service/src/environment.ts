import { config } from 'dotenv';
import { resolve } from 'path';
import { LoggerLevel, sharedEnvironment, Stripe } from 'sbc-cafe-shared-module';

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

const stripeApiUrl = getEnvironmentVariable('STRIPE_BASE_URL', undefined);
const {
    protocol: rawProtocol,
    hostname: host,
    port,
} = stripeApiUrl
    ? new URL(stripeApiUrl)
    : { protocol: undefined, hostname: undefined, port: undefined };
const protocol = rawProtocol
    ? (rawProtocol.replace(':', '') as Stripe.HttpProtocol)
    : undefined;

export const environment: typeof sharedEnvironment & {
    service: string;
    level: LoggerLevel;
    env: string;
    port: number;
    redactedRegex: string[];
    redactedKeys: string[];
    stripeApi: {
        url: {
            protocol: Stripe.HttpProtocol | undefined;
            host: string | undefined;
            port: string | undefined;
        };
        secretKey: string;
    };
} = {
    ...sharedEnvironment,
    service: 'cafe-service',
    level: getEnvironmentVariable('LEVEL', 'info') as LoggerLevel,
    env,
    port: parseInt(getEnvironmentVariable('PORT', '3000'), 10),
    redactedRegex,
    redactedKeys,
    stripeApi: {
        url: {
            protocol,
            host,
            port,
        },
        secretKey: getEnvironmentVariable('STRIPE_SECRET_KEY', ''),
    },
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
