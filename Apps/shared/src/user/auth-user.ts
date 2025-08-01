import { IUser } from './user.model';
import { UsersService } from './users.service';
import { authenticateUser } from './user.utils';

export class AuthUser {
    private user: IUser | null;
    private authState: 'authenticated' | null = null;

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

        if (this.user?.passwordHash && authenticateUser(this.user, password)) {
            this.authState = 'authenticated';
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
