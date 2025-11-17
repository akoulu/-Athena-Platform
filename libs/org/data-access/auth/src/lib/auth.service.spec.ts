import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError, firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthApiService } from './auth-api.service';
import { HttpClientService } from '@org/api-client';
import {
  LoginDto,
  RegisterDto,
  AuthResponse,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UserProfile,
} from '@org/types';

describe('AuthService', () => {
  let service: AuthService;
  let authApiService: jest.Mocked<AuthApiService>;
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

  beforeEach(() => {
    const mockAuthApiService = {
      login: jest.fn(),
      register: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
      getProfile: jest.fn(),
      changePassword: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };

    const mockHttpClientService = {
      getToken: jest.fn(),
      setToken: jest.fn(),
      setRefreshToken: jest.fn(),
      getRefreshToken: jest.fn(),
      clearTokens: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        {
          provide: AuthApiService,
          useValue: mockAuthApiService,
        },
        {
          provide: HttpClientService,
          useValue: mockHttpClientService,
        },
      ],
    });

    service = TestBed.inject(AuthService);
    authApiService = TestBed.inject(AuthApiService) as jest.Mocked<AuthApiService>;
    httpClientService = TestBed.inject(HttpClientService) as jest.Mocked<HttpClientService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user and set auth state', (done) => {
      authApiService.login.mockReturnValue(of(mockAuthResponse));

      service.login(loginDto).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(httpClientService.setToken).toHaveBeenCalledWith('accessToken');
          expect(httpClientService.setRefreshToken).toHaveBeenCalledWith('refreshToken');
          expect(service.getCurrentUser()).toEqual(mockAuthResponse.user);
          expect(service.isAuthenticated()).toBe(true);
          done();
        },
      });
    });

    it('should clear auth state on login error', (done) => {
      authApiService.login.mockReturnValue(throwError(() => new Error('Login failed')));

      service.login(loginDto).subscribe({
        error: () => {
          expect(httpClientService.clearTokens).toHaveBeenCalled();
          expect(service.getCurrentUser()).toBeNull();
          expect(service.isAuthenticated()).toBe(false);
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
      firstName: 'New',
      lastName: 'User',
    };

    it('should register user and set auth state', (done) => {
      authApiService.register.mockReturnValue(of(mockAuthResponse));

      service.register(registerDto).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(httpClientService.setToken).toHaveBeenCalledWith('accessToken');
          expect(service.getCurrentUser()).toEqual(mockAuthResponse.user);
          done();
        },
      });
    });

    it('should clear auth state on register error', (done) => {
      authApiService.register.mockReturnValue(throwError(() => new Error('Registration failed')));

      service.register(registerDto).subscribe({
        error: () => {
          expect(httpClientService.clearTokens).toHaveBeenCalled();
          expect(service.getCurrentUser()).toBeNull();
          done();
        },
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token and update auth state', (done) => {
      httpClientService.getRefreshToken.mockReturnValue('refreshToken');
      authApiService.refreshToken.mockReturnValue(of(mockAuthResponse));

      service.refreshToken().subscribe({
        next: (response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(httpClientService.setToken).toHaveBeenCalledWith('accessToken');
          done();
        },
      });
    });

    it('should return error when no refresh token available', (done) => {
      httpClientService.getRefreshToken.mockReturnValue(null);

      service.refreshToken().subscribe({
        error: (error) => {
          expect(error.message).toBe('No refresh token available');
          done();
        },
      });
    });
  });

  describe('logout', () => {
    it('should logout user and clear auth state', (done) => {
      authApiService.logout.mockReturnValue(of(undefined));

      service.logout().subscribe({
        next: () => {
          expect(httpClientService.clearTokens).toHaveBeenCalled();
          expect(service.getCurrentUser()).toBeNull();
          expect(service.isAuthenticated()).toBe(false);
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

    it('should change password', (done) => {
      authApiService.changePassword.mockReturnValue(of(undefined));

      service.changePassword(changePasswordDto).subscribe({
        next: () => {
          expect(authApiService.changePassword).toHaveBeenCalledWith(changePasswordDto);
          done();
        },
      });
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'user@example.com',
    };

    it('should request password reset', (done) => {
      authApiService.forgotPassword.mockReturnValue(of(undefined));

      service.forgotPassword(forgotPasswordDto).subscribe({
        next: () => {
          expect(authApiService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
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

    it('should reset password', (done) => {
      authApiService.resetPassword.mockReturnValue(of(undefined));

      service.resetPassword(resetPasswordDto).subscribe({
        next: () => {
          expect(authApiService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
          done();
        },
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      (service as unknown as { userSubject: { next: (user: unknown) => void } }).userSubject.next(
        mockAuthResponse.user
      );

      const user = service.getCurrentUser();

      expect(user).toEqual(mockAuthResponse.user);
    });

    it('should return null when no user', () => {
      (service as unknown as { userSubject: { next: (user: null) => void } }).userSubject.next(
        null
      );

      const user = service.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when authenticated', () => {
      (
        service as unknown as { isAuthenticated$: { next: (value: boolean) => void } }
      ).isAuthenticated$.next(true);

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when not authenticated', () => {
      (
        service as unknown as { isAuthenticated$: { next: (value: boolean) => void } }
      ).isAuthenticated$.next(false);

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('checkAuth', () => {
    it('should load profile when token exists', (done) => {
      httpClientService.getToken.mockReturnValue('token');
      authApiService.getProfile.mockReturnValue(of(mockUserProfile));

      const newService = new AuthService(authApiService, httpClientService);

      setTimeout(() => {
        expect(authApiService.getProfile).toHaveBeenCalled();
        expect(newService.getCurrentUser()).not.toBeNull();
        done();
      }, 100);
    });

    it('should clear auth when no token', () => {
      httpClientService.getToken.mockReturnValue(null);

      const newService = new AuthService(authApiService, httpClientService);

      expect(newService.getCurrentUser()).toBeNull();
      expect(newService.isAuthenticated()).toBe(false);
    });

    it('should clear auth when profile load fails', (done) => {
      httpClientService.getToken.mockReturnValue('token');
      authApiService.getProfile.mockReturnValue(throwError(() => new Error('Profile load failed')));

      const newService = new AuthService(authApiService, httpClientService);

      setTimeout(() => {
        expect(authApiService.getProfile).toHaveBeenCalled();
        expect(newService.getCurrentUser()).toBeNull();
        expect(newService.isAuthenticated()).toBe(false);
        expect(httpClientService.clearTokens).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('loadProfile edge cases', () => {
    it('should handle profile with date strings for createdAt', (done) => {
      httpClientService.getToken.mockReturnValue('token');
      const profileWithDateString: UserProfile = {
        ...mockUserProfile,
        createdAt: new Date().toISOString() as unknown as Date,
        updatedAt: new Date().toISOString() as unknown as Date,
      };
      authApiService.getProfile.mockReturnValue(of(profileWithDateString));

      const newService = new AuthService(authApiService, httpClientService);

      setTimeout(() => {
        const user = newService.getCurrentUser();
        expect(user).not.toBeNull();
        expect(user?.createdAt).toBeInstanceOf(Date);
        expect(user?.updatedAt).toBeInstanceOf(Date);
        done();
      }, 100);
    });

    it('should handle profile with Date objects for createdAt', (done) => {
      httpClientService.getToken.mockReturnValue('token');
      const profileWithDateObject: UserProfile = {
        ...mockUserProfile,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      authApiService.getProfile.mockReturnValue(of(profileWithDateObject));

      const newService = new AuthService(authApiService, httpClientService);

      setTimeout(() => {
        const user = newService.getCurrentUser();
        expect(user).not.toBeNull();
        expect(user?.createdAt).toBeInstanceOf(Date);
        expect(user?.updatedAt).toBeInstanceOf(Date);
        done();
      }, 100);
    });

    it('should handle profile load error and clear auth', (done) => {
      httpClientService.getToken.mockReturnValue('token');
      authApiService.getProfile.mockReturnValue(throwError(() => new Error('Network error')));

      const newService = new AuthService(authApiService, httpClientService);

      setTimeout(() => {
        expect(newService.getCurrentUser()).toBeNull();
        expect(newService.isAuthenticated()).toBe(false);
        expect(httpClientService.clearTokens).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('user$ observable', () => {
    it('should emit user when user is set', async () => {
      authApiService.login.mockReturnValue(of(mockAuthResponse));

      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      const user = await firstValueFrom(service.user$);
      expect(user).toEqual(mockAuthResponse.user);
    });

    it('should emit null when user is cleared', async () => {
      // First set a user
      authApiService.login.mockReturnValue(of(mockAuthResponse));
      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      // Wait for user to be set
      await firstValueFrom(service.user$);

      // Then logout
      authApiService.logout.mockReturnValue(of(undefined));
      service.logout().subscribe();

      // Wait for user to be cleared
      const user = await firstValueFrom(service.user$);
      expect(user).toBeNull();
    });

    it('should emit initial null value', async () => {
      httpClientService.getToken.mockReturnValue(null);
      const newService = new AuthService(authApiService, httpClientService);

      const user = await firstValueFrom(newService.user$);
      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated$ observable', () => {
    it('should emit true when authenticated', async () => {
      authApiService.login.mockReturnValue(of(mockAuthResponse));

      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      const isAuthenticated = await firstValueFrom(service.isAuthenticated$);
      expect(isAuthenticated).toBe(true);
    });

    it('should emit false when not authenticated', async () => {
      httpClientService.getToken.mockReturnValue(null);
      const newService = new AuthService(authApiService, httpClientService);

      const isAuthenticated = await firstValueFrom(newService.isAuthenticated$);
      expect(isAuthenticated).toBe(false);
    });

    it('should emit false after logout', async () => {
      // First login
      authApiService.login.mockReturnValue(of(mockAuthResponse));
      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      // Wait for authentication
      await firstValueFrom(service.isAuthenticated$);

      // Then logout
      authApiService.logout.mockReturnValue(of(undefined));
      service.logout().subscribe();

      // Wait for authentication to be false
      const isAuthenticated = await firstValueFrom(service.isAuthenticated$);
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('refreshToken error handling', () => {
    it('should clear auth when refresh token fails with expired token error', (done) => {
      httpClientService.getRefreshToken.mockReturnValue('refreshToken');
      authApiService.refreshToken.mockReturnValue(
        throwError(() => ({ status: 401, message: 'Token expired' }))
      );

      service.refreshToken().subscribe({
        error: () => {
          expect(httpClientService.clearTokens).toHaveBeenCalled();
          expect(service.getCurrentUser()).toBeNull();
          expect(service.isAuthenticated()).toBe(false);
          done();
        },
      });
    });

    it('should clear auth when refresh token fails with invalid token error', (done) => {
      httpClientService.getRefreshToken.mockReturnValue('refreshToken');
      authApiService.refreshToken.mockReturnValue(
        throwError(() => ({ status: 401, message: 'Invalid token' }))
      );

      service.refreshToken().subscribe({
        error: () => {
          expect(httpClientService.clearTokens).toHaveBeenCalled();
          expect(service.getCurrentUser()).toBeNull();
          expect(service.isAuthenticated()).toBe(false);
          done();
        },
      });
    });

    it('should clear auth when refresh token fails with network error', (done) => {
      httpClientService.getRefreshToken.mockReturnValue('refreshToken');
      authApiService.refreshToken.mockReturnValue(throwError(() => new Error('Network error')));

      service.refreshToken().subscribe({
        error: () => {
          expect(httpClientService.clearTokens).toHaveBeenCalled();
          expect(service.getCurrentUser()).toBeNull();
          expect(service.isAuthenticated()).toBe(false);
          done();
        },
      });
    });
  });

  describe('logout error handling', () => {
    it('should clear auth even when logout API call fails', (done) => {
      authApiService.logout.mockReturnValue(throwError(() => new Error('Logout failed')));

      service.logout().subscribe({
        error: () => {
          expect(httpClientService.clearTokens).toHaveBeenCalled();
          expect(service.getCurrentUser()).toBeNull();
          expect(service.isAuthenticated()).toBe(false);
          done();
        },
      });
    });

    it('should clear auth when logout fails with network error', (done) => {
      authApiService.logout.mockReturnValue(throwError(() => new Error('Network error')));

      service.logout().subscribe({
        error: () => {
          expect(httpClientService.clearTokens).toHaveBeenCalled();
          expect(service.getCurrentUser()).toBeNull();
          expect(service.isAuthenticated()).toBe(false);
          done();
        },
      });
    });
  });
});
