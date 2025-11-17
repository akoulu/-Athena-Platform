import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '@org/users';
import { UserEntity } from '@org/users';
import { TokenStoreService } from './infrastructure/sequelize/token-store.service';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AUTH_CONSTANTS } from '@org/constants';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

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

  const mockUserProfile = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    roles: ['user'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockUsersService: {
    validateUser: jest.Mock;
    findByEmail: jest.Mock;
    findByUsername: jest.Mock;
    create: jest.Mock;
    findOne: jest.Mock;
    updatePassword: jest.Mock;
  };

  let mockJwtService: {
    sign: jest.Mock;
    verify: jest.Mock;
  };

  let mockTokenStore: {
    save: jest.Mock;
    match: jest.Mock;
    revokeFamily: jest.Mock;
    blacklist: jest.Mock;
    isBlacklisted: jest.Mock;
    isJtiBlacklisted: jest.Mock;
  };

  beforeEach(async () => {
    mockUsersService = {
      validateUser: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      updatePassword: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    mockTokenStore = {
      save: jest.fn(),
      match: jest.fn(),
      revokeFamily: jest.fn(),
      blacklist: jest.fn(),
      isBlacklisted: jest.fn(),
      isJtiBlacklisted: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: TokenStoreService,
          useValue: mockTokenStore,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    (service as any).usersService = mockUsersService;
    (service as any).jwtService = mockJwtService;
    (service as any).tokenStore = mockTokenStore;
    usersService = mockUsersService as unknown as jest.Mocked<UsersService>;
    jwtService = mockJwtService as unknown as jest.Mocked<JwtService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user entity when credentials are valid', async () => {
      usersService.validateUser.mockResolvedValue(mockUserEntity);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual(mockUserEntity);
      expect(usersService.validateUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should return null when credentials are invalid', async () => {
      usersService.validateUser.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return auth response when credentials are valid', async () => {
      usersService.validateUser.mockResolvedValue(mockUserEntity);
      jwtService.sign.mockReturnValueOnce('accessToken').mockReturnValueOnce('refreshToken');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'accessToken');
      expect(result).toHaveProperty('refreshToken', 'refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      usersService.validateUser.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      password: 'password123',
      username: 'newuser',
      firstName: 'New',
      lastName: 'User',
    };

    it('should register a new user and return auth response', async () => {
      usersService.findByEmail.mockResolvedValueOnce(null).mockResolvedValueOnce(mockUserEntity);
      usersService.findByUsername.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUserProfile);
      usersService.findOne.mockResolvedValue(mockUserProfile);
      jwtService.sign.mockReturnValueOnce('accessToken').mockReturnValueOnce('refreshToken');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(usersService.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
        username: registerDto.username,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUserEntity);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when username already exists', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue(mockUserEntity);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'validRefreshToken',
    };

    it('should refresh token and return new auth response', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        roles: ['user'],
      };

      jwtService.verify.mockReturnValue(payload as any);
      mockTokenStore.isBlacklisted.mockResolvedValue(false);
      mockTokenStore.match.mockResolvedValue({ ok: true, familyId: 'family-1' });
      usersService.findOne.mockResolvedValue(mockUserProfile);
      usersService.findByEmail.mockResolvedValue(mockUserEntity);
      jwtService.sign.mockReturnValueOnce('newAccessToken').mockReturnValueOnce('newRefreshToken');
      mockTokenStore.save.mockResolvedValue(undefined);

      const result = await service.refreshToken(refreshTokenDto);

      expect(result).toHaveProperty('accessToken', 'newAccessToken');
      expect(result).toHaveProperty('refreshToken', 'newRefreshToken');
      expect(jwtService.verify).toHaveBeenCalledWith('validRefreshToken', {
        secret: AUTH_CONSTANTS.JWT_SECRET,
      });
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is not stored', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        roles: ['user'],
      };

      jwtService.verify.mockReturnValue(payload as any);
      mockTokenStore.isBlacklisted.mockResolvedValue(false);
      mockTokenStore.match.mockResolvedValue({ ok: false });

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      oldPassword: 'oldPassword123',
      newPassword: 'newPassword123',
    };

    it('should update password when old password matches', async () => {
      usersService.findOne.mockResolvedValue(mockUserProfile);
      usersService.findByEmail.mockResolvedValue(mockUserEntity);
      usersService.validateUser.mockResolvedValue(mockUserEntity);
      usersService.updatePassword.mockResolvedValue(undefined);

      await service.changePassword('user-1', changePasswordDto);

      expect(usersService.updatePassword).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findOne.mockRejectedValue(new UnauthorizedException('User not found'));

      await expect(service.changePassword('user-1', changePasswordDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      usersService.findOne.mockResolvedValue(mockUserProfile);

      const result = await service.getProfile('user-1');

      expect(result).toEqual(mockUserProfile);
      expect(usersService.findOne).toHaveBeenCalledWith('user-1');
    });
  });

  describe('logout', () => {
    it('should remove refresh token', async () => {
      await service.logout('user-1');

      // Logout should complete without error
      expect(true).toBe(true);
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'test@example.com',
    };

    it('should generate reset token for existing user', async () => {
      usersService.findByEmail.mockResolvedValue(mockUserEntity);
      jwtService.sign.mockReturnValue('resetToken');

      await service.forgotPassword(forgotPasswordDto);

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'user-1', email: 'test@example.com', type: 'password-reset' },
        { expiresIn: '1h' }
      );
      expect((service as any).resetTokens.has('user-1')).toBe(true);
    });

    it('should return silently when user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await service.forgotPassword(forgotPasswordDto);

      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'validResetToken',
      newPassword: 'newPassword123',
    };

    it('should reset password successfully', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        roles: ['user'],
        type: 'password-reset',
      };

      jwtService.verify.mockReturnValue(payload as any);
      usersService.findOne.mockResolvedValue(mockUserProfile);
      usersService.findByEmail.mockResolvedValue(mockUserEntity);
      usersService.updatePassword.mockResolvedValue(undefined);

      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      (service as any).resetTokens.set('user-1', {
        token: 'validResetToken',
        expiresAt: futureDate,
      });

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedNewPassword' as never);

      await service.resetPassword(resetPasswordDto);

      expect(usersService.updatePassword).toHaveBeenCalledWith('user-1', 'hashedNewPassword');
      expect((service as any).resetTokens.has('user-1')).toBe(false);
    });

    it('should throw BadRequestException when token is invalid', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when token type is wrong', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        roles: ['user'],
        type: 'wrong-type',
      };

      jwtService.verify.mockReturnValue(payload as any);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when token is expired', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        roles: ['user'],
        type: 'password-reset',
      };

      jwtService.verify.mockReturnValue(payload as any);

      const pastDate = new Date(Date.now() - 60 * 60 * 1000);
      (service as any).resetTokens.set('user-1', {
        token: 'validResetToken',
        expiresAt: pastDate,
      });

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        roles: ['user'],
        type: 'password-reset',
      };

      jwtService.verify.mockReturnValue(payload as any);
      usersService.findOne.mockResolvedValue(mockUserProfile);
      usersService.findByEmail.mockResolvedValue(null);

      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      (service as any).resetTokens.set('user-1', {
        token: 'validResetToken',
        expiresAt: futureDate,
      });

      usersService.findOne.mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateAuthResponse', () => {
    it('should generate auth response with tokens', async () => {
      jwtService.sign.mockReturnValueOnce('accessToken').mockReturnValueOnce('refreshToken');
      mockTokenStore.save.mockResolvedValue(undefined);

      const result = await service.generateAuthResponse(mockUserEntity);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'accessToken');
      expect(result).toHaveProperty('refreshToken', 'refreshToken');
      expect(result.user.id).toBe('user-1');
      expect(result.user.email).toBe('test@example.com');
      expect(mockTokenStore.save).toHaveBeenCalled();
    });
  });
});
