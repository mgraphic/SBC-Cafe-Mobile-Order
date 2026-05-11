import { config } from 'dotenv';
import { resolve } from 'path';
import {
    getEnvironmentVariable,
    sharedEnvironment,
} from 'sbc-cafe-shared-module';

config({ path: resolve(process.cwd(), '../../../.env') });

export const environment: ReturnType<typeof sharedEnvironment> & {
    service: string;
    port: number;
    corsOrigins: string[];
} = {
    ...sharedEnvironment(),
    service: 'realtime-gateway',
    port: parseInt(getEnvironmentVariable('PORT', '3200'), 10),
    corsOrigins: getEnvironmentVariable('CORS_ORIGINS', 'http://localhost:4200')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
};
