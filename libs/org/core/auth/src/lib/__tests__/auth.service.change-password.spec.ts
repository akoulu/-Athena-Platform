import { Test } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '@org/users';
import { JwtService } from '@nestjs/jwt';
import { TokenStoreService } from '../infrastructure/sequelize/token-store.service';

describe('AuthService changePassword', () => {
  it('should update password when old password matches', async () => {
    const mockUsers = {
      findOne: jest.fn().mockResolvedValue({ id: 'u1', email: 'e@x', isActive: true }),
      findByEmail: jest
        .fn()
        .mockResolvedValue({ id: 'u1', email: 'e@x', password: 'hash', isActive: true }),
      validateUser: jest
        .fn()
        .mockResolvedValue({ id: 'u1', email: 'e@x', password: 'hash', isActive: true }),
      updatePassword: jest.fn().mockResolvedValue(undefined),
    } as Partial<UsersService>;

    const mockTokenStore = {
      save: jest.fn(),
      match: jest.fn(),
      revokeFamily: jest.fn(),
      blacklist: jest.fn(),
      isBlacklisted: jest.fn(),
      isJtiBlacklisted: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsers },
        { provide: JwtService, useValue: { sign: jest.fn(), verify: jest.fn() } },
        { provide: TokenStoreService, useValue: mockTokenStore },
      ],
    }).compile();

    const service = module.get(AuthService);
    (service as any).usersService = mockUsers;
    await expect(
      service.changePassword('u1', { oldPassword: 'old', newPassword: 'new' })
    ).resolves.toBeUndefined();
    expect(mockUsers.updatePassword).toHaveBeenCalled();
  });
});
