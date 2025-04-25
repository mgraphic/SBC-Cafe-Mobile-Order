import 'dotenv/config';

const env = getEnvironmentVariable('APP_ENV', 'local');

export const environment: {
    env: string;
    port: number;
} = {
    env,
    port: parseInt(getEnvironmentVariable('PORT', '3100'), 10),
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
