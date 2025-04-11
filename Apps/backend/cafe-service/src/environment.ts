import 'dotenv/config';

export const environment: {
    port: number;
    accessToken: string | null;
    aws: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
        endpoint: string;
    };
} = {
    port: parseInt(process.env.PORT || '3000', 10),
    accessToken: process.env.ACCESS_TOKEN ?? null,
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummyaccesskey',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummysecretkey',
        region: process.env.AWS_REGION || 'dummy-region',
        endpoint: process.env.AWS_ENDPOINT || 'http://localhost:8000',
    },
};
