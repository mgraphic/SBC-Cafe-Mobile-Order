import { dynamoDbService } from './dynamodb.service';
import { IUser } from './user.model';

export class UsersService {
    public async getUser(email: string): Promise<IUser | undefined> {
        return (
            await dynamoDbService.getSecondaryIndexItem<IUser>(
                'Users',
                'EmailIndex',
                {
                    email: { operation: '=', value: email.toLowerCase() },
                }
            )
        )[0];
    }

    public async userExists(email: string): Promise<boolean> {
        return !!(await this.getUser(email));
    }

    public async addUser(user: IUser): Promise<void> {
        if (!(await this.userExists(user.email))) {
            await dynamoDbService.addItem('Users', user);
        }
    }

    public async updateUser(id: string, user: Partial<IUser>): Promise<void> {
        const existingUser = await dynamoDbService.getItem<IUser>('Users', {
            id: { operation: '=', value: id },
        });

        if (existingUser?.length > 0) {
            await dynamoDbService.updateItem('Users', { id }, user);
        }
    }

    public async deleteUser(id: string): Promise<void> {
        await dynamoDbService.deleteItem('Users', { id });
    }

    public async getAllUsers(): Promise<IUser[]> {
        return (await dynamoDbService.getAllItems<IUser>('Users')) as IUser[];
    }

    public async getUserByRefreshToken(
        token: string
    ): Promise<IUser | undefined> {
        const users = await this.getAllUsers();

        return users.find((user: IUser): boolean =>
            user.refreshTokens.some((rt: string): boolean => rt === token)
        );
    }
}
