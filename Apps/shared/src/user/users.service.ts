import { DynamoDbService } from '../aws/dynamodb.service';
import { IUser } from './user.model';

export class UsersService {
    private readonly dynamoDbService = DynamoDbService.getInstance();

    public async getUser(email: string): Promise<IUser | undefined> {
        return (
            await this.dynamoDbService.getItem<IUser>(
                'Users',
                {
                    email: { operation: '=', value: email.toLowerCase() },
                },
                'EmailIndex'
            )
        )[0];
    }

    public async userExists(email: string): Promise<boolean> {
        return !!(await this.getUser(email));
    }

    public async addUser(user: IUser): Promise<void> {
        if (!(await this.userExists(user.email))) {
            await this.dynamoDbService.addItem('Users', user);
        }
    }

    public async updateUser(id: string, user: Partial<IUser>): Promise<void> {
        const existingUser = await this.dynamoDbService.getItem<IUser>(
            'Users',
            {
                id: { operation: '=', value: id },
            }
        );

        if (existingUser?.length > 0) {
            await this.dynamoDbService.updateItem('Users', { id }, user);
        }
    }

    public async deleteUser(id: string): Promise<void> {
        await this.dynamoDbService.deleteItem('Users', { id });
    }

    public async getAllUsers(): Promise<IUser[]> {
        return (await this.dynamoDbService.getAllItems<IUser>(
            'Users'
        )) as IUser[];
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
