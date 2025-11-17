import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserEntity } from '@org/users';

describe('AuthController', () => {
  let controller: AuthController;

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

  const mockAuthResponse = {
    user: {
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      roles: [{ id: 'user', name: 'user', permissions: [] }],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
  };

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

  let mockAuthService: {
    register: jest.Mock;
    generateAuthResponse: jest.Mock;
    refreshToken: jest.Mock;
    logout: jest.Mock;
    getProfile: jest.Mock;
    changePassword: jest.Mock;
    forgotPassword: jest.Mock;
    resetPassword: jest.Mock;
  };

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn(),
      generateAuthResponse: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
      getProfile: jest.fn(),
      changePassword: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    (controller as unknown as { authService: typeof mockAuthService }).authService =
      mockAuthService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      password: 'password123',
      username: 'newuser',
      firstName: 'New',
      lastName: 'User',
    };

    it('should register a new user', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should throw ConflictException when user already exists', async () => {
      mockAuthService.register.mockRejectedValue(new ConflictException('User already exists'));

      await expect(controller.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login user and return auth response', async () => {
      const req = {
        user: mockUserEntity,
      } as any;

      mockAuthService.generateAuthResponse.mockReturnValue(mockAuthResponse);

      const result = await controller.login(req);

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.generateAuthResponse).toHaveBeenCalledWith(mockUserEntity);
    });
  });

  describe('refresh', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'refreshToken',
    };

    it('should refresh token and return new auth response', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockAuthResponse);

      const result = await controller.refresh(refreshTokenDto);

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token')
      );

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const req = {
        user: { id: 'user-1' },
      } as any;

      mockAuthService.logout.mockResolvedValue(undefined);

      await controller.logout(req);

      expect(mockAuthService.logout).toHaveBeenCalledWith('user-1', undefined);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const req = {
        user: { id: 'user-1' },
      } as any;

      mockAuthService.getProfile.mockResolvedValue(mockUserProfile);

      const result = await controller.getProfile(req);

      expect(result).toEqual(mockUserProfile);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith('user-1');
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      oldPassword: 'oldPassword123',
      newPassword: 'newPassword123',
    };

    it('should change user password', async () => {
      const req = {
        user: { id: 'user-1' },
      } as any;

      mockAuthService.changePassword.mockResolvedValue(undefined);

      await controller.changePassword(req, changePasswordDto);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith('user-1', changePasswordDto);
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'test@example.com',
    };

    it('should request password reset', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      await controller.forgotPassword(forgotPasswordDto);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'resetToken',
      newPassword: 'newPassword123',
    };

    it('should reset password', async () => {
      mockAuthService.resetPassword.mockResolvedValue(undefined);

      await controller.resetPassword(resetPasswordDto);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });
  });
});
