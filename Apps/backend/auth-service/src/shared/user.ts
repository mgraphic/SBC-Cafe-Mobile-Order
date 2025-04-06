import { CipherTokenConfig, getDecipherToken } from '@mgraphic/cipher-token';
import { IUser } from './model';
import { usersService } from './users.service';

export class User {
    private userName: string;
    private user?: IUser;
    private authState: 'authenticated' | null = null;
    private cipherConfig = {
        tokenEncoding: 'hex',
    } as CipherTokenConfig;

    constructor(userName: string) {
        this.userName = userName.toLowerCase();
        this.fetchUser();
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

            if (`${this.userName}:${password}` === result) {
                this.authState = 'authenticated';
            }
        }

        return this.isAuthenticated();
    }

    public logout(): void {
        this.authState = null;
    }

    public getUserData(): IUser {
        return this.user || ({} as IUser);
    }

    public getUserName(): string {
        return this.userName;
    }

    public getRefreshTokens(): string[] {
        return this.user?.refreshTokens || [];
    }

    private fetchUser(): void {
        this.user = usersService.getUser(this.userName);
    }
}
