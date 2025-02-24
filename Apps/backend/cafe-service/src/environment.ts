import 'dotenv/config';

export const environment: {
    port: number;
    accessToken: string | null;
} = {
    port: parseInt(process.env.PORT || '3000', 10),
    accessToken: process.env.ACCESS_TOKEN ?? null,
};
