import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';
import { UserEntity } from '@org/users';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let mockAuthService: {
    validateUser: jest.Mock;
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

  beforeEach(async () => {
    mockAuthService = {
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    (strategy as any).authService = mockAuthService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user when credentials are valid', async () => {
      mockAuthService.validateUser.mockResolvedValue(mockUserEntity);

      const result = await strategy.validate('test@example.com', 'password123');

      expect(result).toEqual(mockUserEntity);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate('test@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        'test@example.com',
        'wrongpassword'
      );
    });
  });
});
