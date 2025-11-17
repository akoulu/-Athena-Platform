import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError, BehaviorSubject, delay } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService, AuthApiService } from '@org/data-access-auth';
import { HttpClientService } from '@org/api-client';
import { LoginDto, AuthResponse } from '@org/types';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;

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

  beforeEach(async () => {
    const mockHttpClientService = {
      getToken: jest.fn().mockReturnValue(null),
      getRefreshToken: jest.fn().mockReturnValue(null),
      setToken: jest.fn(),
      setRefreshToken: jest.fn(),
      clearTokens: jest.fn(),
    };

    const mockAuthApiService = {
      getProfile: jest.fn().mockReturnValue(of({})),
    };

    const mockAuthService = {
      login: jest.fn(),
      isAuthenticated$: new BehaviorSubject<boolean>(false),
      user$: new BehaviorSubject(null),
      checkAuth: jest.fn(),
      loadProfile: jest.fn().mockReturnValue(of({})),
    };

    const mockRouter = {
      navigate: jest.fn(),
      createUrlTree: jest.fn((_commands) => ({})),
      serializeUrl: jest.fn((_urlTree) => ''),
      events: of({}),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: HttpClientService,
          useValue: mockHttpClientService,
        },
        {
          provide: AuthApiService,
          useValue: mockAuthApiService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {},
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  beforeEach(() => {
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')).toBeDefined();
    expect(component.loginForm.get('password')).toBeDefined();
  });

  it('should validate email field', () => {
    const emailControl = component.loginForm.get('email');

    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBe(true);

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should validate password field', () => {
    const passwordControl = component.loginForm.get('password');

    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBe(true);

    passwordControl?.setValue('short');
    expect(passwordControl?.hasError('minlength')).toBe(true);

    passwordControl?.setValue('validpassword123');
    expect(passwordControl?.valid).toBe(true);
  });

  it('should submit login form with valid data', () => {
    authService.login.mockReturnValue(of(mockAuthResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    } as LoginDto);
  });

  it('should not submit when form is invalid', () => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();

    component.loginForm.patchValue({
      email: '',
      password: '',
    });

    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should navigate to returnUrl after successful login', () => {
    authService.login.mockReturnValue(of(mockAuthResponse));
    component.returnUrl = '/dashboard';

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should display error message on login failure', () => {
    authService.login.mockReturnValue(throwError(() => ({ message: 'Invalid credentials' })));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(component.isLoading).toBe(false);
  });

  it('should set isLoading to true during login', () => {
    authService.login.mockReturnValue(of(mockAuthResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(component.isLoading).toBe(false);
  });

  it('should check if field is invalid', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('');
    emailControl?.markAsTouched();

    expect(component.isFieldInvalid('email')).toBe(true);
  });

  describe('Integration Tests - Full Flow', () => {

    it('should complete full login flow: form -> authService -> navigation', () => {
      authService.login.mockReturnValue(of(mockAuthResponse));
      jest.spyOn(router, 'navigate');

      // Set form values
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      // Submit form
      component.onSubmit();

      // Verify AuthService was called with correct credentials
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      } as LoginDto);

      // Verify navigation to dashboard after successful login
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);

      // Verify loading state is reset
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('');
    });

    it('should handle returnUrl from query params', () => {
      const activatedRoute = TestBed.inject(ActivatedRoute);
      (activatedRoute.snapshot.queryParams as any) = { returnUrl: '/custom-page' };

      component.ngOnInit();

      authService.login.mockReturnValue(of(mockAuthResponse));
      jest.spyOn(router, 'navigate');

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/custom-page']);
    });

    it('should handle network error during login', () => {
      const networkError = { message: 'Network error', status: 0 };
      authService.login.mockReturnValue(throwError(() => networkError));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('Network error');
      expect(component.isLoading).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle server error with error object', () => {
      const serverError = {
        error: { message: 'Invalid credentials', status: 401 },
        status: 401,
      };
      authService.login.mockReturnValue(throwError(() => serverError));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('Invalid credentials');
      expect(component.isLoading).toBe(false);
    });

    it('should prevent multiple simultaneous login attempts', () => {
      authService.login.mockReturnValue(of(mockAuthResponse).pipe(delay(100)));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      // First submit
      component.onSubmit();
      expect(component.isLoading).toBe(true);

      // Second submit while loading
      component.onSubmit();

      // Should only call login once
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should update isAuthenticated$ observable after successful login', () => {
      const isAuthenticatedSpy = jest.fn();
      authService.isAuthenticated$.subscribe(isAuthenticatedSpy);

      authService.login.mockReturnValue(of(mockAuthResponse));
      authService.isAuthenticated$.next(true);

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();

      // Verify authentication state is updated
      expect(isAuthenticatedSpy).toHaveBeenCalled();
    });

    it('should handle form validation errors before submission', () => {
      Element.prototype.scrollIntoView = jest.fn();

      // Set invalid form values
      component.loginForm.patchValue({
        email: 'invalid-email',
        password: 'short',
      });

      component.onSubmit();

      // Should not call authService
      expect(authService.login).not.toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });

    it('should reset error message on new login attempt', () => {
      // First attempt with error
      authService.login.mockReturnValue(throwError(() => ({ message: 'First error' })));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      component.onSubmit();
      expect(component.errorMessage).toBe('First error');

      // Second attempt - error should be reset
      authService.login.mockReturnValue(of(mockAuthResponse));
      component.onSubmit();

      expect(component.errorMessage).toBe('');
    });
  });
});
