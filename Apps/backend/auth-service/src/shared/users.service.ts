import { IUser } from './model';
// @ts-ignore
import usersJson from './users.json' with { type: 'json' };

class UsersService {
    public readonly usersDb = new Map<string, IUser>();
    private static instance: UsersService;

    private constructor() {
        usersJson.forEach((user: IUser): void => {
            this.addUser(user);
        });
    }

    public static getInstance(): UsersService {
        if (!UsersService.instance) {
            UsersService.instance = new UsersService();
        }

        return UsersService.instance;
    }

    public getUser(username: string): IUser | undefined {
        return this.usersDb.get(username.toLowerCase());
    }

    public userExists(username: string): boolean {
        return this.usersDb.has(username.toLowerCase());
    }

    public addUser(user: IUser): void {
        if (!this.userExists(user.userName)) {
            this.usersDb.set(user.userName.toLowerCase(), user);
        }
    }

    public updateUser(username: string, user: Partial<IUser>): void {
        const existingUser = this.usersDb.get(username.toLowerCase());

        if (existingUser) {
            this.usersDb.set(username.toLowerCase(), {
                ...existingUser,
                ...user,
            });
        }
    }

    public deleteUser(username: string): void {
        this.usersDb.delete(username.toLowerCase());
    }

    public getAllUsers(): IUser[] {
        return Array.from(this.usersDb.values());
    }

    public getUserByRefreshToken(token: string): IUser | undefined {
        return this.getAllUsers().find((user: IUser): boolean =>
            user.refreshTokens.some((rt: string): boolean => rt === token)
        );
    }
}

export const usersService = UsersService.getInstance();
