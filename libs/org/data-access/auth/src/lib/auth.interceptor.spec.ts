import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { HttpClientService } from '@org/api-client';
import { AuthService } from './auth.service';
import { of, throwError } from 'rxjs';
import { User } from '@org/types';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let httpClientService: jest.Mocked<HttpClientService>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    const mockHttpClientService = {
      getToken: jest.fn(),
      getRefreshToken: jest.fn(),
      setToken: jest.fn(),
      setRefreshToken: jest.fn(),
      clearTokens: jest.fn(),
    };

    const mockAuthService = {
      refreshToken: jest.fn(),
      logout: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
        {
          provide: HttpClientService,
          useValue: mockHttpClientService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    httpClientService = TestBed.inject(HttpClientService) as jest.Mocked<HttpClientService>;
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('should add Authorization header when token exists', () => {
      httpClientService.getToken.mockReturnValue('test-token');

      httpClient.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush({});
    });

    it('should not add Authorization header when token does not exist', () => {
      httpClientService.getToken.mockReturnValue(null);

      httpClient.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('Authorization')).toBeNull();
      req.flush({});
    });

    it('should handle 401 error and refresh token', () => {
      httpClientService.getToken.mockReturnValue('expired-token');
      httpClientService.getRefreshToken.mockReturnValue('refresh-token');
      authService.refreshToken.mockReturnValue(
        of({
          user: {} as User,
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        })
      );
      authService.logout.mockReturnValue(of(undefined));

      httpClient.get('/api/protected').subscribe({
        next: () => {
          // Test success case
        },
        error: () => {
          // Test error case
        },
      });

      const firstReq = httpMock.expectOne('/api/protected');
      firstReq.flush({}, { status: 401, statusText: 'Unauthorized' });

      const retryReq = httpMock.expectOne('/api/protected');
      expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-access-token');
      retryReq.flush({});
    });

    it('should logout when refresh token fails', () => {
      httpClientService.getToken.mockReturnValue('expired-token');
      httpClientService.getRefreshToken.mockReturnValue('invalid-refresh-token');
      authService.refreshToken.mockReturnValue(throwError(() => new Error('Invalid token')));
      authService.logout.mockReturnValue(of(undefined));

      httpClient.get('/api/protected').subscribe({
        next: () => {
          // Test success case
        },
        error: () => {
          // Test error case
        },
      });

      const firstReq = httpMock.expectOne('/api/protected');
      firstReq.flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(authService.logout).toHaveBeenCalled();
    });

    it('should not intercept /auth/refresh endpoint', () => {
      httpClientService.getToken.mockReturnValue('token');

      httpClient.post('/api/auth/refresh', {}).subscribe({
        next: () => void 0,
        error: () => void 0,
      });

      const req = httpMock.expectOne('/api/auth/refresh');
      req.flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(authService.refreshToken).not.toHaveBeenCalled();
    });

    it('should not intercept /auth/login endpoint', () => {
      httpClientService.getToken.mockReturnValue('token');

      httpClient.post('/api/auth/login', {}).subscribe({
        next: () => void 0,
        error: () => void 0,
      });

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(authService.refreshToken).not.toHaveBeenCalled();
    });
  });
});
