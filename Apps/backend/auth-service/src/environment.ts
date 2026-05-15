import { config } from 'dotenv';
import { resolve } from 'path';
import {
    getEnvironmentVariable,
    initializeSharedEnvironment,
    sharedEnvironment,
} from 'sbc-cafe-shared-module';

config({ path: resolve(process.cwd(), '../../../.env') });

// Initialize the shared environment after loading .env
initializeSharedEnvironment();

export const environment: ReturnType<typeof sharedEnvironment> & {
    service: string;
    port: number;
} = {
    ...sharedEnvironment(),
    service: 'auth-service',
    port: parseInt(getEnvironmentVariable('PORT', '3100'), 10),
};
