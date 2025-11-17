import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { HttpClientService } from '@org/api-client';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponse,
  UserProfile,
} from '@org/types';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpClientService: jest.Mocked<HttpClientService>;

  const mockAuthResponse: AuthResponse = {
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

  const mockUserProfile: UserProfile = {
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

  beforeEach(() => {
    const mockHttpClientService = {
      get: jest.fn(),
      post: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthApiService,
        {
          provide: HttpClientService,
          useValue: mockHttpClientService,
        },
      ],
    });

    service = TestBed.inject(AuthApiService);
    httpClientService = TestBed.inject(HttpClientService) as jest.Mocked<HttpClientService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should call httpClientService.post with correct parameters', (done) => {
      httpClientService.post.mockReturnValue(of(mockAuthResponse));

      service.login(loginDto).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(httpClientService.post).toHaveBeenCalledWith('/auth/login', loginDto);
          done();
        },
      });
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      password: 'password123',
      username: 'newuser',
    };

    it('should call httpClientService.post with correct parameters', (done) => {
      httpClientService.post.mockReturnValue(of(mockAuthResponse));

      service.register(registerDto).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(httpClientService.post).toHaveBeenCalledWith('/auth/register', registerDto);
          done();
        },
      });
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'refreshToken',
    };

    it('should call httpClientService.post with correct parameters', (done) => {
      httpClientService.post.mockReturnValue(of(mockAuthResponse));

      service.refreshToken(refreshTokenDto).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(httpClientService.post).toHaveBeenCalledWith('/auth/refresh', refreshTokenDto);
          done();
        },
      });
    });
  });

  describe('logout', () => {
    it('should call httpClientService.post without refresh token', (done) => {
      httpClientService.post.mockReturnValue(of(undefined));

      service.logout().subscribe({
        next: () => {
          expect(httpClientService.post).toHaveBeenCalledWith('/auth/logout', {});
          done();
        },
      });
    });

    it('should call httpClientService.post with refresh token', (done) => {
      httpClientService.post.mockReturnValue(of(undefined));

      service.logout('refreshToken').subscribe({
        next: () => {
          expect(httpClientService.post).toHaveBeenCalledWith('/auth/logout', {
            refreshToken: 'refreshToken',
          });
          done();
        },
      });
    });
  });

  describe('getProfile', () => {
    it('should call httpClientService.get with correct parameters', (done) => {
      httpClientService.get.mockReturnValue(of(mockUserProfile));

      service.getProfile().subscribe({
        next: (response) => {
          expect(response).toEqual(mockUserProfile);
          expect(httpClientService.get).toHaveBeenCalledWith('/auth/profile');
          done();
        },
      });
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      oldPassword: 'oldPassword123',
      newPassword: 'newPassword123',
    };

    it('should call httpClientService.post with correct parameters', (done) => {
      httpClientService.post.mockReturnValue(of(undefined));

      service.changePassword(changePasswordDto).subscribe({
        next: () => {
          expect(httpClientService.post).toHaveBeenCalledWith(
            '/auth/change-password',
            changePasswordDto
          );
          done();
        },
      });
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'user@example.com',
    };

    it('should call httpClientService.post with correct parameters', (done) => {
      httpClientService.post.mockReturnValue(of(undefined));

      service.forgotPassword(forgotPasswordDto).subscribe({
        next: () => {
          expect(httpClientService.post).toHaveBeenCalledWith(
            '/auth/forgot-password',
            forgotPasswordDto
          );
          done();
        },
      });
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'reset-token',
      newPassword: 'newPassword123',
    };

    it('should call httpClientService.post with correct parameters', (done) => {
      httpClientService.post.mockReturnValue(of(undefined));

      service.resetPassword(resetPasswordDto).subscribe({
        next: () => {
          expect(httpClientService.post).toHaveBeenCalledWith(
            '/auth/reset-password',
            resetPasswordDto
          );
          done();
        },
      });
    });
  });
});
