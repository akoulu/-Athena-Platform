import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '@org/users';
import { UserEntity } from '@org/users';
import { TokenStoreService } from '../infrastructure/sequelize/token-store.service';
import { JwtPayload } from '@org/types';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockUsersService: {
    findByEmail: jest.Mock;
  };

  let mockTokenStore: {
    isBlacklisted: jest.Mock;
    isJtiBlacklisted: jest.Mock;
  };

  const mockUserEntity: UserEntity = new UserEntity({
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    roles: [{ id: 'user', name: 'user', permissions: [] }],
    isActive: true,
  });

  const mockPayload: JwtPayload = {
    sub: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    roles: ['user'],
  };

  beforeEach(async () => {
    mockUsersService = {
      findByEmail: jest.fn(),
    };

    mockTokenStore = {
      isBlacklisted: jest.fn().mockResolvedValue(false),
      isJtiBlacklisted: jest.fn().mockResolvedValue(false),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: TokenStoreService,
          useValue: mockTokenStore,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    (strategy as any).usersService = mockUsersService;
    (strategy as any).tokenStore = mockTokenStore;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user profile when user exists and is active', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUserEntity);
      const mockReq = { headers: { authorization: 'Bearer token' } };

      const result = await strategy.validate(mockReq, mockPayload);

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        roles: ['user'],
      });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const mockReq = { headers: { authorization: 'Bearer token' } };

      await expect(strategy.validate(mockReq, mockPayload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = new UserEntity({
        ...mockUserEntity,
        isActive: false,
      });
      mockUsersService.findByEmail.mockResolvedValue(inactiveUser);
      const mockReq = { headers: { authorization: 'Bearer token' } };

      await expect(strategy.validate(mockReq, mockPayload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
