import 'dotenv/config';

const env = getEnvironmentVariable('APP_ENV', 'local');

export const environment: {
    env: string;
    port: number;
    accessToken: string | null;
    aws: {
        accessKeyId?: string;
        secretAccessKey?: string;
        region: string;
        endpoint?: string;
    };
} = {
    env,
    port: parseInt(getEnvironmentVariable('PORT', '3000'), 10),
    accessToken: getEnvironmentVariable('ACCESS_TOKEN', null),
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
