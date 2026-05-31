import {
    CipherTokenConfig,
    getCipherToken,
    getDecipherToken,
} from '@mgraphic/cipher-token';
import { IUser, UserPasswordToken } from './user.model';

/**
 * Default cipher configuration for tokenization.
 */
export const cipherConfig = {
    tokenEncoding: 'hex',
} as CipherTokenConfig;

/**
 * Tokenizes a user's password for secure storage.
 *
 * @param user IUser object containing user details
 * @param password User's password
 * @returns string representing the tokenized password
 */
export function tokenizePassword(user: IUser, password: string): string {
    const cipher = getCipherToken(cipherConfig);
    cipher.keyFromString(password);
    return cipher.tokenize(`${user.email}:${password}`);
}

/**
 * Untokenizes a user's password to verify against the stored hash.
 *
 * @param user IUser object containing user details
 * @param password User's password
 * @returns UserPasswordToken representing the untokenized password
 */
export function untokenizePassword(
    user: IUser,
    password: string,
): UserPasswordToken {
    const decipher = getDecipherToken(cipherConfig);
    decipher.keyFromString(password);
    return decipher.untokenize(user.passwordHash) as UserPasswordToken;
}

/**
 * Authenticates a user by comparing the provided password with the stored password hash.
 *
 * @param user IUser object containing user details
 * @param password User's password
 * @returns boolean indicating if the authentication was successful
 */
export function authenticateUser(user: IUser, password: string): boolean {
    return `${user.email}:${password}` === untokenizePassword(user, password);
}
