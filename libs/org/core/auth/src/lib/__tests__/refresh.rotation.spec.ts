import { Test } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '@org/users';
import { JwtService } from '@nestjs/jwt';
import { TokenStoreService } from '../infrastructure/sequelize/token-store.service';
import { AUTH_CONSTANTS } from '@org/constants';

describe('AuthService refresh rotation', () => {
  it('rotates and invalidates previous token', async () => {
    const userEntity = {
      id: 'u1',
      email: 'e@x',
      username: 'u',
      roles: [{ name: 'user' }],
      isActive: true,
    } as any;

    const mockUsers = {
      findOne: jest.fn().mockResolvedValue(userEntity),
      findByEmail: jest.fn().mockResolvedValue(userEntity),
    } as Partial<UsersService>;

    const realJwt = new JwtService({ secret: AUTH_CONSTANTS.JWT_SECRET });
    const tokenStore = {
      isBlacklisted: jest.fn().mockResolvedValue(false),
      match: jest.fn().mockResolvedValue({ ok: true, familyId: 'fam' }),
      revokeFamily: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue(undefined),
      isJtiBlacklisted: jest.fn().mockResolvedValue(false),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsers },
        { provide: JwtService, useValue: realJwt },
        { provide: TokenStoreService, useValue: tokenStore },
      ],
    }).compile();

    const service = module.get(AuthService);
    Object.defineProperty(service, 'jwtService', { value: realJwt, writable: true });
    Object.defineProperty(service, 'tokenStore', { value: tokenStore, writable: true });
    Object.defineProperty(service, 'usersService', { value: mockUsers, writable: true });
    const pair = await service.generateAuthResponse(userEntity);
    await service.refreshToken({ refreshToken: pair.refreshToken });
    expect(tokenStore.revokeFamily).toHaveBeenCalledWith(expect.any(String));
    expect(tokenStore.save).toHaveBeenCalled();
  });
});
