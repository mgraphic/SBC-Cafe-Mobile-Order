import 'dotenv/config';

const env = getEnvironmentVariable('APP_ENV', 'local');

export const sharedEnvironment: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    aws: {
        accessKeyId?: string;
        secretAccessKey?: string;
        region: string;
        endpoint?: string;
    };
} = {
    accessTokenSecret: getEnvironmentVariable(
        'ACCESS_TOKEN_SECRET',
        'access-token-secret'
    ),
    refreshTokenSecret: getEnvironmentVariable(
        'REFRESH_TOKEN_SECRET',
        'refresh-token-secret'
    ),
    aws: {
        accessKeyId: getEnvironmentVariable(
            'AWS_ACCESS_KEY_ID',
            env === 'local' ? 'dummyaccesskey' : undefined
        ),
        secretAccessKey: getEnvironmentVariable(
            'AWS_SECRET_ACCESS_KEY',
            env === 'local' ? 'dummysecretkey' : undefined
        ),
        region: getEnvironmentVariable('AWS_DEFAULT_REGION', 'dummy-region'),
        endpoint: getEnvironmentVariable(
            'AWS_ENDPOINT_URL',
            env === 'local' ? 'http://localhost:8000' : undefined
        ),
    },
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
