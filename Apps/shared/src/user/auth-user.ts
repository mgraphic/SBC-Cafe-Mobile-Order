import { CipherTokenConfig, getDecipherToken } from '@mgraphic/cipher-token';
import { IUser } from './user.model';
import { UsersService } from './users.service';

export class AuthUser {
    private user: IUser | null;
    private authState: 'authenticated' | null = null;
    private cipherConfig = {
        tokenEncoding: 'hex',
    } as CipherTokenConfig;

    private constructor(user: IUser | null) {
        this.user = user;
    }

    public static async createInstance(email: string): Promise<AuthUser> {
        const usersService = new UsersService();
        const user = await usersService.getUser(email);
        return new AuthUser(user || null);
    }

    public isUser(): boolean {
        return !!this.user;
    }

    public isAuthenticated(): boolean {
        return this.authState === 'authenticated';
    }

    public login(password: string): boolean {
        this.authState = null;

        if (this.user?.passwordHash) {
            const decipher = getDecipherToken(this.cipherConfig);
            decipher.keyFromString(password);
            const result = decipher.untokenize(this.user.passwordHash);

            if (`${this.user.email}:${password}` === result) {
                this.authState = 'authenticated';
            }
        }

        return this.isAuthenticated();
    }

    public getUserData(): IUser {
        return this.user || ({} as IUser);
    }

    public getUserName(): string {
        return this.user?.email || '';
    }

    public getUserId(): string {
        return this.user?.id || '';
    }

    public getRefreshTokens(): string[] {
        return this.user?.refreshTokens || [];
    }
}
