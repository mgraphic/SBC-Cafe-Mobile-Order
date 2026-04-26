import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '../../../.env') });

const env = getEnvironmentVariable('APP_ENV', 'local');
const privateSharedApiKey = getEnvironmentVariable(
    'PRIVATE_SHARED_API_KEY',
    env === 'local' ? 'private-shared-api-key' : undefined,
);

if (!privateSharedApiKey) {
    throw new Error(
        'PRIVATE_SHARED_API_KEY environment variable is required in non-local environments',
    );
}
const publishedSharedApiKey = getEnvironmentVariable(
    'PUBLISHED_SHARED_API_KEY',
    null,
);

export const sharedEnvironment: {
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
    realtime: {
        endpoint: string;
        path: string;
    };
} = {
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
        region: getEnvironmentVariable('AWS_DEFAULT_REGION', 'dummy-region'),
        endpoint: getEnvironmentVariable(
            'AWS_ENDPOINT_URL',
            env === 'local' ? 'http://localhost:8000' : undefined,
        ),
    },
    realtime: {
        endpoint: getEnvironmentVariable(
            'REALTIME_GATEWAY_ENDPOINT_URL',
            'http://localhost:3200',
        ),
        path: getEnvironmentVariable('REALTIME_GATEWAY_PATH', '/socket.io'),
    },
};

function getEnvironmentVariable<T>(
    variable: string,
    defaultValue: T,
): string | T {
    const envValue = process?.env[variable];

    if (envValue !== undefined && envValue !== null && envValue.trim() !== '') {
        return envValue;
    }

    return defaultValue;
}
