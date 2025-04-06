import 'dotenv/config';

export const environment: {
    port: number;
    accessTokenSecret: string;
    refreshTokenSecret: string;
    aws: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
        endpoint: string;
    };
} = {
    port: parseInt(process.env.PORT || '3100', 10),
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'access-token-secret',
    refreshTokenSecret:
        process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret',
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummyaccesskey',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummysecretkey',
        region: process.env.AWS_REGION || 'dummy-region',
        endpoint: process.env.AWS_ENDPOINT || 'http://localhost:8000',
    },
};
