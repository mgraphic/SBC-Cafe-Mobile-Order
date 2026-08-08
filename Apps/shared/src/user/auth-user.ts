import { IUser } from './user.model';
import { UsersService } from './users.service';
import { authenticateUser } from './user.server-utils';

export class AuthUser {
    public static OTP_VALIDITY_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

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

    public validateOtp(otp: string): boolean {
        if (!this.user || !this.user.otp || !otp) {
            return false;
        }

        const [userOtp, userOtpTimestamp] = this.user.otp.split(':');

        if (!userOtp || !userOtpTimestamp) {
            return false;
        }

        const otpTimestamp = parseInt(userOtpTimestamp, 10);

        if (Date.now() - otpTimestamp > AuthUser.OTP_VALIDITY_DURATION) {
            return false; // OTP has expired
        }

        return otp === userOtp;
    }

    public loginOtp(otp: string): boolean {
        this.authState = null;

        if (this.user && this.validateOtp(otp)) {
            this.authState = 'authenticated';
        }

        try {
            const usersService = new UsersService();
            usersService.updateUser(this.user?.id || '', { otp: '' });
        } catch (error) {
            console.error('Error clearing OTP:', error);
        }

        return this.isAuthenticated();
    }
}
