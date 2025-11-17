import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError, BehaviorSubject, delay } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService, AuthApiService } from '@org/data-access-auth';
import { HttpClientService } from '@org/api-client';
import { RegisterDto, AuthResponse } from '@org/types';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
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
      register: jest.fn(),
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
      imports: [RegisterComponent, HttpClientTestingModule],
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

    fixture = TestBed.createComponent(RegisterComponent);
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

  it('should initialize register form', () => {
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('email')).toBeDefined();
    expect(component.registerForm.get('username')).toBeDefined();
    expect(component.registerForm.get('password')).toBeDefined();
    expect(component.registerForm.get('confirmPassword')).toBeDefined();
  });

  it('should validate password match', () => {
    component.registerForm.patchValue({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(component.registerForm.hasError('passwordMismatch')).toBe(false);

    component.registerForm.patchValue({
      password: 'password123',
      confirmPassword: 'different',
    });

    expect(component.registerForm.hasError('passwordMismatch')).toBe(true);
  });

  it('should submit register form with valid data', () => {
    authService.register.mockReturnValue(of(mockAuthResponse));

    component.registerForm.patchValue({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'Test',
      lastName: 'User',
    });

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    } as RegisterDto);
  });

  it('should not submit when form is invalid', () => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();

    component.registerForm.patchValue({
      email: '',
      password: 'short',
      confirmPassword: 'different',
    });

    component.onSubmit();

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should navigate to home after successful registration', () => {
    authService.register.mockReturnValue(of(mockAuthResponse));

    component.registerForm.patchValue({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
    });

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should display error message on registration failure', () => {
    authService.register.mockReturnValue(throwError(() => ({ message: 'User already exists' })));

    component.registerForm.patchValue({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('User already exists');
    expect(component.isLoading).toBe(false);
  });

  describe('Integration with AuthService and Router', () => {
    it('should call authService.register with correct data', () => {
      authService.register.mockReturnValue(of(mockAuthResponse));

      component.registerForm.patchValue({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

      component.onSubmit();

      expect(authService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      } as RegisterDto);
    });

    it('should navigate to dashboard after successful registration', () => {
      authService.register.mockReturnValue(of(mockAuthResponse));
      jest.spyOn(router, 'navigate');

      component.registerForm.patchValue({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
      });

      component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should handle registration error and display message', () => {
      const error = { message: 'Registration failed', status: 500 };
      authService.register.mockReturnValue(throwError(() => error));

      component.registerForm.patchValue({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('Registration failed');
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Integration Tests - Full Flow', () => {

    it('should complete full registration flow: form -> authService -> navigation', () => {
      authService.register.mockReturnValue(of(mockAuthResponse));
      jest.spyOn(router, 'navigate');

      // Set form values
      component.registerForm.patchValue({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'New',
        lastName: 'User',
      });

      // Submit form
      component.onSubmit();

      // Verify AuthService was called with correct data
      expect(authService.register).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      } as RegisterDto);

      // Verify navigation to dashboard after successful registration
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);

      // Verify loading state is reset
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('');
    });

    it('should handle registration with optional fields', () => {
      authService.register.mockReturnValue(of(mockAuthResponse));

      component.registerForm.patchValue({
        email: 'user@example.com',
        username: 'user',
        password: 'password123',
        confirmPassword: 'password123',
        // firstName and lastName are optional
      });

      component.onSubmit();

      expect(authService.register).toHaveBeenCalledWith({
        email: 'user@example.com',
        username: 'user',
        password: 'password123',
        firstName: undefined,
        lastName: undefined,
      } as RegisterDto);
    });

    it('should handle network error during registration', () => {
      const networkError = { message: 'Network error', status: 0 };
      authService.register.mockReturnValue(throwError(() => networkError));

      component.registerForm.patchValue({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('Network error');
      expect(component.isLoading).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle duplicate email error', () => {
      const duplicateError = {
        error: { message: 'Email already exists', status: 409 },
        status: 409,
      };
      authService.register.mockReturnValue(throwError(() => duplicateError));

      component.registerForm.patchValue({
        email: 'existing@example.com',
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('Email already exists');
      expect(component.isLoading).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle duplicate username error', () => {
      const duplicateError = {
        error: { message: 'Username already taken', status: 409 },
        status: 409,
      };
      authService.register.mockReturnValue(throwError(() => duplicateError));

      component.registerForm.patchValue({
        email: 'new@example.com',
        username: 'existinguser',
        password: 'password123',
        confirmPassword: 'password123',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('Username already taken');
      expect(component.isLoading).toBe(false);
    });

    it('should prevent multiple simultaneous registration attempts', () => {
      authService.register.mockReturnValue(of(mockAuthResponse).pipe(delay(100)));

      component.registerForm.patchValue({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
      });

      // First submit
      component.onSubmit();
      expect(component.isLoading).toBe(true);

      // Second submit while loading
      component.onSubmit();

      // Should only call register once
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should validate password match before submission', () => {
      Element.prototype.scrollIntoView = jest.fn();

      component.registerForm.patchValue({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'differentpassword',
      });

      component.onSubmit();

      // Should not call authService due to password mismatch
      expect(authService.register).not.toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });

    it('should update isAuthenticated$ observable after successful registration', () => {
      const isAuthenticatedSpy = jest.fn();
      authService.isAuthenticated$.subscribe(isAuthenticatedSpy);

      authService.register.mockReturnValue(of(mockAuthResponse));
      authService.isAuthenticated$.next(true);

      component.registerForm.patchValue({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
      });

      component.onSubmit();

      // Verify authentication state is updated
      expect(isAuthenticatedSpy).toHaveBeenCalled();
    });

    it('should reset error message on new registration attempt', () => {
      // First attempt with error
      authService.register.mockReturnValue(throwError(() => ({ message: 'First error' })));

      component.registerForm.patchValue({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
      });

      component.onSubmit();
      expect(component.errorMessage).toBe('First error');

      // Second attempt - error should be reset
      authService.register.mockReturnValue(of(mockAuthResponse));
      component.onSubmit();

      expect(component.errorMessage).toBe('');
    });

    it('should handle all form validation errors before submission', () => {
      Element.prototype.scrollIntoView = jest.fn();

      // Set invalid form values
      component.registerForm.patchValue({
        email: 'invalid-email',
        username: 'ab', // too short
        password: 'short', // too short
        confirmPassword: 'different', // mismatch
      });

      component.onSubmit();

      // Should not call authService
      expect(authService.register).not.toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });
  });
});
