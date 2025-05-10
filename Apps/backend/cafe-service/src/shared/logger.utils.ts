import { getLogger, stringToRegex } from 'sbc-cafe-shared-module';
import { environment } from '../environment';

export const logger = getLogger(
    environment.level,
    environment.service,
    environment.env,
    {
        redactedRegex: environment.redactedRegex.map((s) => stringToRegex(s)),
        redactedKeys: environment.redactedKeys,
    }
);
