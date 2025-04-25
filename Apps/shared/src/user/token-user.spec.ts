import { TokenUser } from './token-user';
import { JwtUserPayload } from './user.model';

describe('TokenUser', () => {
    let user: JwtUserPayload;

    beforeEach(() => {
        user = {
            id: 'user-id',
            email: 'user@test',
            firstName: 'Test',
            lastName: 'User',
            createdAt: new Date().toISOString(),
            isActive: true,
            role: 'DEFAULT',
            permissions: [],
            refreshTokens: [],
        } as JwtUserPayload;
    });

    it('should create a TokenUser instance', () => {
        const tokenUser = new TokenUser(user);
        expect(tokenUser).toBeInstanceOf(TokenUser);
        expect(tokenUser.getUserId()).toBe(user.id);
        expect(tokenUser.getUserName()).toBe(user.email);
        expect(tokenUser.getUserData()).toEqual(user);
    });

    describe('default user', () => {
        beforeEach(() => {
            user.permissions = [];
        });

        it('should have no permissions', () => {
            const tokenUser = new TokenUser(user);
            expect(tokenUser.hasPermission('ORDER_ACCEPT')).toBe(false);
            expect(tokenUser.hasPermission('ORDER_COMPLETE')).toBe(false);
            expect(tokenUser.hasPermission('USER_VIEW')).toBe(false);
            expect(tokenUser.hasPermission('USER_ADD')).toBe(false);
        });

        it('should have added permissions', () => {
            user.permissions = ['ORDER_ACCEPT', 'USER_VIEW'];
            const tokenUser = new TokenUser(user);
            expect(tokenUser.hasPermission('ORDER_ACCEPT')).toBe(true);
            expect(tokenUser.hasPermission('ORDER_COMPLETE')).toBe(false);
            expect(tokenUser.hasPermission('USER_VIEW')).toBe(true);
            expect(tokenUser.hasPermission('USER_ADD')).toBe(false);
        });

        it('should have role based by hierarchy', () => {
            const tokenUser = new TokenUser(user);
            expect(tokenUser.hasRole('DEFAULT')).toBe(true);
            expect(tokenUser.hasRole('STAFF')).toBe(false);
            expect(tokenUser.hasRole('ADMIN')).toBe(false);
            expect(tokenUser.hasRole('OWNER')).toBe(false);
        });
    });

    describe('staff user', () => {
        beforeEach(() => {
            user.role = 'STAFF';
            user.permissions = [];
        });

        it('should have some permissions', () => {
            const tokenUser = new TokenUser(user);
            expect(tokenUser.hasPermission('ORDER_ACCEPT')).toBe(true);
            expect(tokenUser.hasPermission('ORDER_COMPLETE')).toBe(true);
            expect(tokenUser.hasPermission('ORDER_CANCEL')).toBe(false);
            expect(tokenUser.hasPermission('USER_VIEW')).toBe(false);
            expect(tokenUser.hasPermission('USER_ADD')).toBe(false);
        });

        it('should have added permissions', () => {
            user.permissions = ['ORDER_CANCEL', 'USER_VIEW'];
            const tokenUser = new TokenUser(user);
            expect(tokenUser.hasPermission('ORDER_CANCEL')).toBe(true);
            expect(tokenUser.hasPermission('USER_VIEW')).toBe(true);
            expect(tokenUser.hasPermission('USER_ADD')).toBe(false);
        });

        it('should have role based by hierarchy', () => {
            const tokenUser = new TokenUser(user);
            expect(tokenUser.hasRole('DEFAULT')).toBe(true);
            expect(tokenUser.hasRole('STAFF')).toBe(true);
            expect(tokenUser.hasRole('ADMIN')).toBe(false);
            expect(tokenUser.hasRole('OWNER')).toBe(false);
        });
    });

    describe('admin user', () => {
        beforeEach(() => {
            user.role = 'ADMIN';
            user.permissions = [];
        });

        it('should have some permissions', () => {
            const tokenUser = new TokenUser(user);
            expect(tokenUser.hasPermission('ORDER')).toBe(true);
            expect(tokenUser.hasPermission('ORDER_CANCEL')).toBe(true);
            expect(tokenUser.hasPermission('USER_VIEW')).toBe(true);
            expect(tokenUser.hasPermission('USER_ADD')).toBe(true);
            expect(tokenUser.hasPermission('USER_DELETE')).toBe(false);
            expect(tokenUser.hasPermission('USER')).toBe(false);
        });

        it('should have added permissions', () => {
            user.permissions = ['USER_DELETE'];
            const tokenUser = new TokenUser(user);
            expect(tokenUser.hasPermission('USER_DELETE')).toBe(true);
            expect(tokenUser.hasPermission('USER')).toBe(false);
        });

        it('should have role based by hierarchy', () => {
            const tokenUser = new TokenUser(user);
            expect(tokenUser.hasRole('DEFAULT')).toBe(true);
            expect(tokenUser.hasRole('STAFF')).toBe(true);
            expect(tokenUser.hasRole('ADMIN')).toBe(true);
            expect(tokenUser.hasRole('OWNER')).toBe(false);
        });
    });

    describe('owner user', () => {
        beforeEach(() => {
            user.role = 'OWNER';
            user.permissions = [];
        });

        it('should have some permissions', () => {
            const tokenUser = new TokenUser(user);
            expect(tokenUser.hasPermission('ORDER')).toBe(true);
            expect(tokenUser.hasPermission('ORDER_CANCEL')).toBe(true);
            expect(tokenUser.hasPermission('USER')).toBe(true);
            expect(tokenUser.hasPermission('USER_DELETE')).toBe(true);
        });

        it('should have role based by hierarchy', () => {
            const tokenUser = new TokenUser(user);
            expect(tokenUser.hasRole('DEFAULT')).toBe(true);
            expect(tokenUser.hasRole('STAFF')).toBe(true);
            expect(tokenUser.hasRole('ADMIN')).toBe(true);
            expect(tokenUser.hasRole('OWNER')).toBe(true);
        });
    });
});
