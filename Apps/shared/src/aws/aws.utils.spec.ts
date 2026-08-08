import { describe, expect, it } from '@jest/globals';
import { attributeMapToValues, attributeValueToValue } from './aws.utils';

describe('aws-utils', () => {
    it('should decode empty string attributes', () => {
        expect(attributeValueToValue<string>({ S: '' })).toBe('');
    });

    it('should decode false boolean attributes', () => {
        expect(attributeValueToValue<boolean>({ BOOL: false })).toBe(false);
    });

    it('should decode attribute maps with empty string values', () => {
        const item = {
            otp: { S: '' },
            isLocked: { BOOL: false },
            loginAttempts: { N: '0' },
        };

        expect(
            attributeMapToValues<{
                otp: string;
                isLocked: boolean;
                loginAttempts: number;
            }>(item),
        ).toEqual({
            otp: '',
            isLocked: false,
            loginAttempts: 0,
        });
    });
});
