import { config } from 'dotenv';
import { resolve } from 'path';
import { LoggerLevel, Stripe } from 'sbc-cafe-shared-module';

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

const stripeApiUrl = getEnvironmentVariable('STRIPE_API_URL', undefined);
const {
    protocol: rawProtocol,
    host,
    port,
} = stripeApiUrl
    ? new URL(stripeApiUrl)
    : { protocol: undefined, host: undefined, port: undefined };
const protocol = rawProtocol
    ? (rawProtocol.replace(':', '') as Stripe.HttpProtocol)
    : undefined;

export const environment: {
    service: string;
    level: LoggerLevel;
    env: string;
    port: number;
    accessToken: string | null;
    redactedRegex: string[];
    redactedKeys: string[];
    stripeApi: {
        url: {
            protocol: Stripe.HttpProtocol | undefined;
            host: string | undefined;
            port: string | undefined;
        };
        secretKey: string;
        baseUrl: string;
    };
} = {
    service: 'cafe-service',
    level: getEnvironmentVariable('LEVEL', 'info') as LoggerLevel,
    env,
    port: parseInt(getEnvironmentVariable('PORT', '3000'), 10),
    accessToken: getEnvironmentVariable('ACCESS_TOKEN', null),
    redactedRegex,
    redactedKeys,
    stripeApi: {
        url: {
            protocol,
            host,
            port,
        },
        secretKey: getEnvironmentVariable('STRIPE_SECRET_KEY', ''),
        baseUrl: getEnvironmentVariable(
            'STRIPE_BASE_URL',
            'https://api.stripe.com',
        ),
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
