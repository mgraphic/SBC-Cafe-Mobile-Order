import Stripe from 'stripe';
import { LoggerLevel } from './logger';

export const sharedEnvironment = (): {
    env: string;
    level: LoggerLevel;
    redactedRegex: string[];
    redactedKeys: string[];
    accessTokenSecret: string;
    refreshTokenSecret: string;
    privateSharedApiKey: string;
    publishedSharedApiKey: string | null;
    aws: {
        accessKeyId?: string;
        secretAccessKey?: string;
        region: string;
        endpoint?: string;
    };
    stripeApi: {
        url: {
            protocol: Stripe.HttpProtocol | undefined;
            host: string | undefined;
            port: string | undefined;
        };
        secretKey: string;
    };
    realtime: {
        endpoint: string;
        path: string;
    };
    smtpConfig: string;
    brevo: {
        baseUrl: string;
        apiKey: string;
        paths: {
            transactionalSMS: string;
        };
    };
} => {
    const env = getEnvironmentVariable('APP_ENV', 'local');

    const privateSharedApiKey = getEnvironmentVariable(
        'PRIVATE_SHARED_API_KEY',
        env === 'local' ? 'private-shared-api-key' : '',
    );
    const publishedSharedApiKey = getEnvironmentVariable(
        'PUBLISHED_SHARED_API_KEY',
        null,
    );

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

    if (env !== 'local' && !privateSharedApiKey) {
        throw new Error(
            'PRIVATE_SHARED_API_KEY environment variable is required in non-local environments',
        );
    }

    const redactedRegex = getEnvironmentVariable(
        'REDACTED_REGEX',
        `/jwt=[A-Za-z0-9.+=-]+/i,/Bearer [A-Za-z0-9.+=-]+/i,/${privateSharedApiKey}/`,
    ).split(',');
    const redactedKeys = getEnvironmentVariable(
        'REDACTED_KEYS',
        'password,username,accessTokenSecret,refreshTokenSecret,jwt,x-internal-api-key',
    ).split(',');

    return {
        env,
        level: getEnvironmentVariable('LEVEL', 'info') as LoggerLevel,
        redactedRegex,
        redactedKeys,
        accessTokenSecret: getEnvironmentVariable(
            'ACCESS_TOKEN_SECRET',
            'access-token-secret',
        ),
        refreshTokenSecret: getEnvironmentVariable(
            'REFRESH_TOKEN_SECRET',
            'refresh-token-secret',
        ),
        privateSharedApiKey,
        publishedSharedApiKey,
        aws: {
            accessKeyId: getEnvironmentVariable(
                'AWS_ACCESS_KEY_ID',
                env === 'local' ? 'dummyaccesskey' : undefined,
            ),
            secretAccessKey: getEnvironmentVariable(
                'AWS_SECRET_ACCESS_KEY',
                env === 'local' ? 'dummysecretkey' : undefined,
            ),
            region: getEnvironmentVariable(
                'AWS_DEFAULT_REGION',
                'dummy-region',
            ),
            endpoint: getEnvironmentVariable(
                'AWS_ENDPOINT_URL',
                env === 'local' ? 'http://localhost:8000' : undefined,
            ),
        },
        stripeApi: {
            url: {
                protocol,
                host,
                port,
            },
            secretKey: getEnvironmentVariable('STRIPE_SECRET_KEY', ''),
        },
        realtime: {
            endpoint: getEnvironmentVariable(
                'REALTIME_GATEWAY_ENDPOINT_URL',
                'http://localhost:3200',
            ),
            path: getEnvironmentVariable('REALTIME_GATEWAY_PATH', '/socket.io'),
        },
        smtpConfig: getEnvironmentVariable(
            'SMTP_CONFIG',
            JSON.stringify({
                host: 'localhost',
                port: 1025,
                secure: false,
            }),
        ),
        brevo: {
            baseUrl: getEnvironmentVariable(
                'BREVO_BASE_URL',
                'https://api.brevo.com',
            ),
            apiKey: getEnvironmentVariable('BREVO_API_KEY', ''),
            paths: {
                transactionalSMS: getEnvironmentVariable(
                    'BREVO_TRANSACTIONAL_SMS_PATH',
                    '/v3/transactionalSMS/send',
                ),
            },
        },
    };
};

export function getEnvironmentVariable<T>(
    variable: string,
    defaultValue: T,
): string | T {
    const envValue = process?.env[variable];

    if (envValue !== undefined && envValue !== null) {
        return envValue;
    }

    return defaultValue;
}
