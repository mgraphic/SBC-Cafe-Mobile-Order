import { config } from 'dotenv';
import { resolve } from 'path';
import {
    getEnvironmentVariable,
    sharedEnvironment,
} from 'sbc-cafe-shared-module';

config({ path: resolve(process.cwd(), '../../../.env') });

export const environment: typeof sharedEnvironment & {
    service: string;
    port: number;
} = {
    ...sharedEnvironment,
    service: 'auth-service',
    port: parseInt(getEnvironmentVariable('PORT', '3100'), 10),
};
